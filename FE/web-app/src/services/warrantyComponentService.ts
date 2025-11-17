import apiClient from "@/lib/apiClient";

export interface WarrantyComponent {
  id: string;
  vehicleModelId: string;
  componentId: string;
  coverageDurationMonths: number;
  coverageMileage: number;
  createdAt: string;
  updatedAt: string;
  component?: {
    id: string;
    name: string;
    description?: string;
  };
  vehicleModel?: {
    id: string;
    name: string;
    manufacturerYear: number;
  };
}

export interface CreateWarrantyComponentPayload {
  componentId: string;
  coverageDurationMonths: number;
  coverageMileage: number;
}

export interface GetWarrantyComponentsResponse {
  success: boolean;
  data: {
    warrantyComponents: WarrantyComponent[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

class WarrantyComponentService {
  /**
   * Get all warranty components for a vehicle model
   */
  async getWarrantyComponents(
    vehicleModelId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<GetWarrantyComponentsResponse> {
    const response = await apiClient.get(
      `/oem-vehicle-models/${vehicleModelId}/warranty-components`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  /**
   * Create a warranty component configuration
   */
  async createWarrantyComponent(
    vehicleModelId: string,
    payload: CreateWarrantyComponentPayload
  ): Promise<{
    success: boolean;
    data: { warrantyComponent: WarrantyComponent };
  }> {
    const response = await apiClient.post(
      `/oem-vehicle-models/${vehicleModelId}/warranty-components`,
      payload
    );
    return response.data;
  }

  /**
   * Update a warranty component configuration
   */
  async updateWarrantyComponent(
    vehicleModelId: string,
    warrantyComponentId: string,
    payload: Partial<CreateWarrantyComponentPayload>
  ): Promise<{
    success: boolean;
    data: { warrantyComponent: WarrantyComponent };
  }> {
    const response = await apiClient.put(
      `/oem-vehicle-models/${vehicleModelId}/warranty-components/${warrantyComponentId}`,
      payload
    );
    return response.data;
  }

  /**
   * Delete a warranty component configuration
   */
  async deleteWarrantyComponent(
    vehicleModelId: string,
    warrantyComponentId: string
  ): Promise<{ success: boolean }> {
    const response = await apiClient.delete(
      `/oem-vehicle-models/${vehicleModelId}/warranty-components/${warrantyComponentId}`
    );
    return response.data;
  }
}

const warrantyComponentService = new WarrantyComponentService();
export default warrantyComponentService;
