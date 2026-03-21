import { useState } from "react";
import { deleteAccount, login, logout, register } from "../services/authApi";
import { getAuthSession } from "../services/authSession";

interface AuthPanelProps {
    onAuthenticated: (username: string) => void;
    onLoggedOut: () => void;
}

export default function AuthPanel({ onAuthenticated, onLoggedOut }: AuthPanelProps) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    const session = getAuthSession();

    const handleAuth = async () => {
        setStatus(mode === "login" ? "Logging in..." : "Creating account...");

        const result = mode === "login"
            ? await login(email.trim(), password)
            : await register(username.trim(), email.trim(), password);

        if (!result.ok || !result.session) {
            setStatus(result.message ?? "Authentication failed.");
            return;
        }

        onAuthenticated(result.session.account.username);
        setStatus(`Welcome, ${result.session.account.username}!`);
        setPassword("");
    };

    const handleLogout = () => {
        logout();
        onLoggedOut();
        setStatus("Logged out.");
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Delete your account permanently?");
        if (!confirmed) return;

        setStatus("Deleting account...");
        const result = await deleteAccount();
        if (!result.ok) {
            setStatus(result.message ?? "Could not delete account.");
            return;
        }

        onLoggedOut();
        setStatus("Account deleted.");
    };

    return (
        <div style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            zIndex: 5,
            background: "rgba(255, 232, 188, 0.92)",
            border: "2px solid #b55d00",
            borderRadius: "14px",
            padding: "12px",
            width: "300px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            fontFamily: "'Jersey 25', sans-serif",
            color: "#7a2500"
        }}>
            {session ? (
                <>
                    <div style={{ fontSize: "22px", marginBottom: "8px" }}>Signed in</div>
                    <div style={{ marginBottom: "10px", fontSize: "18px" }}>{session.account.username} ({session.account.email})</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handleLogout}>Logout</button>
                        <button onClick={handleDeleteAccount}>Delete Account</button>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <button onClick={() => setMode("login")} disabled={mode === "login"}>Login</button>
                        <button onClick={() => setMode("register")} disabled={mode === "register"}>Register</button>
                    </div>
                    {mode === "register" && (
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            style={{ width: "100%", marginBottom: "8px" }}
                        />
                    )}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        style={{ width: "100%", marginBottom: "8px" }}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        style={{ width: "100%", marginBottom: "8px" }}
                    />
                    <button onClick={handleAuth} style={{ width: "100%" }}>
                        {mode === "login" ? "Login" : "Create Account"}
                    </button>
                </>
            )}
            {status && <div style={{ marginTop: "8px", fontSize: "16px" }}>{status}</div>}
        </div>
    );
}
