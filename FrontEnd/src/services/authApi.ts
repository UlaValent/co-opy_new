import {
    clearAuthSession,
    getAuthSession,
    isAccessTokenExpired,
    isRefreshTokenExpired,
    setAuthSession,
    type AccountInfo,
    type AuthSession,
} from "./authSession";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

interface AuthResponse {
    token: string;
    expiresAtUtc: string;
    refreshToken: string;
    refreshTokenExpiresAtUtc: string;
    account: AccountInfo;
}

interface AuthCallResult {
    ok: boolean;
    message?: string;
    session?: AuthSession;
}

let refreshPromise: Promise<AuthSession | null> | null = null;

function toSession(data: AuthResponse): AuthSession {
    return {
        token: data.token,
        expiresAtUtc: data.expiresAtUtc,
        refreshToken: data.refreshToken,
        refreshTokenExpiresAtUtc: data.refreshTokenExpiresAtUtc,
        account: data.account,
    };
}

async function getErrorMessage(res: Response): Promise<string> {
    const text = await res.text();
    if (!text) return res.statusText;

    try {
        const parsed = JSON.parse(text) as {
            title?: string;
            detail?: string;
            errors?: Record<string, string[]>;
        };

        if (parsed.errors && typeof parsed.errors === "object") {
            const flattened = Object.values(parsed.errors)
                .flatMap(v => v)
                .filter(Boolean);
            if (flattened.length > 0) {
                return flattened.join(" ");
            }
        }

        if (parsed.detail) return parsed.detail;
        if (parsed.title) return parsed.title;
    } catch {
        // Not JSON; fall back to raw text.
    }

    return text;
}

export async function register(username: string, email: string, password: string): Promise<AuthCallResult> {
    const res = await fetch(`${API_URL}/account/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
        return { ok: false, message: await getErrorMessage(res) };
    }

    const payload = (await res.json()) as AuthResponse;
    const session = toSession(payload);
    setAuthSession(session);
    return { ok: true, session };
}

export async function login(email: string, password: string): Promise<AuthCallResult> {
    const res = await fetch(`${API_URL}/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        return { ok: false, message: await getErrorMessage(res) };
    }

    const payload = (await res.json()) as AuthResponse;
    const session = toSession(payload);
    setAuthSession(session);
    return { ok: true, session };
}

export async function refreshSession(): Promise<AuthSession | null> {
    const current = getAuthSession();
    if (!current || isRefreshTokenExpired(current)) {
        clearAuthSession();
        return null;
    }

    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(`${API_URL}/account/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: current.refreshToken }),
            });

            if (!res.ok) {
                clearAuthSession();
                return null;
            }

            const payload = (await res.json()) as AuthResponse;
            const session = toSession(payload);
            setAuthSession(session);
            return session;
        } catch {
            clearAuthSession();
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function getValidAccessToken(): Promise<string | null> {
    const session = getAuthSession();
    if (!session) return null;

    if (!isAccessTokenExpired(session)) {
        return session.token;
    }

    const refreshed = await refreshSession();
    return refreshed?.token ?? null;
}

export async function deleteAccount(): Promise<{ ok: boolean; message?: string }> {
    const token = await getValidAccessToken();
    if (!token) return { ok: false, message: "You are not logged in." };

    const res = await fetch(`${API_URL}/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        return { ok: false, message: await getErrorMessage(res) };
    }

    clearAuthSession();
    return { ok: true };
}

export async function logout(): Promise<void> {
    const session = getAuthSession();
    if (session) {
        const token = await getValidAccessToken();
        if (token) {
            await fetch(`${API_URL}/account/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ refreshToken: session.refreshToken }),
            }).catch(() => undefined);
        }
    }

    clearAuthSession();
}

export function hasSession(): boolean {
    return getAuthSession() !== null;
}
