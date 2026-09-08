import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <span className="login-logo">🖥️</span>
        <h1>Cyber Cafe Manager</h1>
        <p className="muted">Sign in to manage your cafe</p>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
          aria-label="Username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          aria-label="Password"
        />
        {error && <div className="alert error">{error}</div>}
        <button className="btn primary login-submit" disabled={busy || !username || !password}>
          {busy ? "Signing in…" : "Sign in →"}
        </button>
        <p className="muted small">Default: admin / admin123</p>
      </form>
    </div>
  );
}
