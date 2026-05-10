import { useState } from "react";
import { FiLock, FiMail } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import axios from "axios";
import { api, setAuthSession } from "../lib/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      setAuthSession(response.data);

      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Cannot connect to the backend. Start the API server on http://localhost:8000.");
        } else {
          setError(err.response.data?.detail || "Login failed. Please try again.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="hero-panel">
          <div className="hero-steps hero-steps--top" />
          <div className="hero-steps hero-steps--bottom" />
          <div className="hero-pattern" />
          <div className="hero-status">System online</div>

          <div className="member-badge member-badge--one">
            <span className="member-badge__ring" />
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
              alt="Team member"
            />
          </div>

          <div className="member-badge member-badge--two">
            <span className="member-badge__ring" />
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
              alt="Team member"
            />
          </div>

          <div className="member-badge member-badge--three">
            <span className="member-badge__ring" />
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80"
              alt="Team member"
            />
          </div>

          <div className="info-card info-card--chart">
            <div className="info-card__header">
              <span>Active Users</span>
              <span className="info-badge">24H</span>
            </div>
            <div className="trend-box">
              <div className="trend-grid" />
              <svg viewBox="0 0 320 140" className="trend-line" aria-hidden="true">
                <defs>
                  <linearGradient id="lineFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(109, 92, 255, 0.35)" />
                    <stop offset="100%" stopColor="rgba(109, 92, 255, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 112 C32 88, 42 72, 64 64 S108 126, 132 92 S178 38, 204 58 S244 126, 272 96 S304 74, 320 82"
                  fill="none"
                  stroke="#6b5cff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M0 112 C32 88, 42 72, 64 64 S108 126, 132 92 S178 38, 204 58 S244 126, 272 96 S304 74, 320 82 L320 140 L0 140 Z"
                  fill="url(#lineFill)"
                />
              </svg>
            </div>
          </div>

          <div className="info-card info-card--donut">
            <span className="info-card__title">Program</span>
            <div className="ring-chart">
              <div className="ring-chart__label">
                <strong>Daily Active</strong>
                <span>Users</span>
              </div>
            </div>
            <div className="tag-row">
              <span className="tag pink">BSW</span>
              <span className="tag blue">PACE</span>
              <span className="tag teal">GAP</span>
              <span className="tag yellow">MBA</span>
            </div>
          </div>

          <div className="hero-copy">
            <h2>Admin Dashboard</h2>
            <p>Track and manage stories, tasks, and team activity</p>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-panel__content">
            <header className="form-panel__header">
              <span className="section-label">Secure workspace</span>
              <h1>Welcome back 👋</h1>
              <p>Login to continue</p>
            </header>

            {error && <div className="error-message">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="form-field">
                <FiMail className="form-field__icon" aria-hidden="true" />
                <input
                  type="email"
                  placeholder="janedoe@mail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <FiLock className="form-field__icon" aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </label>

              <button type="submit" className="primary-action" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="form-note">
              Protected login with end-to-end admin access controls.
            </p>

            <Link to="/forgot-password" className="text-link">
              Forgot Password?
            </Link>

            <div className="auth-meta">
              <span>New here?</span>
              <Link to="/register" className="auth-meta__link">
                Register
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
