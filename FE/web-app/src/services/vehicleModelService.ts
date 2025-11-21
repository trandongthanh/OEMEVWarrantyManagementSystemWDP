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
  vehicleCompanyId: string;
  sku: string;
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
  sku: string;
  totalIssues: number;
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
  data: {
    models: ProblematicModel[];
  };
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
    return response.data.data;
  } catch (error) {
    console.error("Error fetching problematic models:", error);
    throw error;
  }
}

/**
 * NOTE: There is NO GET endpoint for listing vehicle models in the backend.
 * Vehicle models can only be created, not listed through the API.
 * If you need to get vehicle models for dropdowns, you should:
 * 1. Request backend team to add GET /oem-vehicle-models endpoint, OR
 * 2. Store created vehicle model IDs locally after creation, OR
 * 3. Get vehicle models indirectly through other endpoints that include them
 */

const vehicleModelService = {
  createVehicleModel,
  getMostProblematicModels,
};

export default vehicleModelService;
