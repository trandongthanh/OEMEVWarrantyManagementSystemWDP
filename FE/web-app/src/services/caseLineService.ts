import apiClient from "@/lib/apiClient";

export interface CaseLine {
  id?: string; // Backend uses 'id' as primary key
  caseLineId?: string; // Alternative field name
  guaranteeCaseId?: string;
  diagnosisText?: string;
  correctionText?: string;
  componentId?: string | null;
  typeComponentId?: string | null; // Backend field for component type
  quantity?: number;
  quantityReserved?: number;
  warrantyStatus?: "ELIGIBLE" | "INELIGIBLE";
  status?: string;
  techId?: string;
  rejectionReason?: string | null;
  evidenceImageUrls?: string[]; // Array of evidence image URLs
  createdAt?: string;
  updatedAt?: string;
  // Nested relations from backend
  typeComponent?: {
    typeComponentId: string;
    sku: string;
    name: string;
    price: number;
  };
  guaranteeCase?: {
    guaranteeCaseId: string;
    contentGuarantee: string;
    status: string;
    vehicleProcessingRecord?: {
      vehicleProcessingRecordId: string;
      vin: string;
    };
  };
  diagnosticTechnician?: {
    userId: string;
    name: string;
  };
  repairTechnician?: {
    userId: string;
    name: string;
  };
  reservations?: Array<{
    reservationId: string;
    quantity: number;
    status: string;
  }>;
}

export interface CaseLineDetailResponse {
  status: "success";
  data: {
    caseLine: CaseLine;
  };
}

export interface UpdateCaseLineData {
  caseId?: string;
  diagnosisText?: string;
  correctionText?: string;
  typeComponentId?: string | null;
  quantity?: number;
  warrantyStatus?: "ELIGIBLE" | "INELIGIBLE";
  rejectionReason?: string | null;
  evidenceImageUrls?: string[]; // Array of evidence image URLs
}

export interface UpdateCaseLineResponse {
  status: "success";
  data: {
    caseLine: CaseLine;
  };
}

export interface ApproveCaseLinesData {
  approvedCaseLineIds?: { id: string }[];
  rejectedCaseLineIds?: { id: string }[];
  approverEmail: string; // Required for OTP verification
}

export interface ApproveCaseLinesResponse {
  status: "success";
  data: {
    approved: Array<{
      caselineId: string;
      status: string;
    }>;
    rejected: Array<{
      caselineId: string;
      status: string;
    }>;
  };
}

export interface AllocateStockResponse {
  status: "success";
  message: string;
  data: {
    componentReservations?: Array<{
      reservationId: string;
      caseLineId: string;
      componentId: string;
      status: string;
      createdAt?: string;
    }>;
    stockUpdates?: unknown[];
    componentStatusUpdates?: unknown[];
    formattedCaselineStatus?: Array<{
      caselineId: string;
      status: string;
      updatedAt: string;
    }>;
    // Old format (for backward compatibility)
    caseline?: {
      caselineId: string;
      componentId: string;
      quantity: number;
      quantityReserved: number;
      status: string;
    };
    reservations?: Array<{
      reservationId: string;
      caselineId: string;
      stockId: string;
      warehouseId: string;
      warehouseName: string;
      componentId: string;
      quantityReserved: number;
      status: string;
      createdAt: string;
    }>;
  };
}

export interface AssignTechnicianData {
  technicianId: string;
}

export interface AssignTechnicianResponse {
  status: "success";
  data: {
    caseline: {
      caselineId: string;
      status: string;
    };
    assignment: {
      taskAssignmentId: string;
      technicianId: string;
      technicianName: string;
      taskType: string;
      status: string;
    };
  };
}

export interface BulkUpdateStockQuantitiesData {
  caseLines: Array<{
    caseLineId: string;
    quantityReserved: number;
  }>;
}

// NOTE: Bulk update endpoint doesn't exist in backend yet
// Using single allocation endpoint in a loop instead

export interface BulkUpdateStockQuantitiesResponse {
  status: "success";
  message: string;
  data: {
    updatedCaseLines: Array<{
      caseLineId: string;
      quantityReserved: number;
      previousQuantity: number;
    }>;
  };
}

export interface GetCaseLinesListParams {
  page?: number;
  limit?: number;
  status?: string;
  guaranteeCaseId?: string;
  warrantyStatus?: "ELIGIBLE" | "INELIGIBLE";
  vehicleProcessingRecordId?: string;
  diagnosticTechId?: string;
  repairTechId?: string;
  sortBy?: "createdAt" | "updatedAt" | "status" | "warrantyStatus";
  sortOrder?: "ASC" | "DESC";
}

export interface GetCaseLinesListResponse {
  status: "success";
  data: {
    caseLines: CaseLine[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

class CaseLineService {
  /**
   * Get list of case lines with filters
   * GET /case-lines
   *
   * @role All authenticated users (filtered by service center)
   */
  async getCaseLinesList(
    params?: GetCaseLinesListParams
  ): Promise<GetCaseLinesListResponse> {
    try {
      const response = await apiClient.get("/case-lines", { params });
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching case lines list:", error);
      throw error;
    }
  }

  /**
   * Get case line details by ID
   * GET /case-lines/{caselineId}
   */
  async getCaseLineById(
    caselineId: string,
    caseId?: string
  ): Promise<CaseLineDetailResponse> {
    try {
      // If caseId is provided, use it in the URL path (backend validator requires it)
      const url = caseId
        ? `/guarantee-cases/${caseId}/case-lines/${caselineId}`
        : `/case-lines/${caselineId}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching case line details:", error);
      throw error;
    }
  }

  /**
   * Update case line information
   * PATCH /guarantee-cases/{caseId}/case-lines/{caselineId}
   * Note: Backend validator requires both caseId and caselineId in URL params
   */
  async updateCaseLine(
    caselineId: string,
    data: UpdateCaseLineData
  ): Promise<UpdateCaseLineResponse> {
    try {
      // Backend validator requires caseId in URL path, extract from data
      const { caseId, ...bodyData } = data;
      if (!caseId) {
        throw new Error("caseId is required to update case line");
      }
      const response = await apiClient.patch(
        `/guarantee-cases/${caseId}/case-lines/${caselineId}`,
        bodyData
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating case line:", error);
      throw error;
    }
  }

  /**
   * Approve or reject case lines (Staff only)
   * PATCH /case-lines/approve
   */
  async approveCaseLines(
    data: ApproveCaseLinesData
  ): Promise<ApproveCaseLinesResponse> {
    try {
      const response = await apiClient.patch("/case-lines/approve", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error approving/rejecting case lines:", error);
      throw error;
    }
  }

  /**
   * Allocate stock for a case line (Manager only)
   * POST /guarantee-cases/{caseId}/case-lines/{caselineId}/allocate-stock
   */
  async allocateStock(
    caseId: string,
    caselineId: string
  ): Promise<AllocateStockResponse> {
    try {
      const response = await apiClient.post(
        `/guarantee-cases/${caseId}/case-lines/${caselineId}/allocate-stock`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error allocating stock:", error);
      throw error;
    }
  }

  /**
   * Assign technician to repair a case line (Manager only)
   * PATCH /guarantee-cases/{caseId}/case-lines/{caselineId}/assign-technician
   * Note: Uses nested route structure to satisfy validator that expects both caseId and caselineId in params
   */
  async assignTechnicianToRepair(
    caseId: string,
    caselineId: string,
    data: AssignTechnicianData
  ): Promise<AssignTechnicianResponse> {
    try {
      const response = await apiClient.patch(
        `/guarantee-cases/${caseId}/case-lines/${caselineId}/assign-technician`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error assigning technician to case line:", error);
      throw error;
    }
  }

  /**
   * Mark repair as complete (Technician only)
   * PATCH /case-lines/{caselineId}/mark-repair-complete
   *
   * Transitions CaseLine from IN_REPAIR → COMPLETED
   *
   * @role service_center_technician
   */
  async markRepairComplete(caselineId: string): Promise<{
    status: "success";
    data: { caseline: CaseLine };
  }> {
    try {
      const response = await apiClient.patch(
        `/case-lines/${caselineId}/mark-repair-complete`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error marking repair as complete:", error);
      throw error;
    }
  }

  /**
   * Bulk update stock quantities for case lines (Manager, Staff, Technician)
   * POST /guarantee-cases/{caseId}
   *
   * Updates stock quantities for multiple case lines in a guarantee case.
   * Processes component reservations and stock allocations.
   *
   * @param caseId - Guarantee case ID
   * @param data - Array of case lines with quantity updates
   * @returns Updated case lines with previous and new quantities
   *
   * @role service_center_manager, service_center_staff, service_center_technician
   */
  async bulkUpdateStockQuantities(
    caseId: string,
    data: Omit<BulkUpdateStockQuantitiesData, "caseId">
  ): Promise<BulkUpdateStockQuantitiesResponse> {
    try {
      const payload = {
        caseId,
        ...data,
      };
      console.log("Bulk update payload:", JSON.stringify(payload, null, 2));
      const response = await apiClient.post(
        `/guarantee-cases/${caseId}`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error bulk updating stock quantities:", error);
      throw error;
    }
  }
}

const caseLineService = new CaseLineService();
export default caseLineService;
