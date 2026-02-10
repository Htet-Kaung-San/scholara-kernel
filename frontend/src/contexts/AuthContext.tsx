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
    signIn: (email: string, password: string) => Promise<{ needsOnboarding: boolean }>;
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

const SESSION_KEY = "scholara_session";

function saveSession(session: Session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): Session | null {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
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
            const session = loadSession();
            if (!session) {
                setState((s) => ({ ...s, isLoading: false }));
                return;
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
                    saveSession(newSession);
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
            setState({ user: null, session: null, isLoading: false, isAuthenticated: false });
        };

        initAuth();
    }, [fetchUser]);

    // ─── Auth Methods ────────────────────────────

    const signIn = useCallback(
        async (email: string, password: string): Promise<{ needsOnboarding: boolean }> => {
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

            saveSession(session);
            setAccessToken(session.accessToken);

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
            await signIn(data.email, data.password);
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
