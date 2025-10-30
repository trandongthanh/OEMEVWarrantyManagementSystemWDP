import apiClient from "@/lib/apiClient";

/**
 * Warehouse Service
 * Handles warehouse and inventory API calls
 */

export interface Stock {
  stockId: string;
  typeComponentId: string;
  quantityInStock: number;
  quantityReserved: number;
  quantityAvailable: number;
  typeComponent: {
    typeComponentId: string;
    name: string;
    sku: string;
    category: string;
  };
}

export interface Warehouse {
  warehouseId: string;
  name: string;
  address: string;
  vehicleCompanyId: string | null;
  serviceCenterId: string | null;
  priority: number;
  createdAt: string;
  updatedAt: string;
  serviceCenter?: {
    serviceCenterId: string;
    name: string;
    address: string;
  };
  company?: {
    vehicleCompanyId: string;
    name: string;
  } | null;
  stocks: Stock[]; // API uses 'stocks' not 'stock'
  stock?: Stock[]; // Keep for backward compatibility
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
    }>("/warehouses", { params });
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
