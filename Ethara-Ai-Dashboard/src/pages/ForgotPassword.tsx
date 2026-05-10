import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";

import "../style/Login.css";
import { api } from "../lib/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/api/auth/forgot-password", { email });
      setMessage(response.data.message);
      setResetToken(response.data.reset_token || "");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Unable to generate reset token.");
      } else {
        setError("Unable to generate reset token.");
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
          <div className="hero-status">Recovery</div>
          <div className="hero-copy">
            <h2>Reset Access</h2>
            <p>Generate a temporary reset token and create a new password securely.</p>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-panel__content">
            <header className="form-panel__header">
              <span className="section-label">Password reset</span>
              <h1>Forgot password?</h1>
              <p>Enter your email to generate a reset token.</p>
            </header>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="form-field">
                <FiMail className="form-field__icon" aria-hidden="true" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="primary-action" disabled={loading}>
                {loading ? "Generating..." : "Generate Reset Token"}
              </button>
            </form>

            {resetToken && (
              <div className="token-card">
                <strong>Development reset token</strong>
                <code>{resetToken}</code>
                <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="auth-meta__link">
                  Continue to reset password
                </Link>
              </div>
            )}

            <div className="auth-meta auth-meta--compact">
              <span>Remembered your password?</span>
              <Link to="/" className="auth-meta__link">
                Back to Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;
