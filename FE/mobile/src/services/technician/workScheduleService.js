import api from "../api"; 

/**
 * Lấy lịch làm việc của chính kỹ thuật viên (người đã đăng nhập)
 * API: GET /work-schedules/my-schedule
 *
 * @param {object} params - Các tham số truy vấn (query params)
 * @param {string} params.startDate - (Tùy chọn) Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} params.endDate - (Tùy chọn) Ngày kết thúc (YYYY-MM-DD)
 * @returns {Promise<object>} Dữ liệu trả về từ API (thường là { data: { schedules: [...] } })
 */
const getMySchedule = async (params) => {
  try {
    const response = await api.get("/work-schedules/my-schedule", {
      params,
    });
    // API web của bạn trả về { status: "success", data: { schedules: [...] } }
    // Một số API khác lại trả về { status: "success", data: [...] }
    // Chúng ta sẽ trả về toàn bộ response.data để component tự xử lý
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch làm việc cá nhân (getMySchedule):", error);
    // Ném lỗi ra ngoài để component có thể bắt và xử lý (ví dụ: hiển thị thông báo)
    throw error;
  }
};

/**
 * Lấy danh sách các kỹ thuật viên rảnh
 * (Kỹ thuật viên có thể không dùng chức năng này, nhưng vẫn để đây nếu cần)
 * API: GET /work-schedules/available-technicians
 *
 * @param {object} params - Các tham số truy vấn
 * @param {string} params.date - Ngày cần kiểm tra (YYYY-MM-DD)
 * @returns {Promise<object>} Dữ liệu trả về từ API
 */
const getAvailableTechnicians = async (params) => {
  try {
    const response = await api.get("/work-schedules/available-technicians", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách KTV rảnh:", error);
    throw error;
  }
};

// Đóng gói các hàm thành một đối tượng service để export
const workScheduleService = {
  getMySchedule,
  getAvailableTechnicians,
};

export default workScheduleService;