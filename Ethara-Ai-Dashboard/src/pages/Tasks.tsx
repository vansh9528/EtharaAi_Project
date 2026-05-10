import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import { api, getStoredUser } from "../lib/api";
import type { ProjectSummary, Task, User } from "../lib/api";

type TaskForm = {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
  project_id: string;
  assigned_to_id: string;
};

const initialTaskForm: TaskForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  due_date: "",
  project_id: "",
  assigned_to_id: "",
};

function Tasks() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskForm>(initialTaskForm);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id ?? "";
  const currentUserRole = currentUser?.role ?? "";
  const canCreateTasks = currentUser?.role === "admin" || currentUser?.role === "manager" || currentUser?.role === "employee";
  const canManageTasks = currentUser?.role === "admin" || currentUser?.role === "manager";
  const employeeAssignableProjectIds = new Set(
    tasks
      .filter((task) => task.assignee?.id === currentUserId)
      .map((task) => task.project.id),
  );
  const restrictedByAssignedProjects = currentUserRole === "employee" || currentUserRole === "manager";
  const availableProjects =
    restrictedByAssignedProjects
      ? projects.filter((project) => employeeAssignableProjectIds.has(project.id))
      : projects;
  const canShowAssignedProjectTaskForm = !restrictedByAssignedProjects || availableProjects.length > 0;

  const loadTasks = async (nextStatus = statusFilter) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<Task[]>("/api/tasks", {
        params: nextStatus ? { status: nextStatus } : {},
      });
      setTasks(response.data);
    } catch (err) {
      setError("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const requests = [
          api.get<ProjectSummary[]>("/api/projects"),
          api.get<Task[]>("/api/tasks"),
        ] as const;
        const [projectsResponse, tasksResponse, assignableUsersResponse] = canManageTasks
          ? await Promise.all([...requests, api.get<User[]>("/api/users/assignable")])
          : [...(await Promise.all(requests)), null];
        setProjects(projectsResponse.data.map((project) => ({
          id: project.id,
          name: project.name,
          status: project.status,
        })));
        setTasks(tasksResponse.data);
        setAssignableUsers(
          canManageTasks
            ? assignableUsersResponse?.data ?? []
            : currentUser
              ? [currentUser]
              : [],
        );
        if (projectsResponse.data.length > 0) {
          const nextProjects = projectsResponse.data.map((project) => ({
            id: project.id,
            name: project.name,
            status: project.status,
          }));
          const nextEmployeeProjectIds = new Set(
            tasksResponse.data
              .filter((task) => task.assignee?.id === currentUser?.id)
              .map((task) => task.project.id),
          );
          const nextAvailableProjects =
            currentUser?.role === "employee" || currentUser?.role === "manager"
              ? nextProjects.filter((project) => nextEmployeeProjectIds.has(project.id))
              : nextProjects;
          setForm((current) => ({
            ...current,
            project_id: current.project_id || nextAvailableProjects[0]?.id || "",
            assigned_to_id: current.assigned_to_id || currentUser?.id || "",
          }));
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.detail || "Unable to load task workspace.");
        } else {
          setError("Unable to load task workspace.");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [canManageTasks, currentUserId, currentUserRole]);

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project_id) {
      setError("Task title and project are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        ...form,
        due_date: form.due_date || null,
        assigned_to_id: form.assigned_to_id || null,
      };
      if (editingTaskId) {
        await api.put(`/api/tasks/${editingTaskId}`, payload);
      } else {
        await api.post("/api/tasks", payload);
      }
      setForm((current) => ({
        ...initialTaskForm,
        project_id: current.project_id,
        assigned_to_id: currentUser?.id || "",
      }));
      setEditingTaskId(null);
      await loadTasks();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Task creation failed.");
      } else {
        setError("Task creation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (taskId: string, status: Task["status"]) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status });
      await loadTasks();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Unable to update task status.");
      } else {
        setError("Unable to update task status.");
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.slice(0, 16) : "",
      project_id: task.project.id,
      assigned_to_id: task.assignee?.id || "",
    });
    setError("");
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError("");
      await api.delete(`/api/tasks/${taskId}`);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setForm((current) => ({
          ...initialTaskForm,
          project_id: current.project_id,
          assigned_to_id: currentUser?.id || "",
        }));
      }
      await loadTasks();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Unable to delete task.");
      } else {
        setError("Unable to delete task.");
      }
    }
  };

  return (
    <section className="workspace-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Execution</p>
          <h2>Tasks</h2>
        </div>
        <select
          className="workspace-input workspace-input--compact"
          value={statusFilter}
          onChange={async (e) => {
            const nextStatus = e.target.value;
            setStatusFilter(nextStatus);
            await loadTasks(nextStatus);
          }}
        >
          <option value="">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {error && <div className="page-state page-state--error">{error}</div>}

      <div className="content-grid content-grid--wide">
        <article className="panel-card">
          <h3>{canCreateTasks ? (editingTaskId ? "Edit Task" : "Create Task") : "Task Access"}</h3>
          {canCreateTasks && canShowAssignedProjectTaskForm ? (
            <form className="workspace-form" onSubmit={handleCreateTask}>
              <label className="workspace-field">
                <span className="workspace-field__label">Task Title</span>
                <input
                  className="workspace-input"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                />
              </label>
              <label className="workspace-field">
                <span className="workspace-field__label">Description</span>
                <textarea
                  className="workspace-input workspace-input--textarea"
                  placeholder="Task description"
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                />
              </label>
              <label className="workspace-field">
                <span className="workspace-field__label">Project</span>
                <select
                  className="workspace-input"
                  value={form.project_id}
                  onChange={(e) => setForm((current) => ({ ...current, project_id: e.target.value }))}
                >
                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="workspace-field">
                <span className="workspace-field__label">Assign To</span>
                <select
                  className="workspace-input"
                  value={form.assigned_to_id}
                  disabled={!canManageTasks}
                  onChange={(e) => setForm((current) => ({ ...current, assigned_to_id: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {assignableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </label>
              <div className="split-fields">
                <label className="workspace-field">
                  <span className="workspace-field__label">Priority</span>
                  <select
                    className="workspace-input"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        priority: e.target.value as TaskForm["priority"],
                      }))
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="workspace-field">
                  <span className="workspace-field__label">Status</span>
                  <select
                    className="workspace-input"
                    value={form.status}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        status: e.target.value as TaskForm["status"],
                      }))
                    }
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </label>
              </div>
              <label className="workspace-field">
                <span className="workspace-field__label">Due Date</span>
                <input
                  className="workspace-input"
                  type="datetime-local"
                  value={form.due_date}
                  onChange={(e) => setForm((current) => ({ ...current, due_date: e.target.value }))}
                />
              </label>
              <div className="form-actions">
                <button className="primary-button" disabled={submitting || projects.length === 0} type="submit">
                  {submitting ? (editingTaskId ? "Saving..." : "Creating...") : editingTaskId ? "Save Changes" : "Create Task"}
                </button>
                {editingTaskId && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditingTaskId(null);
                      setForm((current) => ({
                        ...initialTaskForm,
                        project_id: current.project_id,
                        assigned_to_id: currentUser?.id || "",
                      }));
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : restrictedByAssignedProjects ? (
            <div className="page-state">
              Task creation is available after a project has been assigned to you.
            </div>
          ) : (
            <div className="page-state">You do not have access to create tasks.</div>
          )}
        </article>

        <article className="panel-card">
          <h3>Task List</h3>
          {loading ? (
            <div className="page-state">Loading tasks...</div>
          ) : tasks.length ? (
            <div className="panel-list">
              {tasks.map((task) => (
                <div key={task.id} className="panel-list__item panel-list__item--stack">
                  <div className="item-header-row">
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.description || "No description provided."}</p>
                    </div>
                    {canManageTasks && (
                      <div className="action-row">
                        <button className="ghost-button" onClick={() => handleEditTask(task)} type="button">
                          Edit
                        </button>
                        <button className="ghost-button ghost-button--danger" onClick={() => handleDeleteTask(task.id)} type="button">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="meta-row">
                    <span className={`status-pill status-pill--${task.status}`}>{task.status}</span>
                    <span className={`status-pill status-pill--priority-${task.priority}`}>{task.priority}</span>
                    <span>{task.project.name}</span>
                    <span>{task.assignee?.username || "Unassigned"}</span>
                  </div>
                  <div className="action-row">
                    <button className="ghost-button" onClick={() => updateStatus(task.id, "todo")} type="button">
                      Todo
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => updateStatus(task.id, "in_progress")}
                      type="button"
                    >
                      In Progress
                    </button>
                    <button className="ghost-button" onClick={() => updateStatus(task.id, "done")} type="button">
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="page-state">No tasks created yet.</div>
          )}
        </article>
      </div>
    </section>
  );
}

export default Tasks;
