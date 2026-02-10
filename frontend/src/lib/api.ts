const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ─── Types ───────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    details?: Record<string, string[]>;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        unreadCount?: number;
    };
}

export class ApiError extends Error {
    status: number;
    details?: Record<string, string[]>;

    constructor(message: string, status: number, details?: Record<string, string[]>) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

// ─── Token Management ────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

// ─── Core Request ────────────────────────────

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || !json.success) {
        throw new ApiError(
            json.error || "An unexpected error occurred",
            response.status,
            json.details
        );
    }

    return json;
}

// ─── HTTP Methods ────────────────────────────

export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>) => {
        const query = params
            ? "?" + new URLSearchParams(params).toString()
            : "";
        return request<T>(`${endpoint}${query}`);
    },

    post: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),

    patch: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, {
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: "DELETE" }),
};
