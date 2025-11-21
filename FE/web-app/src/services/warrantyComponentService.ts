import apiClient from "@/lib/apiClient";

export interface WarrantyComponent {
  warrantyComponentId: string;
  vehicleModelId: string;
  typeComponentId: string;
  quantity: number;
  durationMonth: number;
  mileageLimit: number;
  createdAt?: string;
  updatedAt?: string;
  typeComponent?: {
    typeComponentId: string;
    name: string;
    sku: string;
    category: string;
    price: number;
  };
  vehicleModel?: {
    vehicleModelId: string;
    vehicleModelName: string;
    sku: string;
    makeBrand?: string;
  };
}

export interface CreateWarrantyComponentPayload {
  typeComponentId: string;
  quantity: number;
  durationMonth: number;
  mileageLimit: number;
}

export interface UpdateWarrantyComponentRequest {
  quantity?: number;
  durationMonth?: number;
  mileageLimit?: number;
}

export interface GetWarrantyComponentsResponse {
  status: string;
  data: {
    totalItems: number;
    items: WarrantyComponent[];
    totalPages: number;
    currentPage: number;
  };
}

class WarrantyComponentService {
  /**
   * Get all warranty components with optional filters
   */
  async getWarrantyComponents(params?: {
    page?: number;
    limit?: number;
    vehicleModelId?: string;
    typeComponentId?: string;
  }): Promise<GetWarrantyComponentsResponse> {
    try {
      const response = await apiClient.get("/warranty-components", {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          vehicleModelId: params?.vehicleModelId,
          typeComponentId: params?.typeComponentId,
        },
      });
      // Map id to warrantyComponentId for consistency
      if (response.data.data.items) {
        response.data.data.items = response.data.data.items.map(
          (item: WarrantyComponent & { id?: string }) => ({
            ...item,
            warrantyComponentId: item.id || item.warrantyComponentId,
            // Keep original id for backend operations
          })
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching warranty components:", error);
      throw error;
    }
  }

  /**
   * Get a single warranty component by ID
   */
  async getWarrantyComponentById(id: string): Promise<WarrantyComponent> {
    try {
      const response = await apiClient.get(`/warranty-components/${id}`);
      const item = response.data.data;
      // Map id to warrantyComponentId for consistency
      return {
        ...item,
        warrantyComponentId: item.id,
      };
    } catch (error) {
      console.error("Error fetching warranty component:", error);
      throw error;
    }
  }

  /**
   * Update a warranty component
   */
  async updateWarrantyComponent(
    id: string,
    data: UpdateWarrantyComponentRequest
  ): Promise<WarrantyComponent> {
    try {
      const response = await apiClient.put(`/warranty-components/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error("Error updating warranty component:", error);
      throw error;
    }
  }

  /**
   * Delete a warranty component
   */
  async deleteWarrantyComponent(id: string): Promise<void> {
    try {
      await apiClient.delete(`/warranty-components/${id}`);
    } catch (error) {
      console.error("Error deleting warranty component:", error);
      throw error;
    }
  }
}

const warrantyComponentService = new WarrantyComponentService();
export default warrantyComponentService;
