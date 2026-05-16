import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteAccount, login, logout, register } from "./services/authApi";
import { getAuthSession } from "./services/authSession";
import type { CSSProperties } from "react";

interface AuthLocationState {
    from?: string;
}

const authActionButtonStyle: CSSProperties = {
    padding: "14px 22px",
    background: "#FEC65F",
    color: "#DA6804",
    border: "2px solid #FF9500",
    borderRadius: "18px",
    fontSize: "28px",
    fontFamily: "'Jersey 25', sans-serif",
    cursor: "pointer",
    fontWeight: "normal",
    boxShadow: "0 4px 10px rgba(255, 149, 0, 0.28)",
    transition: "transform 0.1s ease, filter 0.1s ease"
};

const authInputStyle: CSSProperties = {
    width: "100%",
    padding: "16px 22px",
    border: "2px solid #ffb042",
    borderRadius: "24px",
    fontSize: "26px",
    fontFamily: "'Jersey 25', sans-serif",
    color: "#7a2500",
    background: "rgba(255,255,255,0.9)",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
    marginBottom: "12px"
};

const dangerButtonStyle: CSSProperties = {
    ...authActionButtonStyle,
    background: "#ff9a6e",
    color: "#8d2000",
    border: "2px solid #d54616",
    boxShadow: "0 4px 10px rgba(213, 70, 22, 0.28)"
};

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
                            <button style={authActionButtonStyle} disabled={pending} onClick={() => navigate(targetRoute, { replace: true })}>Continue</button>
                            <button style={authActionButtonStyle} disabled={pending} onClick={handleLogout}>Logout</button>
                            <button style={dangerButtonStyle} disabled={pending} onClick={handleDelete}>Delete Account</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                            <button
                                style={{
                                    ...authActionButtonStyle,
                                    flex: 1,
                                    opacity: mode === "login" ? 1 : 0.75,
                                    filter: mode === "login" ? "none" : "saturate(0.85)"
                                }}
                                disabled={pending || mode === "login"}
                                onClick={() => setMode("login")}
                            >
                                Login
                            </button>
                            <button
                                style={{
                                    ...authActionButtonStyle,
                                    flex: 1,
                                    opacity: mode === "register" ? 1 : 0.75,
                                    filter: mode === "register" ? "none" : "saturate(0.85)"
                                }}
                                disabled={pending || mode === "register"}
                                onClick={() => setMode("register")}
                            >
                                Register
                            </button>
                        </div>

                        {mode === "register" && (
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                style={authInputStyle}
                                disabled={pending}
                            />
                        )}

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            style={authInputStyle}
                            disabled={pending}
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            style={authInputStyle}
                            disabled={pending}
                        />

                        <button
                            onClick={handleAuth}
                            disabled={!canSubmit}
                            style={{
                                ...authActionButtonStyle,
                                width: "100%",
                                opacity: canSubmit ? 1 : 0.65,
                                cursor: canSubmit ? "pointer" : "not-allowed"
                            }}
                        >
                            {mode === "login" ? "Login" : "Register"}
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
