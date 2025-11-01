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
  limit?: number;
  offset?: number;
  serviceCenterId?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface ComponentsResponse {
  components: Array<{
    componentId: string;
    serialNumber: string;
    status: string;
    typeComponentId: string;
    typeComponent?: {
      name: string;
      sku: string;
    };
    reserved?: boolean;
    allocatedTo?: string;
  }>;
  total: number;
}

export interface WarehousesResponse {
  warehouses: Warehouse[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * ✅ Get warehouse information and stock levels (with filter)
 * Enhanced with pagination and filtering
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
 * ✅ Get warehouses with pagination
 */
export const getWarehouses = async (
  params?: WarehouseQueryParams
): Promise<WarehousesResponse> => {
  try {
    const response = await apiClient.get<{
      status: string;
      data: WarehousesResponse;
    }>("/warehouses", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
};

/**
 * ✅ Get components from a specific warehouse with status filtering
 */
export const getWarehouseComponents = async (
  warehouseId: string,
  status?: "ALL" | "IN_WAREHOUSE" | "RESERVED" | "ALLOCATED"
): Promise<ComponentsResponse> => {
  try {
    const response = await apiClient.get<{
      status: string;
      data: ComponentsResponse;
    }>(`/warehouses/${warehouseId}/components`, {
      params: { status },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching warehouse components:", error);
    throw error;
  }
};

/**
 * ✅ Get flat list of components (for Inventory.tsx)
 * Fetches all warehouses and flattens their stock into component list
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
    // Get all warehouses with their stocks
    const warehousesData = await getWarehouseInfo();
    const components: Map<
      string,
      {
        id: string;
        name: string;
        code: string;
        category: string;
        quantity: number;
        status: string;
      }
    > = new Map();

    // Flatten stocks from all warehouses and aggregate by component type
    warehousesData.warehouses.forEach((warehouse) => {
      const stocks = warehouse.stocks || warehouse.stock || [];
      stocks.forEach((stock) => {
        const key = stock.typeComponentId;
        const existing = components.get(key);

        if (existing) {
          // Aggregate quantities if same component exists in multiple warehouses
          existing.quantity += stock.quantityAvailable;
        } else {
          components.set(key, {
            id: stock.typeComponentId,
            name: stock.typeComponent.name,
            code: stock.typeComponent.sku,
            category: stock.typeComponent.category || "GENERAL",
            quantity: stock.quantityAvailable,
            status:
              stock.quantityAvailable === 0
                ? "OUT_OF_STOCK"
                : stock.quantityAvailable < 10
                ? "LOW_STOCK"
                : "IN_STOCK",
          });
        }
      });
    });

    let result = Array.from(components.values());

    // Apply search filter if provided
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter if provided
    if (params?.category) {
      result = result.filter((c) => c.category === params.category);
    }

    return result;
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
  getWarehouses,
  getWarehouseComponents,
  getComponents,
  allocateComponent,
  transferComponent,
};

export default warehouseService;
