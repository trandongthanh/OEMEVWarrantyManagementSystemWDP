import api from "./api"; // axios instance đã cấu hình baseURL + token

/**
 * Lấy danh sách kỹ thuật viên tại trung tâm dịch vụ
 * Có thể lọc theo trạng thái làm việc trong ngày hôm nay.
 *
 * @param {string} status - Trạng thái làm việc hôm nay (tùy chọn):
 *   - "WORKING"         → Đang làm việc
 *   - "DAY_OFF"         → Nghỉ trong ngày
 *   - "LEAVE_REQUESTED" → Đã gửi yêu cầu nghỉ
 *   - "LEAVE_APPROVED"  → Nghỉ đã được duyệt
 *   - "" (rỗng)         → Lấy tất cả kỹ thuật viên
 *
 * @returns {Promise<Object>} Dữ liệu phản hồi từ server:
 *   { status: "success", data: [ {id, name, status, activeTaskCount, workSchedule} ] }
 */
export const getTechnicians = async (status = "") => {
  try {
    const params = {};
    if (status) params.status = status;

    const res = await api.get("/users/technicians", { params });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error fetching technicians:",
      error.response?.data || error
    );
    throw error;
  }
};
