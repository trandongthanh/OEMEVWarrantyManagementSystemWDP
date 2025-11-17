// services/publicService.js
import axios from "axios";

// API base URL cho mobile (Expo)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// Axios instance cho public API
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Lấy thông tin tracking theo token (public API)
const getTrackingInfo = async (token) => {
  try {
    const response = await publicApiClient.get("/public/tracking", {
      params: { token },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching tracking info:", error);
    throw error;
  }
};

export default {
  getTrackingInfo,
};
