import axios from "axios";

// In production, Nginx proxies /api-routes → backend on the same origin.
// In dev, point to localhost:8000 via VITE_API_BASE_URL in .env.local
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export async function analyzeResume(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error("analyzeResume expects a FormData payload.");
  }
  const response = await api.post("/analyze-resume", formData);
  return response.data;
}

export async function registerUser(payload) {
  const response = await api.post("/register", payload);
  return response.data;
}

export async function loginAdmin(credentials) {
  const response = await api.post("/admin/login", credentials);
  return response.data;
}

export async function fetchUsers(token) {
  const response = await api.get("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function fetchAnalysisHistory(token) {
  const response = await api.get("/analysis-history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function downloadAnalysisHistoryCSV(token) {
  const response = await api.get("/analysis-history/export", {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "analysis_history.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return true;
}

export default api;
