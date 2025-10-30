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
  search?: string;
}

/**
 * ✅ Get warehouse information and stock levels (with filter)
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
 * ✅ Get flat list of components (for Inventory.tsx)
 */
export const getComponents = async (params?: {
  search?: string;
  category?: string;
}): Promise<
  {
    id: string;
    name: string;
    code: string;
    category: string;
    quantity: number;
    status: string;
  }[]
> => {
  try {
    const response = await apiClient.get("/warehouses/components", { params });
    return response.data?.data?.components || [];
  } catch (error) {
    console.error("Error fetching components:", error);
    return [];
  }
};

/**
 * ✅ Allocate components to a service center or task
 */
export const allocateComponent = async (payload: {
  stockId: string;
  quantity: number;
  allocatedTo: string; // could be serviceCenterId or technicianId
}) => {
  try {
    const response = await apiClient.post("/warehouses/allocate", payload);
    return response.data;
  } catch (error) {
    console.error("Error allocating component:", error);
    throw error;
  }
};

/**
 * ✅ Transfer components between warehouses
 */
export const transferComponent = async (payload: {
  fromWarehouseId: string;
  toWarehouseId: string;
  stockId: string;
  quantity: number;
  note?: string;
}) => {
  try {
    const response = await apiClient.post("/warehouses/transfer", payload);
    return response.data;
  } catch (error) {
    console.error("Error transferring component:", error);
    throw error;
  }
};

/**
 * Warehouse service object
 */
export const warehouseService = {
  getWarehouseInfo,
  getComponents,
  allocateComponent,
  transferComponent,
};

export default warehouseService;
