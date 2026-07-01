import axios from "axios";
import { API_BASE_URL } from "./api";

const apiFetch = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const isRefreshRequest = (request: any) => {
  const url: string | undefined = request?.url;
  return !!(
    url &&
    url.includes("/api/auth/refresh") &&
    request.method?.toLowerCase() === "post"
  );
};

apiFetch.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const refreshRequest = isRefreshRequest(originalRequest);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !refreshRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiFetch(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiFetch.post("/api/auth/refresh");
        processQueue(null);
        return apiFetch(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.location.href = "/loginColaborador";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiFetch;
