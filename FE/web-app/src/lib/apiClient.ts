import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * API Client Configuration
 *
 * This module sets up the Axios instance with:
 * - Base URL configuration
 * - Request/Response interceptors
 * - Authentication token handling
 * - Error handling and retry logic
 */

// Base API URL - can be configured via environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

// Create Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (or your preferred storage)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response scenarios and errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access denied:", error.response.data.message);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("Resource not found:", error.response.data.message);
    }

    // Handle 409 Conflict
    if (error.response?.status === 409) {
      console.error("Conflict:", error.response.data.message);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
