import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1";

export const STATIC_FILE_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Bumped from 10s -> 20s as a safety margin. The real fix for slow
  // requests is the backend no longer doing a redundant full-session
  // re-fetch on every answer save / sequential per-question DB writes
  // on submit (see examSession.service.ts) — this timeout is just a
  // buffer so a genuinely slow network doesn't surface as a raw
  // "Something went wrong" before the request had a fair chance.
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      Cookies.remove("access_token");

      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = "/login";
      }
    }

    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return new Promise(() => { }); // Prevents "Something went wrong" toast
    }

    if (error.response?.status === 409) {
      console.warn("409 Conflict ignored silently:", error.config?.url);
      return new Promise(() => { }); // Prevents "Something went wrong" toast
    }

    return Promise.reject(error);
  }
);

export default apiClient;