import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode"; // You need to install this library
import api from "./api";

/**
 * Login user and store auth data securely.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} The auth token.
 */
const login = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    const token = response.data.data.token;

    if (token) {
      // Store token in AsyncStorage
      await AsyncStorage.setItem("authToken", token);

      // Decode and store user info
      try {
        const decoded = jwtDecode(token);
        const userInfo = {
          userId: decoded.userId,
          username: username, // Store from login credentials
          name: decoded.name || username,
          roleName: decoded.roleName,
          serviceCenterId: decoded.serviceCenterId,
          companyId: decoded.companyId,
        };

        await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
        console.log("✅ User info stored successfully in AsyncStorage");
      } catch (err) {
        console.error("❌ Failed to decode token or store user info:", err);
      }
    }
    return token;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Login failed. Please check your credentials.");
  }
};

/**
 * Logout user by clearing all authentication data from storage.
 * NOTE: Navigation is handled in the component, not here.
 */
const logout = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("userInfo");
};

/**
 * Get the current auth token from storage.
 * @returns {Promise<string|null>}
 */
const getToken = async () => {
  return await AsyncStorage.getItem("authToken");
};

/**
 * Check if the user is authenticated and the token is not expired.
 * @returns {Promise<boolean>}
 */
const isAuthenticated = async () => {
  const token = await getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      await logout(); // Clear expired token
      return false;
    }
    return true;
  } catch {
    return false; // Invalid token
  }
};

/**
 * Get the decoded user payload from the current token.
 * @returns {Promise<object|null>}
 */
const getCurrentUser = async () => {
  const token = await getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

/**
 * Get the stored user info object from storage.
 * @returns {Promise<object|null>}
 */
const getUserInfo = async () => {
  try {
    const userInfoStr = await AsyncStorage.getItem("userInfo");
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (err) {
    console.error("❌ Failed to get or parse user info:", err);
    return null;
  }
};

const authService = {
  login,
  logout,
  isAuthenticated,
  getToken,
  getCurrentUser,
  getUserInfo,
};

export default authService;
