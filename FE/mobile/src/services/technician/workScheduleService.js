import api from "../api"; 

/**
 * Lấy lịch làm việc của chính kỹ thuật viên
 * API: GET /work-schedules/my-schedule
 */
const getMySchedule = async (params) => {
  try {
    const response = await api.get("/work-schedules/my-schedule", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch làm việc cá nhân (getMySchedule):", error);
    throw error;
  }
};

const workScheduleService = {
  getMySchedule,
};

export default workScheduleService;