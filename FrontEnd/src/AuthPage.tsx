import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteAccount, login, logout, logoutAllSessions, register } from "./services/authApi";
import { getAuthSession } from "./services/authSession";

interface AuthLocationState {
    from?: string;
}

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");
    const [pending, setPending] = useState(false);

    const session = getAuthSession();
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const passwordMinLength = 8;

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    const passwordLooksValid = password.length >= passwordMinLength;
    const usernameLooksValid = mode === "login" || trimmedUsername.length >= 3;

    const validationMessage =
        mode === "register" && !usernameLooksValid
            ? "Username must be at least 3 characters."
            : !emailLooksValid
                ? "Please enter a valid email address."
                : !passwordLooksValid
                    ? `Password must be at least ${passwordMinLength} characters.`
                    : "";

    const canSubmit = !pending && !!trimmedEmail && password.length > 0 && (mode === "login" || !!trimmedUsername) && !validationMessage;

    const targetRoute = useMemo(() => {
        const state = location.state as AuthLocationState | null;
        return state?.from && state.from.startsWith("/") ? state.from : "/";
    }, [location.state]);

    const handleAuth = async () => {
        if (validationMessage) {
            setStatus(validationMessage);
            return;
        }

        setPending(true);
        setStatus(mode === "login" ? "Signing you in..." : "Creating your account...");

        const result = mode === "login"
            ? await login(trimmedEmail, password)
            : await register(trimmedUsername, trimmedEmail, password);

        setPending(false);

        if (!result.ok || !result.session) {
            setStatus(result.message ?? "Authentication failed.");
            return;
        }

        setStatus(`Welcome, ${result.session.account.username}. Redirecting...`);
        setPassword("");
        navigate(targetRoute, { replace: true });
    };

    const handleLogout = async () => {
        setPending(true);
        setStatus("Signing out...");
        await logout();
        setPending(false);
        setStatus("Signed out.");
    };

    const handleLogoutAll = async () => {
        setPending(true);
        setStatus("Ending all sessions...");
        const result = await logoutAllSessions();
        setPending(false);
        setStatus(result.ok ? "All sessions ended." : (result.message ?? "Could not end all sessions."));
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Delete your account permanently?");
        if (!confirmed) return;

        setPending(true);
        setStatus("Deleting account...");
        const result = await deleteAccount();
        setPending(false);
        setStatus(result.ok ? "Account deleted." : (result.message ?? "Could not delete account."));
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "radial-gradient(circle at 20% 20%, #ffd36f 0%, #ff9f1a 35%, #8f2b00 100%)",
            fontFamily: "'Jersey 25', sans-serif"
        }}>
            <div style={{
                width: "min(520px, 100%)",
                borderRadius: "22px",
                border: "3px solid #7a2500",
                background: "rgba(255, 239, 202, 0.96)",
                boxShadow: "0 28px 55px rgba(58, 15, 0, 0.35)",
                padding: "26px"
            }}>
                <h1 style={{ margin: 0, color: "#6d1f00", fontSize: "56px", lineHeight: 1 }}>Co-opy Auth</h1>
                <p style={{ marginTop: "8px", color: "#a04300", fontSize: "24px" }}>
                    One clean place to sign in, register, and manage your sessions.
                </p>

                {session ? (
                    <>
                        <div style={{
                            borderRadius: "14px",
                            border: "2px solid #cf7a00",
                            background: "#fff9ec",
                            padding: "14px",
                            color: "#7a2500",
                            fontSize: "24px",
                            marginBottom: "12px"
                        }}>
                            Signed in as {session.account.username} ({session.account.email})
                        </div>
                        <div style={{ display: "grid", gap: "10px" }}>
                            <button disabled={pending} onClick={() => navigate(targetRoute, { replace: true })}>Continue</button>
                            <button disabled={pending} onClick={handleLogout}>Logout Current Session</button>
                            <button disabled={pending} onClick={handleLogoutAll}>Logout All Sessions</button>
                            <button disabled={pending} onClick={handleDelete}>Delete Account</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                            <button disabled={pending || mode === "login"} onClick={() => setMode("login")}>Login</button>
                            <button disabled={pending || mode === "register"} onClick={() => setMode("register")}>Register</button>
                        </div>

                        {mode === "register" && (
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                style={{ width: "100%", marginBottom: "10px" }}
                                disabled={pending}
                            />
                        )}

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            style={{ width: "100%", marginBottom: "10px" }}
                            disabled={pending}
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            style={{ width: "100%", marginBottom: "10px" }}
                            disabled={pending}
                        />

                        <button onClick={handleAuth} disabled={!canSubmit} style={{ width: "100%" }}>
                            {mode === "login" ? "Login" : "Create Account"}
                        </button>

                        {validationMessage && (
                            <div style={{ marginTop: "10px", fontSize: "20px", color: "#8f2b00" }}>
                                {validationMessage}
                            </div>
                        )}
                    </>
                )}

                {status && (
                    <div style={{ marginTop: "12px", fontSize: "22px", color: "#7a2500" }}>
                        {status}
                    </div>
                )}

                <div style={{ marginTop: "14px", fontSize: "22px" }}>
                    <Link to="/" style={{ color: "#7a2500" }}>Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
