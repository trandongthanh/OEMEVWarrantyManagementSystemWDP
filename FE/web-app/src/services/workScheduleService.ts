import apiClient from "@/lib/apiClient";

/**
 * Work Schedule Service
 * Handles all work schedule management API calls
 */

// ==================== Types ====================

export interface WorkSchedule {
  scheduleId: string;
  technicianId: string;
  workDate: string; // YYYY-MM-DD
  status: "AVAILABLE" | "UNAVAILABLE";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  technician?: {
    userId: string;
    name: string;
    email: string;
    serviceCenterId: string;
    role: {
      roleName: string;
    };
  };
}

export interface AvailableTechnician {
  technicianId: string;
  fullName: string;
  email: string;
  availability: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface UploadSchedulesResponse {
  status: "success";
  data: {
    imported: number;
    failed: number;
    errors?: Array<{
      row: number;
      message: string;
    }>;
  };
}

export interface GetSchedulesResponse {
  status: "success";
  data: WorkSchedule[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MyScheduleResponse {
  status: "success";
  data: {
    schedules: WorkSchedule[];
  };
}

export interface AvailableTechniciansResponse {
  status: "success";
  data: {
    availableTechnicians: AvailableTechnician[];
  };
}

export interface UpdateScheduleRequest {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

export interface UpdateScheduleResponse {
  status: "success";
  data: {
    schedule: WorkSchedule;
  };
}

// ==================== Service Class ====================

class WorkScheduleService {
  /**
   * Upload Excel file for bulk schedule import (Manager only)
   * POST /work-schedules/upload
   *
   * @role service_center_manager
   */
  async uploadSchedules(file: File): Promise<UploadSchedulesResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        "/work-schedules/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Error uploading schedules:", error);
      throw error;
    }
  }

  /**
   * Get all work schedules with filters (Manager only)
   * GET /work-schedules
   *
   * @role service_center_manager
   */
  async getSchedules(params?: {
    startDate?: string;
    endDate?: string;
    technicianId?: string;
    status?: "AVAILABLE" | "UNAVAILABLE";
    page?: number;
    limit?: number;
  }): Promise<GetSchedulesResponse> {
    try {
      const response = await apiClient.get("/work-schedules", { params });
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching schedules:", error);
      throw error;
    }
  }

  /**
   * Get technician's own schedule
   * GET /work-schedules/my-schedule
   *
   * @role service_center_technician
   */
  async getMySchedule(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<MyScheduleResponse> {
    try {
      const response = await apiClient.get("/work-schedules/my-schedule", {
        params,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching my schedule:", error);
      throw error;
    }
  }

  /**
   * Get available technicians for a specific date/time
   * GET /work-schedules/available-technicians
   *
   * @role service_center_manager, service_center_staff
   */
  async getAvailableTechnicians(params: {
    date: string; // YYYY-MM-DD
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
  }): Promise<AvailableTechniciansResponse> {
    try {
      const response = await apiClient.get(
        "/work-schedules/available-technicians",
        { params }
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching available technicians:", error);
      throw error;
    }
  }

  /**
   * Update a work schedule (Manager only)
   * PATCH /work-schedules/{id}
   *
   * @role service_center_manager
   */
  async updateSchedule(
    scheduleId: string,
    data: UpdateScheduleRequest
  ): Promise<UpdateScheduleResponse> {
    try {
      const response = await apiClient.patch(
        `/work-schedules/${scheduleId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  }
}

const workScheduleService = new WorkScheduleService();
export default workScheduleService;
