import apiClient from "@/lib/apiClient";

/**
 * Warehouse Service
 * Handles warehouse and inventory API calls
 */

export interface Stock {
  typeComponentId: string;
  quantity: number;
  component: {
    name: string;
    price: number;
  };
}

export interface Warehouse {
  warehouseId: string;
  name: string;
  location: string;
  vehicleCompanyId: string;
  stock: Stock[];
}

export interface WarehouseQueryParams {
  vehicleCompanyId?: string;
  componentType?: string;
  minStock?: number;
}

/**
 * Get warehouse information and stock levels
 * @param params - Optional query parameters
 * @returns Warehouse information
 */
export const getWarehouseInfo = async (
  params?: WarehouseQueryParams
): Promise<{ warehouses: Warehouse[] }> => {
  try {
    const response = await apiClient.get<{
      status: string;
      data: { warehouses: Warehouse[] };
    }>("/warehouse", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching warehouse info:", error);
    throw error;
  }
};

/**
 * Warehouse service object
 */
export const warehouseService = {
  getWarehouseInfo,
};

export default warehouseService;
