import apiClient from "@/lib/apiClient";

/**
 * Authentication Service
 * Handles login, logout, registration, and token management
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
  phone?: string;
  name?: string;
  address?: string;
  roleId?: string;
  employeeCode?: string;
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
  };
}

export interface RegisterResponse {
  status: string;
  message?: string;
  data?: any;
}

export interface DecodedToken {
  userId: string;
  username?: string;
  name?: string;
  email?: string;
  roleName: string;
  serviceCenterId?: string;
  companyId?: string;
  iat?: number;
  exp?: number;
}

export interface UserInfo {
  userId: string;
  username: string;
  name: string;
  email?: string;
  roleName: string;
  serviceCenterId?: string;
  companyId?: string;
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

      // Decode and store user info
      try {
        const decoded = decodeToken(token);
        console.log("🔑 Decoded Token:", decoded);

        const userInfo: UserInfo = {
          userId: decoded.userId,
          username: credentials.username, // Store from login
          name: decoded.name || credentials.username,
          email: decoded.email || undefined,
          roleName: decoded.roleName,
          serviceCenterId: decoded.serviceCenterId,
          companyId: decoded.companyId,
        };

        console.log("💾 Storing User Info:", userInfo);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        console.log("✅ User info stored successfully");
      } catch (err) {
        console.error("❌ Failed to decode token:", err);
      }
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
 * Register a new user account
 * @param credentials - User registration data
 * @returns success message
 */
export const registerAccount = async (
  credentials: RegisterCredentials
): Promise<string> => {
  try {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/registerAccount",
      credentials
    );

    console.log("📝 Register Response:", response.data);

    if (response.data.status === "success") {
      return response.data.message || "Registration successful.";
    } else {
      throw new Error(response.data.message || "Registration failed.");
    }
  } catch (error) {
    console.error("❌ Registration failed:", error);
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    throw new Error("Failed to register account. Please try again.");
  }
};

/**
 * Logout user and clear authentication data
 */
export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo"); // Also clear user info
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

  try {
    const decoded = decodeToken(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      logout();
      return false;
    }
    return true;
  } catch {
    return !!token;
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
 * Get stored user info from localStorage
 * @returns User info or null
 */
export const getUserInfo = (): UserInfo | null => {
  if (typeof window === "undefined") return null;

  const userInfoStr = localStorage.getItem("userInfo");
  console.log("🔍 Getting user info from localStorage:", userInfoStr);

  if (!userInfoStr) {
    console.log("⚠️ No user info found in localStorage");
    return null;
  }

  try {
    const parsed = JSON.parse(userInfoStr) as UserInfo;
    console.log("✅ Parsed user info:", parsed);
    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse user info:", err);
    return null;
  }
};

/**
 * Auth service object
 */
export const authService = {
  login,
  registerAccount,
  logout,
  isAuthenticated,
  getToken,
  getCurrentUser,
  getUserInfo,
  decodeToken,
};

export default authService;
