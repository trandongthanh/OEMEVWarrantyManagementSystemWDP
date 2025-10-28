// src/services/customerService.js
import api from "./api"; // ✅ axios instance đã có baseURL & token

// 📦 Lấy danh sách tất cả khách hàng (Manager)
export const getAllCustomers = async () => {
  try {
    const res = await api.get("/customers/all");
    return res.data; // { status, data: { customers: [...] } }
  } catch (error) {
    console.error(
      "❌ Error fetching customers:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🔍 Tìm khách hàng theo số điện thoại hoặc email
export const getCustomerByPhoneOrEmail = async (query) => {
  try {
    const params = {};
    if (query) {
      if (/^\d+$/.test(query)) params.phone = query.trim();
      else params.email = query.trim();
    }
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

// 🛠 Cập nhật thông tin khách hàng
export const updateCustomerById = async (id, payload) => {
  try {
    const res = await api.patch(`/customers/${id}`, payload);
    return res.data; // { status, data: { customer } }
  } catch (error) {
    console.error(
      "❌ Error updating customer:",
      error.response?.data || error.message
    );
    throw error;
  }
};
