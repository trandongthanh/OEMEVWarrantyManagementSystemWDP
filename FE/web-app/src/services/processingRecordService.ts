import apiClient from "@/lib/apiClient";

export interface ProcessingRecord {
  id?: string;
  vin: string;
  checkInDate: string;
  checkOutDate?: string | null;
  odometer: number;
  status: string;
  mainTechnicianId?: string | null;
  vehicle: {
    vin: string;
    licensePlate?: string;
    model:
      | {
          name: string;
          vehicleModelId: string;
        }
      | string;
    company?: string;
    owner?: {
      id: string;
      fullName: string;
      phone: string;
      email: string;
    };
  };
  mainTechnician?: {
    userId: string;
    name: string;
  } | null;
  createdByStaff?: {
    userId: string;
    name: string;
  };
  guaranteeCases?: Array<{
    guaranteeCaseId?: string;
    caseId?: string;
    contentGuarantee: string;
    status?: string;
    statusForGuaranteeCase?: string;
    caseLines?: Array<{
      caseLineId: string;
      diagnosisText: string;
      correctionText: string;
      quantity: number;
      warrantyStatus: string;
    }>;
  }>;
}

export interface ProcessingRecordListResponse {
  status: string;
  data: {
    records: ProcessingRecord[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CompatibleComponent {
  typeComponentId: string;
  name: string;
  category: string;
  price: number;
  availableQuantity: number;
}

/**
 * Get all processing records with pagination
 * GET /processing-records
 */
const getAllRecords = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ProcessingRecordListResponse> => {
  try {
    const response = await apiClient.get("/processing-records", {
      params: {
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching processing records:", error);
    throw error;
  }
};

/**
 * Get a single processing record by ID
 * GET /processing-records/{id}
 */
const getRecordById = async (id: string): Promise<ProcessingRecord> => {
  try {
    const response = await apiClient.get(`/processing-records/${id}`);
    return response.data.data.record;
  } catch (error) {
    console.error("Error fetching processing record:", error);
    throw error;
  }
};

/**
 * Search compatible components for a processing record
 * GET /processing-records/{id}/compatible-components
 */
const searchCompatibleComponents = async (
  recordId: string,
  category: string,
  searchName?: string
): Promise<CompatibleComponent[]> => {
  try {
    const response = await apiClient.get(
      `/processing-records/${recordId}/compatible-components`,
      {
        params: { category, searchName },
      }
    );
    return response.data.data.result;
  } catch (error) {
    console.error("Error searching compatible components:", error);
    throw error;
  }
};

const processingRecordService = {
  getAllRecords,
  getRecordById,
  searchCompatibleComponents,
};

export default processingRecordService;
