import { clearAuthSession, getAuthSession, setAuthSession, type AccountInfo, type AuthSession } from "./authSession";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

interface AuthResponse {
    token: string;
    expiresAtUtc: string;
    account: AccountInfo;
}

interface AuthCallResult {
    ok: boolean;
    message?: string;
    session?: AuthSession;
}

function toSession(data: AuthResponse): AuthSession {
    return {
        token: data.token,
        expiresAtUtc: data.expiresAtUtc,
        account: data.account,
    };
}

export async function register(username: string, email: string, password: string): Promise<AuthCallResult> {
    const res = await fetch(`${API_URL}/account/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
        const text = await res.text();
        return { ok: false, message: text || res.statusText };
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
        const text = await res.text();
        return { ok: false, message: text || res.statusText };
    }

    const payload = (await res.json()) as AuthResponse;
    const session = toSession(payload);
    setAuthSession(session);
    return { ok: true, session };
}

export async function deleteAccount(): Promise<{ ok: boolean; message?: string }> {
    const token = getAuthSession()?.token;
    if (!token) return { ok: false, message: "You are not logged in." };

    const res = await fetch(`${API_URL}/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const text = await res.text();
        return { ok: false, message: text || res.statusText };
    }

    clearAuthSession();
    return { ok: true };
}

export function logout(): void {
    clearAuthSession();
}
