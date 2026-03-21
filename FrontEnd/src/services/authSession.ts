export interface AccountInfo {
    id: string;
    username: string;
    email: string;
}

export interface AuthSession {
    token: string;
    expiresAtUtc: string;
    refreshToken: string;
    refreshTokenExpiresAtUtc: string;
    account: AccountInfo;
}

const SESSION_KEY = "authSession";

export function getAuthSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as AuthSession;
        if (!parsed.token ||
            !parsed.refreshToken ||
            !parsed.account?.username ||
            !parsed.expiresAtUtc ||
            !parsed.refreshTokenExpiresAtUtc) return null;

        const refreshExpiresAtMs = Date.parse(parsed.refreshTokenExpiresAtUtc);
        if (Number.isNaN(refreshExpiresAtMs) || refreshExpiresAtMs <= Date.now()) {
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

export function isAccessTokenExpired(session: AuthSession, skewSeconds = 20): boolean {
    const expiresAtMs = Date.parse(session.expiresAtUtc);
    if (Number.isNaN(expiresAtMs)) return true;
    return expiresAtMs <= Date.now() + skewSeconds * 1000;
}

export function isRefreshTokenExpired(session: AuthSession): boolean {
    const refreshExpiresAtMs = Date.parse(session.refreshTokenExpiresAtUtc);
    if (Number.isNaN(refreshExpiresAtMs)) return true;
    return refreshExpiresAtMs <= Date.now();
}

export function isAuthenticated(): boolean {
    return getAuthSession() !== null;
}
