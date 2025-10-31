import api from "./api";

/**
 * Logs a detailed error message, checking for API-specific responses.
 * @param {string} context - The context of the action (e.g., "fetching assigned records").
 * @param {any} error - The error object.
 */
function logApiError(context, error) {
  // Check if the error is from Axios/API with a response
  if (error.response) {
    console.error(
      `API Error in ${context}:`,
      {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      }
    );
  } else if (error.request) {
    // The request was made but no response was received
    console.error(`Network Error in ${context}: No response received.`, error.request);
  } else {
    // Something else happened in setting up the request
    console.error(`Error in ${context}:`, error.message);
  }
}


class TechnicianService {
  /**
   * Get assigned processing records (technician view)
   * GET /processing-records
   */
  async getAssignedRecords() {
    try {
      const response = await api.get("/processing-records");
      return response.data;
    } catch (error) {
      logApiError("getAssignedRecords", error);
      throw error;
    }
  }

  /**
   * Get processing record details
   * GET /processing-records/{id}
   */
  async getRecordDetails(recordId) {
    try {
      const response = await api.get(`/processing-records/${recordId}`);
      return response.data;
    } catch (error) {
      logApiError("getRecordDetails", error); // ✅ Sửa đổi
      throw error;
    }
  }

  /**
   * Create case lines for a guarantee case
   * POST /guarantee-cases/{caseId}/case-lines
   */
  async createCaseLines(caseId, data) {
    try {
      const response = await api.post(
        `/guarantee-cases/${caseId}/case-lines`,
        data
      );
      return response.data;
    } catch (error) {
      logApiError("createCaseLines", error); // ✅ Sửa đổi
      throw error;
    }
  }

  /**
   * Search compatible components in stock
   * GET /processing-records/{id}/compatible-components
   */
  async searchCompatibleComponents(recordId, category, searchName) {
    try {
      const params = { category };
      if (searchName) params.searchName = searchName;
      const response = await api.get(
        `/processing-records/${recordId}/compatible-components`,
        { params }
      );
      return response.data;
    } catch (error) {
      logApiError("searchCompatibleComponents", error); // ✅ Sửa đổi
      throw error;
    }
  }

  /**
   * Bulk update stock quantities for guarantee case
   * POST /guarantee-cases/{caseId}
   */
  async updateStockQuantities(caseId, caselines) {
    try {
      const response = await api.post(`/guarantee-cases/${caseId}`, {
        caselines,
      });
      return response.data;
    } catch (error) {
      logApiError("updateStockQuantities", error); // ✅ Sửa đổi
      throw error;
    }
  }
}

const technicianService = new TechnicianService();
export default technicianService;
