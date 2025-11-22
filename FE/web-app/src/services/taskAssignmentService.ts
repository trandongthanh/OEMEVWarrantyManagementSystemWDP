import apiClient from "@/lib/apiClient";

/**
 * Task Assignment Service
 * Handles task assignment operations for service center managers
 *
 * ROLE-BASED ACCESS:
 * - service_center_manager: View task assignments for technicians
 */

export interface TaskAssignment {
  id: string;
  taskAssignmentId?: string;
  caseLineId: string | null;
  technicianId: string;
  vehicleProcessingRecordId?: string;
  assignedAt: string;
  completedAt?: string;
  status: string;
  taskType?: string; // DIAGNOSIS or REPAIR
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  technician?: {
    userId: string;
    name: string;
    email?: string;
    phone?: string;
    serviceCenterId?: string;
  };
  vehicleProcessingRecord?: {
    vehicleProcessingRecordId: string;
    vin: string;
    status: string;
    createdByStaffId?: string;
    vehicle?: {
      vin: string;
      vehicleModelId: string;
    };
  };
  caseLine?: {
    id: string;
    diagnosisText?: string;
    correctionText?: string;
    status: string;
    warrantyStatus?: string;
    guaranteeCase?: {
      guaranteeCaseId: string;
      contentGuarantee: string;
      vehicleProcessingRecord?: {
        vin: string;
        customerName?: string;
      };
    };
  };
}

export interface TaskAssignmentListResponse {
  status: "success";
  data: {
    tasks: TaskAssignment[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Get task assignments for technicians in service center
 * GET /task-assignments
 * Role: service_center_manager
 */
export async function getTaskAssignments(params?: {
  page?: number;
  limit?: number;
  technicianId?: string;
  status?: string;
}): Promise<{
  tasks: TaskAssignment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  try {
    const response = await apiClient.get<TaskAssignmentListResponse>(
      "/task-assignments",
      { params }
    );

    return {
      tasks: response.data.data.tasks || [],
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    console.error("Error fetching task assignments:", error);
    throw error;
  }
}

const taskAssignmentService = {
  getTaskAssignments,
};

export default taskAssignmentService;
