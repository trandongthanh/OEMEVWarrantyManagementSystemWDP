import api from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Lấy danh sách các yêu cầu đặt trước linh kiện
 * API: GET /reservations
 */
const getComponentReservations = async (params) => {
  try {
    const response = await api.get("/reservations", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi lấy ds đặt trước linh kiện (getComponentReservations):",
      error
    );
    throw error;
  }
};


/**
 * Lắp đặt linh kiện lên xe (Quan trọng cho Kỹ thuật viên)
 * API: PATCH /reservations/{reservationId}/installComponent
 */
const installComponent = async (reservationId) => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    
    if (!userId) {
      throw new Error("Không tìm thấy thông tin người dùng (userId). Vui lòng đăng nhập lại.");
    }

    const response = await api.patch(
      `/reservations/${reservationId}/installComponent`,
      { userId: userId }
    );
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lắp đặt linh kiện (installComponent):", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một yêu cầu đặt trước
 */
const getReservationById = async (reservationId) => {
  try {
    const response = await api.get(`/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi lấy chi tiết đặt trước (getReservationById):",
      error
    );
    throw error;
  }
};

const componentReservationService = {
  getComponentReservations,
  installComponent,
  getReservationById,
};

export default componentReservationService;