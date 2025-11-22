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
const markRepairComplete = async (caselineId, installationImageUrls) => {
  try {
    const response = await api.patch(
      `/case-lines/${caselineId}/mark-repair-complete`,
      { installationImageUrls }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đánh dấu hoàn tất (markRepairComplete):", error);
    throw error;
  }
};

const caseLineService = {
  getCaseLinesList,
  getCaseLineById,
  updateCaseLine,
  markRepairComplete,
};

export default caseLineService;