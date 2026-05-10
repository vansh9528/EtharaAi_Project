import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import { api, getStoredUser } from "../lib/api";
import type { Project as ProjectType } from "../lib/api";

type ProjectForm = {
  name: string;
  description: string;
  status: "planning" | "active" | "completed" | "on_hold";
};

const initialForm: ProjectForm = {
  name: "",
  description: "",
  status: "planning",
};

function Project() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const currentUser = getStoredUser();
  const canManageProjects = currentUser?.role === "admin" || currentUser?.role === "manager";

  const filteredProjects = projects.filter((project) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      project.name.toLowerCase().includes(query) ||
      (project.description || "").toLowerCase().includes(query) ||
      project.owner.username.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query)
    );
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<ProjectType[]>("/api/projects");
      setProjects(response.data);
    } catch (err) {
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      if (editingProjectId) {
        await api.put(`/api/projects/${editingProjectId}`, form);
      } else {
        await api.post("/api/projects", form);
      }
      setForm(initialForm);
      setEditingProjectId(null);
      await loadProjects();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Project creation failed.");
      } else {
        setError("Project creation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: ProjectType) => {
    setEditingProjectId(project.id);
    setForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
    });
    setError("");
  };

  const handleDelete = async (projectId: string) => {
    try {
      setError("");
      await api.delete(`/api/projects/${projectId}`);
      if (editingProjectId === projectId) {
        setEditingProjectId(null);
        setForm(initialForm);
      }
      await loadProjects();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Project deletion failed.");
      } else {
        setError("Project deletion failed.");
      }
    }
  };

  return (
    <section className="workspace-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h2>Projects</h2>
        </div>
        <input
          className="workspace-input workspace-input--compact"
          placeholder="Search projects"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="page-state page-state--error">{error}</div>}

      <div className="content-grid content-grid--wide">
        <article className="panel-card">
          <h3>{canManageProjects ? (editingProjectId ? "Edit Project" : "Create Project") : "Project Access"}</h3>
          {canManageProjects ? (
            <form className="workspace-form" onSubmit={handleSubmit}>
              <label className="workspace-field">
                <span className="workspace-field__label">Project Name</span>
                <input
                  className="workspace-input"
                  placeholder="Project name"
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                />
              </label>
              <label className="workspace-field">
                <span className="workspace-field__label">Description</span>
                <textarea
                  className="workspace-input workspace-input--textarea"
                  placeholder="Project description"
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                />
              </label>
              <label className="workspace-field">
                <span className="workspace-field__label">Status</span>
                <select
                  className="workspace-input"
                  value={form.status}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      status: e.target.value as ProjectForm["status"],
                    }))
                  }
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </label>
              <div className="form-actions">
                <button className="primary-button" disabled={submitting} type="submit">
                  {submitting ? (editingProjectId ? "Saving..." : "Creating...") : editingProjectId ? "Save Changes" : "Create Project"}
                </button>
                {editingProjectId && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditingProjectId(null);
                      setForm(initialForm);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="page-state">Employees can view projects, but only admins and managers can create or edit them.</div>
          )}
        </article>

        <article className="panel-card">
          <h3>Project List</h3>
          {loading ? (
            <div className="page-state">Loading projects...</div>
          ) : filteredProjects.length ? (
            <div className="panel-list">
              {filteredProjects.map((project) => (
                <div key={project.id} className="panel-list__item panel-list__item--stack">
                  <div className="item-header-row">
                    <div>
                      <strong>{project.name}</strong>
                      <p>{project.description || "No description provided."}</p>
                    </div>
                    {canManageProjects && (
                      <div className="action-row">
                        <button className="ghost-button" onClick={() => handleEdit(project)} type="button">
                          Edit
                        </button>
                        <button className="ghost-button ghost-button--danger" onClick={() => handleDelete(project.id)} type="button">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="meta-row">
                    <span className={`status-pill status-pill--${project.status}`}>{project.status}</span>
                    <span>{project.tasks.length} tasks</span>
                    <span>Owner: {project.owner.username}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length ? (
            <div className="page-state">No projects match your search.</div>
          ) : (
            <div className="page-state">No projects created yet.</div>
          )}
        </article>
      </div>
    </section>
  );
}

export default Project;
