import apiClient from "@/lib/apiClient";

/**
 * Vehicle Model Service
 * Handles all vehicle model management operations
 *
 * ROLE-BASED ACCESS:
 * - parts_coordinator_company: Create, view vehicle models
 * - emv_admin: View statistics and analytics
 */

export interface VehicleModel {
  vehicleModelId: string;
  vehicleModelName: string;
  sku: string;
  yearOfLaunch?: string;
  generalWarrantyDuration?: number; // in months
  generalWarrantyMileage?: number; // in km
  vehicleCompanyId: string;
  createdAt: string;
  updatedAt: string;
  warrantyComponents?: Array<{
    id: string;
    typeComponentId: string;
    warrantyPeriodMonths: number;
    warrantyMileageKm: number;
  }>;
}

export interface CreateVehicleModelRequest {
  vehicleModelName: string;
  vehicleCompanyId?: string; // Optional - backend extracts from auth token
  sku: string;
  placeOfManufacture: string;
  yearOfLaunch?: string;
  generalWarrantyDuration?: number;
  generalWarrantyMileage?: number;
  components: Array<{
    typeComponentId: string;
    durationMonth: number;
    mileageLimit: number;
    quantity: number;
  }>;
}

export interface VehicleModelListResponse {
  status: "success";
  data: {
    vehicleModels: VehicleModel[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface VehicleModelDetailResponse {
  status: "success";
  data: {
    vehicleModel: VehicleModel;
  };
}

export interface ProblematicModel {
  vehicleModelId: string;
  vehicleModelName: string;
  caseLineCount: number;
  sku?: string;
  companyName?: string;
  [key: string]: string | number | undefined;
}

export interface MostProblematicModelsParams {
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface MostProblematicModelsResponse {
  status: string;
  data: ProblematicModel[];
}

/**
 * Create a new vehicle model
 * POST /oem-vehicle-models
 * Role: parts_coordinator_company
 */
export async function createVehicleModel(
  data: CreateVehicleModelRequest
): Promise<VehicleModel> {
  try {
    const response = await apiClient.post<VehicleModelDetailResponse>(
      "/oem-vehicle-models",
      data
    );

    return response.data.data.vehicleModel;
  } catch (error) {
    console.error("Error creating vehicle model:", error);
    throw error;
  }
}

/**
 * Get most problematic vehicle models (ranked by total issues)
 * GET /oem-vehicle-models/statistics/most-problematic
 * Role: emv_admin
 */
export async function getMostProblematicModels(
  params: MostProblematicModelsParams = {}
): Promise<{ models: ProblematicModel[] }> {
  try {
    const response = await apiClient.get<MostProblematicModelsResponse>(
      "/oem-vehicle-models/statistics/most-problematic",
      { params }
    );
    return { models: response.data.data };
  } catch (error) {
    console.error("Error fetching problematic models:", error);
    throw error;
  }
}

/**
 * Get all vehicle models for the current company
 * GET /oem-vehicle-models
 * Role: parts_coordinator_company, service_center_manager, emv_admin
 */
export async function getVehicleModels(): Promise<VehicleModel[]> {
  try {
    const response = await apiClient.get<{
      status: string;
      data: VehicleModel[];
    }>("/oem-vehicle-models");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching vehicle models:", error);
    throw error;
  }
}

const vehicleModelService = {
  createVehicleModel,
  getMostProblematicModels,
  getVehicleModels,
};

export default vehicleModelService;
