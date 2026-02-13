import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { api, setAccessToken } from "@/lib/api";

// ─── Types ───────────────────────────────────

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string | null;
    onboardingCompleted: boolean;
}

export interface Session {
    accessToken: string;
    refreshToken: string;
    expiresAt?: number;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
    signIn: (
        email: string,
        password: string,
        rememberSession?: boolean
    ) => Promise<{ needsOnboarding: boolean }>;
    signUp: (data: SignUpData) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

// ─── Context ─────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Storage Keys ────────────────────────────

const PERSISTENT_SESSION_KEY = "scholara_session";
const TEMP_SESSION_KEY = "scholara_session_temp";

function saveSession(session: Session, rememberSession: boolean) {
    if (rememberSession) {
        localStorage.setItem(PERSISTENT_SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem(TEMP_SESSION_KEY);
        return;
    }

    sessionStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(PERSISTENT_SESSION_KEY);
}

function loadSession(): { session: Session; rememberSession: boolean } | null {
    try {
        const persistent = localStorage.getItem(PERSISTENT_SESSION_KEY);
        if (persistent) {
            return { session: JSON.parse(persistent), rememberSession: true };
        }

        const temporary = sessionStorage.getItem(TEMP_SESSION_KEY);
        if (temporary) {
            return { session: JSON.parse(temporary), rememberSession: false };
        }

        return null;
    } catch {
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(PERSISTENT_SESSION_KEY);
    sessionStorage.removeItem(TEMP_SESSION_KEY);
}

async function syncSupabaseSession(session: Session | null) {
    if (!session) {
        await supabase.auth.signOut();
        return;
    }

    await supabase.auth.setSession({
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
    });
}

function hasRecoveryLinkParams() {
    if (typeof window === "undefined") return false;
    const url = new URL(window.location.href);
    const search = url.searchParams;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    return (
        search.get("type") === "recovery" ||
        hash.get("type") === "recovery" ||
        Boolean(search.get("token")) ||
        Boolean(search.get("token_hash")) ||
        Boolean(search.get("code")) ||
        Boolean(hash.get("access_token"))
    );
}

// ─── Provider ────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // Fetch current user profile from backend
    const fetchUser = useCallback(async (token: string): Promise<User | null> => {
        setAccessToken(token);
        try {
            const res = await api.get<User>("/auth/me");
            return res.data ?? null;
        } catch {
            return null;
        }
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            const storedSession = loadSession();
            if (!storedSession) {
                // Keep recovery-link sessions alive for /reset-password flow.
                if (!hasRecoveryLinkParams()) {
                    await syncSupabaseSession(null);
                }
                setAccessToken(null);
                setState((s) => ({ ...s, isLoading: false }));
                return;
            }
            const { session, rememberSession } = storedSession;

            try {
                await syncSupabaseSession(session);
            } catch {
                // Continue with backend session validation even if Supabase sync fails.
            }

            // Try to use existing token
            const user = await fetchUser(session.accessToken);
            if (user) {
                setState({
                    user,
                    session,
                    isLoading: false,
                    isAuthenticated: true,
                });
                return;
            }

            // Token expired — try refresh
            try {
                const res = await api.post<{
                    accessToken: string;
                    refreshToken: string;
                    expiresAt: number;
                }>("/auth/refresh", { refreshToken: session.refreshToken });

                if (res.data) {
                    const newSession: Session = {
                        accessToken: res.data.accessToken,
                        refreshToken: res.data.refreshToken,
                        expiresAt: res.data.expiresAt,
                    };
                    saveSession(newSession, rememberSession);
                    try {
                        await syncSupabaseSession(newSession);
                    } catch {
                        // no-op
                    }
                    const refreshedUser = await fetchUser(newSession.accessToken);
                    setState({
                        user: refreshedUser,
                        session: newSession,
                        isLoading: false,
                        isAuthenticated: !!refreshedUser,
                    });
                    return;
                }
            } catch {
                // Refresh failed
            }

            // Both failed — clear session
            clearSession();
            setAccessToken(null);
            await syncSupabaseSession(null);
            setState({ user: null, session: null, isLoading: false, isAuthenticated: false });
        };

        initAuth();
    }, [fetchUser]);

    // ─── Auth Methods ────────────────────────────

    const signIn = useCallback(
        async (
            email: string,
            password: string,
            rememberSession = true
        ): Promise<{ needsOnboarding: boolean }> => {
            const res = await api.post<{
                session: Session;
                user: User | null;
            }>("/auth/signin", { email, password });

            if (!res.data?.session) {
                throw new Error("Sign in failed");
            }

            const session: Session = {
                accessToken: res.data.session.accessToken,
                refreshToken: res.data.session.refreshToken,
                expiresAt: res.data.session.expiresAt,
            };

            saveSession(session, rememberSession);
            setAccessToken(session.accessToken);
            try {
                await syncSupabaseSession(session);
            } catch {
                // no-op
            }

            // Fetch full profile
            const user = await fetchUser(session.accessToken);
            setState({
                user,
                session,
                isLoading: false,
                isAuthenticated: true,
            });

            return { needsOnboarding: !user?.onboardingCompleted };
        },
        [fetchUser]
    );

    const signUp = useCallback(
        async (data: SignUpData) => {
            await api.post("/auth/signup", data);
            // After signup, auto sign in
            await signIn(data.email, data.password, true);
        },
        [signIn]
    );

    const signOut = useCallback(async () => {
        try {
            await api.post("/auth/signout");
        } catch {
            // ignore
        }
        clearSession();
        setAccessToken(null);
        try {
            await syncSupabaseSession(null);
        } catch {
            // no-op
        }
        setState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
        });
    }, []);

    const refreshUser = useCallback(async () => {
        if (!state.session) return;
        const user = await fetchUser(state.session.accessToken);
        if (user) {
            setState((s) => ({ ...s, user }));
        }
    }, [state.session, fetchUser]);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                signIn,
                signUp,
                signOut,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
