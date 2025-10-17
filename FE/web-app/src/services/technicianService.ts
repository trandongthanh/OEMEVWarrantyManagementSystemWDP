import apiClient from "@/lib/apiClient";

export interface TechnicianProcessingRecord {
  id: string;
  vin: string;
  checkInDate: string;
  odometer: number;
  status: string;
  createdByStaff: {
    userId: string;
    name: string;
  };
  guaranteeCases: Array<{
    guaranteeCaseId: string;
    contentGuarantee: string;
  }>;
}

export interface TechnicianRecordsResponse {
  status: "success";
  data: {
    records: {
      records: TechnicianProcessingRecord[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        limit: number;
      };
    };
  };
}

export interface CaseLineInput {
  diagnosisText: string;
  correctionText: string;
  componentId: string | null;
  quantity: number;
  warrantyStatus: "ELIGIBLE" | "INELIGIBLE";
}

export interface CreateCaseLinesRequest {
  caselines: CaseLineInput[];
}

export interface CreateCaseLinesResponse {
  status: "success";
  data: {
    caseLines: Array<{
      caseLineId: string;
      guaranteeCaseId: string;
      diagnosisText: string;
      correctionText: string;
      componentId: string | null;
      quantity: number;
      warrantyStatus: string;
    }>;
  };
}

export interface CompatibleComponent {
  componentId: string;
  componentName: string;
  partNumber: string;
  quantityInStock: number;
}

export interface CompatibleComponentsResponse {
  status: "success";
  data: {
    components: CompatibleComponent[];
  };
}

class TechnicianService {
  /**
   * Get assigned processing records (technician view)
   * GET /processing-records
   */
  async getAssignedRecords(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<TechnicianRecordsResponse> {
    try {
      const params: Record<string, string | number> = { page, limit };
      if (status) params.status = status;

      const response = await apiClient.get("/processing-records", { params });
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching assigned records:", error);
      throw error;
    }
  }

  /**
   * Get processing record details
   * GET /processing-records/{id}
   */
  async getRecordDetails(recordId: string): Promise<TechnicianRecordsResponse> {
    try {
      const response = await apiClient.get(`/processing-records/${recordId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching record details:", error);
      throw error;
    }
  }

  /**
   * Create case lines for a guarantee case
   * POST /guarantee-cases/{caseId}/case-lines
   */
  async createCaseLines(
    caseId: string,
    data: CreateCaseLinesRequest
  ): Promise<CreateCaseLinesResponse> {
    try {
      const response = await apiClient.post(
        `/guarantee-cases/${caseId}/case-lines`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating case lines:", error);
      throw error;
    }
  }

  /**
   * Search compatible components in stock
   * GET /processing-records/{id}/compatible-components
   */
  async searchCompatibleComponents(
    recordId: string,
    search?: string
  ): Promise<CompatibleComponentsResponse> {
    try {
      const params = search ? { search } : {};
      const response = await apiClient.get(
        `/processing-records/${recordId}/compatible-components`,
        { params }
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error searching compatible components:", error);
      throw error;
    }
  }

  /**
   * Bulk update stock quantities for guarantee case
   * POST /guarantee-cases/{caseId}
   */
  async updateStockQuantities(caseId: string): Promise<{ status: string }> {
    try {
      const response = await apiClient.post(`/guarantee-cases/${caseId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating stock quantities:", error);
      throw error;
    }
  }
}

const technicianService = new TechnicianService();
export default technicianService;
