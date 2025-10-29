import apiClient from "@/lib/apiClient";

export interface ProcessingRecord {
  vehicleProcessingRecordId?: string; // Primary key from backend
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
      id?: string;
      caseLineId?: string;
      diagnosisText: string;
      correctionText: string;
      quantity: number;
      warrantyStatus: string;
      status?: string;
      rejectionReason?: string | null;
      repairTechId?: string | null;
      diagnosticTechId?: string | null;
      typeComponentId?: string;
      typeComponent?: {
        typeComponentId: string;
        name: string;
        category: string;
      };
    }>;
  }>;
}

export interface ProcessingRecordListResponse {
  status: string;
  data: {
    records: {
      records: ProcessingRecord[];
      recordsCount: number;
    };
    pagination?: {
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

/**
 * Assign a technician to a processing record
 * PATCH /processing-records/{id}/assignment
 */
const assignTechnician = async (
  recordId: string,
  technicianId: string
): Promise<ProcessingRecord> => {
  try {
    const response = await apiClient.patch(
      `/processing-records/${recordId}/assignment`,
      { technicianId }
    );
    return response.data.data.record;
  } catch (error) {
    console.error("Error assigning technician:", error);
    throw error;
  }
};

/**
 * Complete diagnosis for a processing record
 * PATCH /processing-records/{id}/complete-diagnosis
 *
 * Transitions:
 * - CaseLine: DRAFT → PENDING_APPROVAL
 * - GuaranteeCase: IN_DIAGNOSIS → DIAGNOSED
 * - VehicleProcessingRecord: IN_DIAGNOSIS → WAITING_CUSTOMER_APPROVAL
 *
 * @role service_center_technician
 */
const completeDiagnosis = async (
  recordId: string
): Promise<{
  status: "success";
  data: { record: ProcessingRecord };
}> => {
  try {
    const response = await apiClient.patch(
      `/processing-records/${recordId}/complete-diagnosis`
    );
    return response.data;
  } catch (error) {
    console.error("Error completing diagnosis:", error);
    throw error;
  }
};

/**
 * Mark a processing record as completed
 * PATCH /processing-records/{id}/completed
 *
 * Final step: Sets checkOutDate and status to COMPLETED.
 * All case lines must be completed before calling this.
 *
 * @role service_center_staff
 */
const completeRecord = async (
  recordId: string
): Promise<{
  status: "success";
  data: { record: ProcessingRecord };
}> => {
  try {
    const response = await apiClient.patch(
      `/processing-records/${recordId}/completed`
    );
    return response.data;
  } catch (error) {
    console.error("Error completing record:", error);
    throw error;
  }
};

const processingRecordService = {
  getAllRecords,
  getRecordById,
  searchCompatibleComponents,
  assignTechnician,
  completeDiagnosis,
  completeRecord,
};

export default processingRecordService;
