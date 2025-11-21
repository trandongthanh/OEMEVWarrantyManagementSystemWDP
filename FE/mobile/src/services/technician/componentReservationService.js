import api from "../api";

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
 * Lấy (pickup) linh kiện từ kho (Dành cho Kỹ thuật viên)
 * API: PATCH /reservations/pickup
 * CẬP NHẬT: Gửi một mảng reservationIds. BE sẽ tự lấy techId từ token.
 */
const pickupComponents = async (reservationIds) => {
  try {
    const response = await api.patch(`/reservations/pickup`, {
      reservationIds,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi pickup linh kiện (pickupComponents):", error);
    throw error;
  }
};

/**
 * Lắp đặt linh kiện lên xe (Quan trọng cho Kỹ thuật viên)
 * API: PATCH /reservations/{reservationId}/installComponent
 */
const installComponent = async (reservationId) => {
  try {
    const response = await api.patch(
      `/reservations/${reservationId}/installComponent`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lắp đặt linh kiện (installComponent):", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một yêu cầu đặt trước
 * API: GET /reservations/{reservationId}
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

// Đóng gói các hàm thành một đối tượng service để export
const componentReservationService = {
  getComponentReservations,
  pickupComponents, 
  installComponent,
  getReservationById,
};

export default componentReservationService;