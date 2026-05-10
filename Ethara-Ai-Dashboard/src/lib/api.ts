import axios from "axios";

export const API_BASE_URL = "https://etharaai-project.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type ProjectSummary = {
  id: string;
  name: string;
  status: string;
};

export type TaskSummary = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
};

export type UserSummary = {
  id: string;
  username: string;
  full_name: string;
  role: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "planning" | "active" | "completed" | "on_hold";
  created_at: string;
  updated_at: string;
  owner: UserSummary;
  tasks: TaskSummary[];
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  updated_at: string;
  project: ProjectSummary;
  assignee: UserSummary | null;
  creator: UserSummary;
};

export type DashboardSummary = {
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  projects_by_status: Record<string, number>;
  tasks_by_status: Record<string, number>;
  recent_projects: ProjectSummary[];
  recent_tasks: TaskSummary[];
};

export type User = AuthUser;

export const getStoredToken = () => localStorage.getItem("token");

export const getStoredUser = (): AuthUser | null => {
  const user = localStorage.getItem("user");
  return user ? (JSON.parse(user) as AuthUser) : null;
};

export const setStoredUser = (user: AuthUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const setAuthSession = (payload: AuthResponse) => {
  localStorage.setItem("token", payload.access_token);
  localStorage.setItem("user", JSON.stringify(payload.user));
  api.defaults.headers.common.Authorization = `Bearer ${payload.access_token}`;
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common.Authorization;
};

export const fetchCurrentUser = async () => {
  const response = await api.get<AuthUser>("/api/auth/me");
  setStoredUser(response.data);
  return response.data;
};

const token = getStoredToken();
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
