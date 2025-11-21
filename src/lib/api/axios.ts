import axios from "axios";

// API base URL - can be moved to environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3456/api/v1";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: Required for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject access token if available
api.interceptors.request.use(
  (config) => {
    // Tokens are stored in HttpOnly cookies, so we don't need to manually add them
    // The browser automatically includes cookies with requests when withCredentials is true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 Unauthorized
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear localStorage
      localStorage.removeItem("user");
      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(new CustomEvent("auth-unauthorized"));
      
      // Prevent retry loop
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
      }
    }

    return Promise.reject(error);
  }
);

// Types for API responses
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

