import apiClient from "@/lib/apiClient";

/**
 * Authentication Service
 * Handles login, logout, and token management
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
  };
}

export interface DecodedToken {
  userId: string;
  roleName: string;
  serviceCenterId?: string;
  companyId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Login user with username and password
 * @param credentials - Username and password
 * @returns JWT token
 */
export const login = async (credentials: LoginCredentials): Promise<string> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );

    const token = response.data.data.token;

    // Store token in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }

    return token;
  } catch (error) {
    // Handle specific error responses from backend
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    throw new Error("Login failed. Please check your credentials.");
  }
};

/**
 * Logout user and clear authentication data
 */
export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    // Clear any other auth-related data if needed
    window.location.href = "/login";
  }
};

/**
 * Check if user is authenticated
 * @returns true if user has a valid token
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("authToken");
  if (!token) return false;

  // Check if token is expired (optional - implement JWT decode)
  try {
    const decoded = decodeToken(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      logout();
      return false;
    }
    return true;
  } catch {
    return !!token; // If decode fails, just check if token exists
  }
};

/**
 * Get current auth token
 * @returns JWT token or null
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

/**
 * Decode JWT token (basic implementation)
 * @param token - JWT token
 * @returns Decoded token payload
 */
export const decodeToken = (token: string): DecodedToken => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    throw new Error("Invalid token");
  }
};

/**
 * Get current user info from token
 * @returns User info or null
 */
export const getCurrentUser = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;

  try {
    return decodeToken(token);
  } catch {
    return null;
  }
};

/**
 * Auth service object
 */
export const authService = {
  login,
  logout,
  isAuthenticated,
  getToken,
  getCurrentUser,
  decodeToken,
};

export default authService;
