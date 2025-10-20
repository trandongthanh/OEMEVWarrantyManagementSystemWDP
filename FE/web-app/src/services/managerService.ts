import apiClient from "@/lib/apiClient";

export interface Technician {
  userId: string;
  name: string;
  activeTaskCount: number;
  workSchedule: Array<{
    status: string;
    workDate: string;
  }>;
}

export interface ProcessingRecord {
  id: string;
  vin: string;
  status: string;
  checkInDate: string;
  odometer: number;
  mainTechnician?: {
    userId: string;
    name: string;
  };
  guaranteeCases: Array<{
    guaranteeCaseId: string;
    contentGuarantee: string;
  }>;
}

export interface ProcessingRecordsResponse {
  records: ProcessingRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface TechniciansResponse {
  data: Technician[];
  total: number;
}

export interface AssignTechnicianRequest {
  processingRecordId: string;
  technicianId: string;
}

export interface AssignTechnicianResponse {
  success: boolean;
  message: string;
}

const managerService = {
  async getTechnicians(): Promise<TechniciansResponse> {
    const response = await apiClient.get<{
      status: string;
      data: Technician[];
    }>("/users/technicians");
    return { data: response.data.data, total: response.data.data.length };
  },

  async getProcessingRecords(
    status?: string
  ): Promise<ProcessingRecordsResponse> {
    const params = status ? { status } : {};
    const response = await apiClient.get<{
      status: string;
      data: {
        records: ProcessingRecord[];
        total: number;
        page: number;
        limit: number;
      };
    }>("/processing-records", { params });
    return response.data.data;
  },

  async assignTechnician(
    data: AssignTechnicianRequest
  ): Promise<AssignTechnicianResponse> {
    const response = await apiClient.post<{
      status: string;
      message: string;
    }>("/processing-records/assign-technician", data);
    return {
      success: response.data.status === "success",
      message: response.data.message,
    };
  },
};

export default managerService;