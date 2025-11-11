import api from "../api";
/**
 * Lấy các phiếu sửa chữa đã được gán cho kỹ thuật viên (người đã đăng nhập)
 * API: GET /processing-records
 */
const getAssignedRecords = async () => {
  try {
    const response = await api.get("/processing-records");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy các phiếu được gán (getAssignedRecords):", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một phiếu sửa chữa bằng ID
 * API: GET /processing-records/{id}
 */
const getRecordDetails = async (recordId) => {
  try {
    const response = await api.get(`/processing-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phiếu (getRecordDetails):", error);
    throw error;
  }
};

/**
 * Tạo các "case line" (hạng mục chẩn đoán) cho một "guarantee case" (hồ sơ bảo hành)
 * API: POST /guarantee-cases/{caseId}/case-lines
 */
const createCaseLines = async (caseId, data) => {
  try {
    // data có dạng { caselines: [...] }
    const response = await api.post(
      `/guarantee-cases/${caseId}/case-lines`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo case line (createCaseLines):", error);
    throw error;
  }
};

/**
 * Tìm kiếm linh kiện tương thích trong kho cho một phiếu sửa chữa
 * API: GET /processing-records/{id}/compatible-components
 */
const searchCompatibleComponents = async (recordId, category, searchName) => {
  try {
    const params = { category };
    if (searchName) {
      params.searchName = searchName;
    }
    const response = await api.get(
      `/processing-records/${recordId}/compatible-components`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm linh kiện (searchCompatibleComponents):", error);
    throw error;
  }
};

/**
 * Cập nhật một case line (hạng mục chẩn đoán)
 * API: PATCH /case-lines/{caseLineId}
 */
const updateCaseLine = async (caseLineId, data) => {
  try {
    const response = await api.patch(`/case-lines/${caseLineId}`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật case line (updateCaseLine):", error);
    throw error;
  }
};

/**
 * Cập nhật số lượng tồn kho hàng loạt cho một hồ sơ bảo hành
 * (Thường được gọi sau khi tạo case line)
 * API: POST /guarantee-cases/{caseId}
 */
const updateStockQuantities = async (caseId, caselines) => {
  try {
    const response = await api.post(`/guarantee-cases/${caseId}`, {
      caselines, // data có dạng { caselines: [{ id, componentId, quantity }] }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật kho (updateStockQuantities):", error);
    throw error;
  }
};

// Đóng gói các hàm thành một đối tượng service để export
const technicianService = {
  getAssignedRecords,
  getRecordDetails,
  createCaseLines,
  searchCompatibleComponents,
  updateCaseLine,
  updateStockQuantities,
};

export default technicianService;