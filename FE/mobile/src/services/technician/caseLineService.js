import api from "../api";

/**
 * Lấy danh sách các case line với bộ lọc
 * API: GET /case-lines
 */
const getCaseLinesList = async (params) => {
  try {
    const response = await api.get("/case-lines", { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy ds case line (getCaseLinesList):", error);
    throw error;
  }
};

/**
 * Lấy chi tiết case line bằng ID
 * API: GET /case-lines/{caselineId}
 *
 * SỬA LỖI: File web gốc xác nhận hàm này KHÔNG cần caseId.
 */
const getCaseLineById = async (caselineId) => {
  if (!caselineId) {
    const errorMsg = `Lỗi gọi API: caselineId bị rỗng.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const url = `/case-lines/${caselineId}`; //
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(
      `Lỗi khi lấy chi tiết case line (getCaseLineById): ${error.message}`
    );
    throw error;
  }
};

/**
 * Cập nhật thông tin case line (KTV dùng khi lưu chẩn đoán)
 * API: PATCH /guarantee-cases/{caseId}/case-lines/{caselineId}
 *
 * Hàm này yêu cầu caseId, giống hệt file web.
 */
const updateCaseLine = async (caselineId, data) => {
  try {
    const { caseId, ...bodyData } = data;
    if (!caseId) {
      throw new Error("caseId là bắt buộc để cập nhật case line");
    }
    const response = await api.patch(
      `/guarantee-cases/${caseId}/case-lines/${caselineId}`, //
      bodyData
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật case line (updateCaseLine):", error);
    throw error;
  }
};

/**
 * Đánh dấu sửa chữa hoàn tất (Quan trọng cho Kỹ thuật viên)
 * API: PATCH /case-lines/{caselineId}/mark-repair-complete
 */
const markRepairComplete = async (caselineId) => {
  try {
    const response = await api.patch(
      `/case-lines/${caselineId}/mark-repair-complete` //
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đánh dấu hoàn tất (markRepairComplete):", error);
    throw error;
  }
};

/**
 * Cập nhật số lượng tồn kho hàng loạt cho các case line
 * API: POST /guarantee-cases/{caseId}
 */
const bulkUpdateStockQuantities = async (caseId, data) => {
  try {
    const payload = {
      caseId,
      ...data, // data có dạng { caselines: [...] }
    };
    const response = await api.post(
      `/guarantee-cases/${caseId}`, //
      payload
    );
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi cập nhật kho hàng loạt (bulkUpdateStockQuantities):",
      error
    );
    throw error;
  }
};

// --- Các hàm KTV có thể không dùng ---

const approveCaseLines = async (data) => {
  try {
    const response = await api.patch("/case-lines/approve", data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi duyệt case line (approveCaseLines):", error);
    throw error;
  }
};

const allocateStock = async (caseId, caselineId) => {
  try {
    const response = await api.post(
      `/guarantee-cases/${caseId}/case-lines/${caselineId}/allocate-stock` //
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi phân bổ kho (allocateStock):", error);
    throw error;
  }
};

const assignTechnicianToRepair = async (caseId, caselineId, data) => {
  try {
    const response = await api.patch(
      `/guarantee-cases/${caseId}/case-lines/${caselineId}/assign-technician`, //
      data
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gán KTV (assignTechnicianToRepair):", error);
    throw error;
  }
};

// Đóng gói các hàm thành một đối tượng service để export
const caseLineService = {
  getCaseLinesList,
  getCaseLineById,
  updateCaseLine,
  markRepairComplete,
  bulkUpdateStockQuantities,
  approveCaseLines,
  allocateStock,
  assignTechnicianToRepair,
};

export default caseLineService;