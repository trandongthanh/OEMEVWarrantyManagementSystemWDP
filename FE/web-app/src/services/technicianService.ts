import apiClient from "@/lib/apiClient";

export interface TechnicianProcessingRecord {
  vin: string;
  vehicleProcessingRecordId?: string; // Added: primary key from backend
  checkInDate: string;
  odometer: number;
  status: string;
  mainTechnician: {
    userId: string;
    name: string;
  } | null;
  vehicle: {
    vin: string;
    model: {
      name: string;
      vehicleModelId: string;
    };
  };
  guaranteeCases: Array<{
    guaranteeCaseId: string;
    vehicleProcessingRecordId?: string; // Backend SHOULD include this but currently doesn't in list endpoint
    status: string;
    contentGuarantee: string;
  }>;
  createdByStaff: {
    userId: string;
    name: string;
  };
}

export interface TechnicianRecordsResponse {
  status: "success";
  data: {
    records: {
      records: TechnicianProcessingRecord[];
      recordsCount: number;
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
  typeComponentId: string;
  name: string;
  isUnderWarranty?: boolean;
}

export interface CompatibleComponentsResponse {
  status: "success";
  data: {
    result: CompatibleComponent[];
  };
}

class TechnicianService {
  /**
   * Get assigned processing records (technician view)
   * GET /processing-records
   */
  async getAssignedRecords(): Promise<TechnicianRecordsResponse> {
    try {
      const response = await apiClient.get("/processing-records");
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
    category: string,
    searchName?: string
  ): Promise<CompatibleComponentsResponse> {
    try {
      const params: Record<string, string> = { category };
      if (searchName) params.searchName = searchName;
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
  async updateStockQuantities(
    caseId: string,
    caselines: Array<{
      id: string;
      componentId: string;
      quantity: number;
    }>
  ): Promise<{
    status: string;
    data: {
      updatedStocks: unknown[];
      newComponentReservations: unknown[];
    };
  }> {
    try {
      const response = await apiClient.post(`/guarantee-cases/${caseId}`, {
        caselines,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating stock quantities:", error);
      throw error;
    }
  }
}

const technicianService = new TechnicianService();
export default technicianService;
