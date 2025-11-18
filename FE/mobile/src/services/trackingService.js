import api from "./api"; // <-- MUST BE "api", not apiClient

const trackingService = {
  async getTrackingInfo(token) {
    try {
      const res = await api.get("/public/tracking", {
        params: { token },
      });
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching tracking info:", error);
      throw error;
    }
  },
};

export default trackingService;
