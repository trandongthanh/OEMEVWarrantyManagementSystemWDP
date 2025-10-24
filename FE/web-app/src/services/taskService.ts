import apiClient from "@/lib/apiClient";

/**
 * Task Service
 * Handles task assignment and management API calls
 */

export interface TaskAssignment {
  taskAssignmentId: string;
  guaranteeCaseId: string;
  techId: string;
  assignedAt: string;
  completedAt?: string;
  status: string;
  guaranteeCase?: {
    caseId: string;
    vin: string;
    status: string;
  };
  technician?: {
    userId: string;
    name: string;
  };
}

export interface CaseLine {
  caseLineId: string;
  guaranteeCaseId: string;
  diagnosisText: string;
  correctionText: string;
  componentId?: string;
  quantity: number;
  warrantyStatus: "ELIGIBLE" | "INELIGIBLE";
  techId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseLineData {
  diagnosisText: string;
  correctionText: string;
  componentId?: string;
  quantity: number;
  warrantyStatus: "ELIGIBLE" | "INELIGIBLE";
}

/**
 * Create case lines for a guarantee case (Technician)
 * @param caseId - Guarantee case ID
 * @param caselines - Array of case line data
 * @returns Created case lines
 */
export const createCaseLines = async (
  caseId: string,
  caselines: CreateCaseLineData[]
): Promise<CaseLine[]> => {
  try {
    const response = await apiClient.post<{
      status: string;
      data: { caseLines: CaseLine[] };
    }>(`/guarantee-cases/${caseId}/case-lines`, { caselines });
    return response.data.data.caseLines;
  } catch (error) {
    console.error("Error creating case lines:", error);
    throw error;
  }
};

/**
 * Task service object
 */
export const taskService = {
  createCaseLines,
};

export default taskService;
