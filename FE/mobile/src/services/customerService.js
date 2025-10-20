// src/services/customerService.js
import api from "./api"; // ✅ axios instance (đã có baseURL và token)

export const findCustomer = async (phone, email) => {
  try {
    // 🧠 Tạo params object động
    const params = {};
    if (phone) params.phone = phone.trim();
    if (email) params.email = email.trim();

    // 🧩 Gọi API theo đúng chuẩn query params
    const res = await api.get("/customers", { params });

    return res.data;
  } catch (error) {
    console.error(
      "❌ Error finding customer:",
      error.response?.data || error.message
    );
    throw error;
  }
};
