import { FiActivity, FiCheckCircle, FiDollarSign, FiFolder, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api, getStoredUser } from "../lib/api";
import type { DashboardSummary as DashboardSummaryType, User } from "../lib/api";

function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummaryType | null>(null);
  const [projects, setProjects] = useState<
    Array<{
      id: string;
      name: string;
      description: string | null;
      status: string;
      tasks: Array<{ id: string; status: string }>;
      owner: { username: string };
    }>
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = getStoredUser();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const requests = [
          api.get<DashboardSummaryType>("/api/dashboard/summary"),
          api.get("/api/projects"),
        ] as const;
        if (isAdmin) {
          const [summaryResponse, projectsResponse, usersResponse] = await Promise.all([
            ...requests,
            api.get<User[]>("/api/users"),
          ]);
          setSummary(summaryResponse.data);
          setProjects(projectsResponse.data);
          setUsers(usersResponse.data);
        } else {
          const [summaryResponse, projectsResponse] = await Promise.all(requests);
          setSummary(summaryResponse.data);
          setProjects(projectsResponse.data);
        }
      } catch (err) {
        setError("Unable to load dashboard summary.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [isAdmin]);

  const statCards = [
    {
      label: "Today's Projects",
      value: summary?.total_projects ?? 0,
      delta: `+${Math.max(summary?.completed_tasks ?? 0, 1)} active this week`,
      positive: true,
      icon: <FiFolder />,
    },
    {
      label: "Today's Users",
      value: summary?.total_tasks ?? 0,
      delta: `+${summary?.pending_tasks ?? 0} tasks in motion`,
      positive: true,
      icon: <FiUsers />,
    },
    {
      label: "Completed Tasks",
      value: summary?.completed_tasks ?? 0,
      delta: `${summary?.overdue_tasks ? `-${summary.overdue_tasks} overdue alerts` : "+0 overdue alerts"}`,
      positive: (summary?.overdue_tasks ?? 0) === 0,
      icon: <FiCheckCircle />,
    },
    {
      label: "Delivery Score",
      value:
        summary && summary.total_tasks > 0
          ? `${Math.round((summary.completed_tasks / summary.total_tasks) * 100)}%`
          : "0%",
      delta: "+5% than last review",
      positive: true,
      icon: <FiDollarSign />,
    },
  ];

  const tasksByStatusData = useMemo(
    () =>
      Object.entries(summary?.tasks_by_status ?? {}).map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
      })),
    [summary],
  );

  const projectsByStatusData = useMemo(
    () =>
      Object.entries(summary?.projects_by_status ?? {}).map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
      })),
    [summary],
  );

  const trendData = useMemo(() => {
    const base = summary?.recent_tasks ?? [];
    return base.map((task, index) => ({
      name: `W${index + 1}`,
      completed: task.status === "done" ? index + 2 : index + 1,
      progress: task.status === "in_progress" ? index + 3 : index + 1,
    }));
  }, [summary]);

  const projectRows = projects.map((project) => {
    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((task) => task.status === "done").length;
    const completion = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      totalTasks,
      completion,
      members: [project.owner.username, `${totalTasks} tasks`],
    };
  });

  const activities = [
    ...(summary?.recent_tasks ?? []).map((task, index) => ({
      id: `task-${task.id}`,
      title: task.title,
      time: `${index + 1}h ago`,
      detail: `${task.status.replace("_", " ")} • ${task.priority} priority`,
      icon: <FiActivity />,
    })),
    ...(summary?.recent_projects ?? []).map((project, index) => ({
      id: `project-${project.id}`,
      title: project.name,
      time: `${index + 2}d ago`,
      detail: `${project.status.replace("_", " ")} project update`,
      icon: <FiTrendingUp />,
    })),
  ].slice(0, 6);

  const updateUserRole = async (userId: string, role: User["role"]) => {
    try {
      setRoleUpdatingId(userId);
      setError("");
      const response = await api.patch<User>(`/api/users/${userId}/role`, { role });
      setUsers((current) => current.map((user) => (user.id === userId ? response.data : user)));
    } catch (err) {
      setError("Unable to update user role.");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="page-state">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="page-state page-state--error">{error}</div>;
  }

  return (
    <section className="workspace-page workspace-page--dashboard">
      <div className="dashboard-stats-grid">
        {statCards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-card__top">
              <div className="metric-card__icon">{card.icon}</div>
              <div className="metric-card__copy">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            </div>
            <div className="metric-card__footer">
              <span className={card.positive ? "metric-card__delta metric-card__delta--positive" : "metric-card__delta metric-card__delta--negative"}>
                {card.delta}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-chart-grid">
        <article className="dashboard-chart-card">
          <div className="chart-card__graphic chart-card__graphic--emerald">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={tasksByStatusData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.16)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} />
                <Bar dataKey="value" fill="#d4ffdb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card__content">
            <h3>Task Status View</h3>
            <p>Live distribution of todo, in-progress, and completed work.</p>
            <span className="chart-card__meta">Updated from active backend data</span>
          </div>
        </article>

        <article className="dashboard-chart-card">
          <div className="chart-card__graphic chart-card__graphic--blue">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.16)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#ffffff" strokeWidth={4} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card__content">
            <h3>Delivery Trend</h3>
            <p>Tracks progress motion across the latest active work cycles.</p>
            <span className="chart-card__meta">Upward momentum across recent tasks</span>
          </div>
        </article>

        <article className="dashboard-chart-card">
          <div className="chart-card__graphic chart-card__graphic--violet">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={projectsByStatusData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.16)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#fff8d6" strokeWidth={4} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card__content">
            <h3>Project Health</h3>
            <p>Compares planning, active, completed, and on-hold project counts.</p>
            <span className="chart-card__meta">Snapshot of delivery portfolio health</span>
          </div>
        </article>
      </div>

      <div className="dashboard-bottom-grid">
        <article className="panel-card panel-card--table">
          <div className="panel-card__header">
            <div>
              <h3>Projects</h3>
              <p>{summary?.completed_tasks ?? 0} completed tasks reflected in current progress.</p>
            </div>
          </div>

          {projectRows.length ? (
            <div className="table-shell">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Owner</th>
                    <th>Tasks</th>
                    <th>Status</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRows.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div className="table-project">
                          <span className="table-project__badge">{project.name.slice(0, 2).toUpperCase()}</span>
                          <div>
                            <strong>{project.name}</strong>
                            <p>{project.description || "No description yet"}</p>
                          </div>
                        </div>
                      </td>
                      <td>{project.owner.username}</td>
                      <td>{project.totalTasks}</td>
                      <td>
                        <span className={`status-pill status-pill--${project.status}`}>{project.status}</span>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <span>{project.completion}%</span>
                          <div className="progress-bar">
                            <div style={{ width: `${project.completion}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="page-state">No projects yet.</div>
          )}
        </article>

        <article className="panel-card panel-card--timeline">
          <div className="panel-card__header">
            <div>
              <h3>Activity Overview</h3>
              <p>Recent updates from your latest projects and tasks.</p>
            </div>
          </div>

          <div className="timeline-list">
            {activities.length ? (
              activities.map((activity) => (
                <div key={activity.id} className="timeline-item">
                  <span className="timeline-item__icon">{activity.icon}</span>
                  <div className="timeline-item__content">
                    <strong>{activity.title}</strong>
                    <p>{activity.detail}</p>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent updates yet.</p>
            )}
          </div>
        </article>
      </div>

      {isAdmin && (
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Team Roles</h3>
              <p>Admin can promote employees to manager and adjust account access.</p>
            </div>
          </div>

          {users.length ? (
            <div className="table-shell">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.full_name}</strong>
                        <p>@{user.username}</p>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-pill status-pill--${user.role === "employee" ? "todo" : user.role === "manager" ? "active" : "completed"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <select
                          className="workspace-input workspace-input--compact"
                          disabled={roleUpdatingId === user.id}
                          value={user.role}
                          onChange={(e) => void updateUserRole(user.id, e.target.value as User["role"])}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="page-state">No users found.</div>
          )}
        </article>
      )}
    </section>
  );
}

export default Dashboard;
