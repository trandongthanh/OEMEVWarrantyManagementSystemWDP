import api from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

/**
 * Lấy các phiếu sửa chữa đã được gán cho kỹ thuật viên (người đã đăng nhập)
 * API: GET /processing-records
 */
const getAssignedRecords = async (filters = {}) => { 
  try {
    const serviceCenterId = await AsyncStorage.getItem("serviceCenterId");
    const userId = await AsyncStorage.getItem("userId");
    const userRole = await AsyncStorage.getItem("userRole");

    const params = {
      ...filters,
      serviceCenterId, 
      userId, 
      roleName: userRole, 
      
      page: filters.page || 1,
      limit: filters.limit || 20, 
    };
    
    if (!params.serviceCenterId || !params.userId || !params.roleName) {
      throw new Error("Thông tin KTV (serviceCenterId, userId, userRole) bị thiếu trong AsyncStorage.");
    }

    const response = await api.get("/processing-records", { params });
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
      caselines,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật kho (updateStockQuantities):", error);
    throw error;
  }
};

const technicianService = {
  getAssignedRecords,
  getRecordDetails,
  createCaseLines,
  searchCompatibleComponents,
  updateCaseLine,
  updateStockQuantities,
};

export default technicianService;