import apiClient from "@/lib/apiClient";

export interface Component {
  componentId: string;
  serialNumber: string;
  status:
    | "IN_WAREHOUSE"
    | "RESERVED"
    | "IN_TRANSIT"
    | "WITH_TECHNICIAN"
    | "INSTALLED"
    | "RETURNED";
  typeComponentId: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
  typeComponent?: {
    typeComponentId: string;
    name: string;
    category: string;
    price: number;
  };
  warehouse?: {
    warehouseId: string;
    name: string;
    address: string;
  };
}

export interface UpdateComponentStatusRequest {
  status:
    | "IN_WAREHOUSE"
    | "RESERVED"
    | "IN_TRANSIT"
    | "WITH_TECHNICIAN"
    | "INSTALLED"
    | "RETURNED";
  notes?: string;
}

export interface ComponentResponse {
  status: "success";
  data: {
    component: Component;
  };
}

/**
 * Update component status
 * PATCH /components/{componentId}/status
 */
const updateComponentStatus = async (
  componentId: string,
  data: UpdateComponentStatusRequest
): Promise<ComponentResponse> => {
  try {
    const response = await apiClient.patch(
      `/components/${componentId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating component status:", error);
    throw error;
  }
};

/**
 * Get component by ID
 * GET /components/{componentId}
 */
const getComponentById = async (
  componentId: string
): Promise<ComponentResponse> => {
  try {
    const response = await apiClient.get(`/components/${componentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching component:", error);
    throw error;
  }
};

/**
 * Search components by serial number
 * GET /components/search?serialNumber={serialNumber}
 */
const searchBySerialNumber = async (
  serialNumber: string
): Promise<{
  status: "success";
  data: { components: Component[] };
}> => {
  try {
    const response = await apiClient.get("/components/search", {
      params: { serialNumber },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching components:", error);
    throw error;
  }
};

const componentService = {
  updateComponentStatus,
  getComponentById,
  searchBySerialNumber,
};

export default componentService;
