import api from "../api";

/**
 * Lấy tất cả phiếu sửa chữa (có phân trang)
 * API: GET /processing-records
 */
const getAllRecords = async (params) => {
  try {
    const response = await api.get("/processing-records", { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy ds phiếu sửa chữa (getAllRecords):", error);
    throw error;
  }
};

/**
 * Lấy một phiếu sửa chữa bằng ID
 * API: GET /processing-records/{id}
 */
const getRecordById = async (id) => {
  try {
    const response = await api.get(`/processing-records/${id}`);
    // Dựa theo file web, API này trả về { data: { record: ... } }
    return response.data.data.record;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phiếu (getRecordById):", error);
    throw error;
  }
};

/**
 * Tìm kiếm linh kiện tương thích
 * API: GET /processing-records/{id}/compatible-components
 */
const searchCompatibleComponents = async (recordId, category, searchName) => {
  try {
    const response = await api.get(
      `/processing-records/${recordId}/compatible-components`,
      {
        params: { category, searchName },
      }
    );
    // Dựa theo file web, API này trả về { data: { result: [...] } }
    return response.data.data.result;
  } catch (error) {
    console.error("Lỗi khi tìm linh kiện (searchCompatibleComponents):", error);
    throw error;
  }
};

/**
 * Hoàn tất chẩn đoán cho một phiếu sửa chữa (Quan trọng cho KTV)
 * API: PATCH /processing-records/{id}/complete-diagnosis
 *
 * Chuyển trạng thái:
 * - CaseLine: DRAFT → PENDING_APPROVAL
 * - GuaranteeCase: IN_DIAGNOSIS → DIAGNOSED
 * - VehicleProcessingRecord: IN_DIAGNOSIS → WAITING_CUSTOMER_APPROVAL
 */
const completeDiagnosis = async (recordId) => {
  try {
    const response = await api.patch(
      `/processing-records/${recordId}/complete-diagnosis`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hoàn tất chẩn đoán (completeDiagnosis):", error);
    throw error;
  }
};

const processingRecordService = {
  getAllRecords,
  getRecordById,
  searchCompatibleComponents,
  completeDiagnosis,
};

export default processingRecordService;