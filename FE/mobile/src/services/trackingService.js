import apiPublic from "./apiPublic";

export const getTrackingInfo = async (token) => {
  try {
    const res = await apiPublic.get("/api/public/tracking", {
      params: { token },
    });

    return res.data;
  } catch (error) {
    console.error(
      "❌ Error fetching tracking info:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default {
  getTrackingInfo,
};
