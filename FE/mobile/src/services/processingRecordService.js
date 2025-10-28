// src/services/processingRecordService.js
import api from "./api"; // axios instance đã cấu hình baseURL + token

// ✅ Lấy danh sách hồ sơ xử lý theo phân quyền
export const getProcessingRecords = async (
  page = 1,
  limit = 10,
  status = ""
) => {
  try {
    const params = { page, limit };
    if (status) params.status = status; // có thể lọc theo trạng thái

    const res = await api.get("/processing-records", { params });
    return res.data; // { status: "success", data: { records, pagination } }
  } catch (error) {
    console.error(
      "❌ Error fetching processing records:",
      error.response?.data || error
    );
    throw error;
  }
};

// ✅ Lấy chi tiết hồ sơ xử lý
export const getProcessingRecordById = async (id) => {
  try {
    const res = await api.get(`/processing-records/${id}`);
    return res.data; // { status: "success", data: { record } }
  } catch (error) {
    console.error(
      "❌ Error fetching record detail:",
      error.response?.data || error
    );
    throw error;
  }
};

// ✅ Tạo mới hồ sơ xử lý (Processing Record)
export const createProcessingRecord = async (payload) => {
  try {
    const res = await api.post("/processing-records", payload);
    return res.data; // { status: "success", data: { record } }
  } catch (error) {
    console.error(
      "❌ Error creating processing record:",
      error.response?.data || error
    );
    throw error;
  }
};
