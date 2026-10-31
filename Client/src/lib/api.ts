import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("learnora_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && typeof window !== "undefined") {
      original._retry = true;
      const refresh = localStorage.getItem("learnora_refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
          localStorage.setItem("learnora_access_token", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("learnora_refresh_token", data.refreshToken);
          }
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem("learnora_access_token");
          localStorage.removeItem("learnora_refresh_token");
        }
      }
    }
    return Promise.reject(error);
  },
);

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  orgId: string;
  orgSlug: string;
  orgName: string;
  role: "OWNER" | "ADMIN" | "INSTRUCTOR" | "TA" | "LEARNER";
};
