import { useState } from "react";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import axios from "axios";
import { api, setAuthSession } from "../lib/api";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        email,
        username,
        full_name: fullName,
        password,
      });

      setAuthSession(response.data);

      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Cannot connect to the backend. Start the API server on http://localhost:8000.");
        } else {
          setError(err.response.data?.detail || "Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
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
          <div className="hero-status">New workspace</div>

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

          <div className="info-card info-card--chart info-card--setup">
            <div className="info-card__header">
              <span>Getting Started</span>
              <span className="info-badge">FAST</span>
            </div>
            <div className="setup-list">
              <div className="setup-list__item">
                <span className="setup-list__dot setup-list__dot--purple" />
                <div>
                  <strong>Create your profile</strong>
                  <p>Set up access in a few quick steps.</p>
                </div>
              </div>
              <div className="setup-list__item">
                <span className="setup-list__dot setup-list__dot--teal" />
                <div>
                  <strong>Join your workspace</strong>
                  <p>Manage stories, tasks, and teamwork in one place.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card info-card--donut">
            <span className="info-card__title">Setup Progress</span>
            <div className="ring-chart ring-chart--register">
              <div className="ring-chart__label">
                <strong>Ready to</strong>
                <span>Launch</span>
              </div>
            </div>
            <div className="tag-row">
              <span className="tag blue">Profile</span>
              <span className="tag teal">Team</span>
              <span className="tag yellow">Access</span>
            </div>
          </div>

          <div className="hero-copy">
            <h2>Create Account</h2>
            <p>Start managing stories, tasks, and collaboration from day one</p>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-panel__content">
            <header className="form-panel__header">
              <span className="section-label">Create account</span>
              <h1>Join the platform</h1>
              <p>Register to continue</p>
            </header>

            {error && <div className="error-message">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="form-field">
                <FiUser className="form-field__icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <FiUser className="form-field__icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>

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

              <label className="form-field">
                <FiLock className="form-field__icon" aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <p className="form-note">
              Your account gives you secure access to dashboard, stories, and
              task management.
            </p>

            <div className="auth-meta auth-meta--compact">
              <span>Already have an account?</span>
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

export default Register;
