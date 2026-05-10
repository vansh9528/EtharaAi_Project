import {
  FiBell,
  FiClipboard,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiSettings,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { clearAuthSession, getStoredUser } from "../lib/api";

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const roleTitle =
    user?.role === "admin"
      ? "Ethara Admin"
      : user?.role === "manager"
        ? "Ethara Manager"
        : "Ethara User";
  const routeName =
    location.pathname === "/dashboard"
      ? "Dashboard"
      : location.pathname === "/projects"
        ? "Projects"
        : "Tasks";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  const notifications = [
    {
      title: "Role permissions updated",
      detail: "Admin controls and assignment rules are active.",
      time: "2 min ago",
    },
    {
      title: "Task workflow refreshed",
      detail: "Assigned-project restrictions are now applied.",
      time: "18 min ago",
    },
    {
      title: "Dashboard synced",
      detail: "Latest backend data was loaded successfully.",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="sidebar-top">
          <div className="brand-mark">EA</div>
          <h1 className="brand-title">{roleTitle}</h1>
          <p className="brand-copy">Manage dashboard insights, projects, and tasks from one workspace.</p>

          <nav className="workspace-nav">
            <Link
              className={location.pathname === "/dashboard" ? "nav-link nav-link--active" : "nav-link"}
              to="/dashboard"
            >
              <FiGrid />
              <span>Dashboard</span>
            </Link>
            <Link
              className={location.pathname === "/projects" ? "nav-link nav-link--active" : "nav-link"}
              to="/projects"
            >
              <FiFolder />
              <span>Projects</span>
            </Link>
            <Link className={location.pathname === "/tasks" ? "nav-link nav-link--active" : "nav-link"} to="/tasks">
              <FiClipboard />
              <span>Tasks</span>
            </Link>
          </nav>

          <div className="sidebar-section">
            <span className="sidebar-section__label">Account</span>
            <div className="sidebar-user">
              <div>
                <strong>{user?.full_name ?? "User"}</strong>
                <p>
                  @{user?.username ?? "employee"} • {user?.role ?? "employee"}
                </p>
              </div>
              <button className="ghost-button ghost-button--sidebar" onClick={handleLogout} type="button">
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-help">
            <strong>Assessment Ready</strong>
            <p>Live auth, project tracking, task states, and dashboard analytics.</p>
          </div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div>
            <p className="topbar-breadcrumb">Dashboard / {routeName}</p>
            <h2 className="topbar-title">{routeName}</h2>
          </div>

          <div className="topbar-actions">
            <label className="topbar-search">
              <FiSearch />
              <input type="text" placeholder="Search" />
            </label>

            <button
              className="icon-button"
              type="button"
              aria-label="Profile"
              onClick={() => setIsUserPanelOpen((value) => !value)}
            >
              <FiUser />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Notifications"
              onClick={() => setIsNotificationsPanelOpen((value) => !value)}
            >
              <FiBell />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Settings"
              onClick={() => setIsSettingsPanelOpen((value) => !value)}
            >
              <FiSettings />
            </button>
          </div>
        </header>

        <Outlet />

        <aside className={isUserPanelOpen ? "user-slide-panel user-slide-panel--open" : "user-slide-panel"}>
          <div className="user-slide-panel__header">
            <div>
              <p className="topbar-breadcrumb">Signed In User</p>
              <h3 className="user-slide-panel__title">{user?.full_name ?? "User"}</h3>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Close user panel"
              onClick={() => setIsUserPanelOpen(false)}
            >
              <FiX />
            </button>
          </div>

          <div className="user-slide-panel__content">
            <div className="user-card">
              <div className="user-card__avatar">
                <FiUser />
              </div>
              <div className="user-card__meta">
                <strong>{user?.full_name ?? "Unknown User"}</strong>
                <span>{user?.email ?? "No email available"}</span>
              </div>
            </div>

            <div className="user-info-grid">
              <div className="user-info-item">
                <span>Username</span>
                <strong>@{user?.username ?? "employee"}</strong>
              </div>
              <div className="user-info-item">
                <span>Role</span>
                <strong>{user?.role ?? "employee"}</strong>
              </div>
              <div className="user-info-item">
                <span>User ID</span>
                <strong>{user?.id ?? "N/A"}</strong>
              </div>
              <div className="user-info-item">
                <span>Created At</span>
                <strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</strong>
              </div>
            </div>
          </div>
        </aside>

        <aside
          className={
            isNotificationsPanelOpen
              ? "user-slide-panel user-slide-panel--stacked user-slide-panel--open"
              : "user-slide-panel user-slide-panel--stacked"
          }
        >
          <div className="user-slide-panel__header">
            <div>
              <p className="topbar-breadcrumb">Notifications</p>
              <h3 className="user-slide-panel__title">Recent Activity</h3>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Close notifications panel"
              onClick={() => setIsNotificationsPanelOpen(false)}
            >
              <FiX />
            </button>
          </div>

          <div className="user-slide-panel__content">
            <div className="timeline-list">
              {notifications.map((notification) => (
                <div key={notification.title} className="timeline-item">
                  <span className="timeline-item__icon">
                    <FiBell />
                  </span>
                  <div className="timeline-item__content">
                    <strong>{notification.title}</strong>
                    <p>{notification.detail}</p>
                    <span>{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <aside
          className={
            isSettingsPanelOpen
              ? "user-slide-panel user-slide-panel--stacked user-slide-panel--open"
              : "user-slide-panel user-slide-panel--stacked"
          }
        >
          <div className="user-slide-panel__header">
            <div>
              <p className="topbar-breadcrumb">Settings</p>
              <h3 className="user-slide-panel__title">Workspace Preferences</h3>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Close settings panel"
              onClick={() => setIsSettingsPanelOpen(false)}
            >
              <FiX />
            </button>
          </div>

          <div className="user-slide-panel__content">
            <div className="user-info-grid">
              <div className="user-info-item user-info-item--row">
                <div>
                  <span>Access control</span>
                  <strong>{user?.role === "admin" ? "Full admin access" : user?.role === "manager" ? "Manager workspace access" : "Employee limited access"}</strong>
                </div>
                <FiShield className="settings-side-icon" />
              </div>
              <div className="user-info-item">
                <span>Session state</span>
                <strong>Signed in and synced with backend profile validation.</strong>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default MainLayout;
