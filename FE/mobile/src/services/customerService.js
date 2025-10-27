// src/services/customerService.js
import api from "./api"; // ✅ axios instance đã có baseURL & token

export const getCustomerByPhoneOrEmail = async (query) => {
  try {
    const params = {};
    if (query) {
      if (/^\d+$/.test(query)) params.phone = query.trim();
      else params.email = query.trim();
    }

    // ✅ Gọi API đúng endpoint
    const res = await api.get("/customers", { params });
    return res.data; // { status, data: { customer } }
  } catch (error) {
    console.error(
      "❌ Error finding customer:",
      error.response?.data || error.message
    );
    throw error;
  }
};
