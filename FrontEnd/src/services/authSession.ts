export interface AccountInfo {
    id: string;
    username: string;
    email: string;
}

export interface AuthSession {
    token: string;
    expiresAtUtc: string;
    account: AccountInfo;
}

const SESSION_KEY = "authSession";

export function getAuthSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as AuthSession;
        if (!parsed.token || !parsed.account?.username || !parsed.expiresAtUtc) return null;

        const expiresAtMs = Date.parse(parsed.expiresAtUtc);
        if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }

        return parsed;
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}

export function setAuthSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

export function getAuthToken(): string | null {
    return getAuthSession()?.token ?? null;
}

export function isAuthenticated(): boolean {
    return getAuthSession() !== null;
}
