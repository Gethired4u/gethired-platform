import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://gethired4u.com/api/",
  timeout: 10000,
});

export async function analyzeResume(formData) {
  const response = await api.post("/analyze-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function registerUser(payload) {
  const response = await api.post("/register", payload);
  return response.data;
}

export async function fetchUsers() {
  const response = await api.get("/users");
  return response.data;
}

export default api;
