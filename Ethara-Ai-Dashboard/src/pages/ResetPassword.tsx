import { useMemo, useState } from "react";
import { FiKey, FiLock } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import "../style/Login.css";
import { api } from "../lib/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Token and both password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/api/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setMessage(response.data.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Unable to reset password.");
      } else {
        setError("Unable to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout auth-layout--register">
        <section className="hero-panel">
          <div className="hero-steps hero-steps--top" />
          <div className="hero-steps hero-steps--bottom" />
          <div className="hero-pattern" />
          <div className="hero-status">Secure reset</div>
          <div className="hero-copy">
            <h2>Create New Password</h2>
            <p>Paste your reset token and choose a new password for your account.</p>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-panel__content">
            <header className="form-panel__header">
              <span className="section-label">New password</span>
              <h1>Reset password</h1>
              <p>Use the token from the recovery page.</p>
            </header>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="form-field">
                <FiKey className="form-field__icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <FiLock className="form-field__icon" aria-hidden="true" />
                <input
                  type="password"
                  placeholder="New password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <FiLock className="form-field__icon" aria-hidden="true" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="primary-action" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="auth-meta auth-meta--compact">
              <span>Back to sign in?</span>
              <Link to="/" className="auth-meta__link">
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResetPassword;
