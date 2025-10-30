import apiClient from "@/lib/apiClient";

// ==================== Types ====================

export interface InventorySummary {
  warehouseId: string;
  warehouseName: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

interface RawInventorySummary {
  warehouseId: string;
  totalInStock: string;
  totalReserved: string;
  totalAvailable: string;
  warehouse: {
    warehouseId: string;
    name: string;
    serviceCenterId: string | null;
    vehicleCompanyId: string;
  };
}

export interface TypeComponentStock {
  typeComponentId: string;
  typeComponentName: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface ComponentDetail {
  componentId: string;
  serialNumber: string;
  status: string;
  typeComponentId: string;
}

export interface AllocationData {
  warehouseId: string;
  componentId: string;
  quantity: number;
  allocatedTo: string;
}

export interface TransferData {
  fromWarehouseId: string;
  toWarehouseId: string;
  componentId: string;
  quantity: number;
}

// ==================== API Functions ====================

/**
 * Get inventory summary for all warehouses
 * Parts coordinator service center: sees only their service center's warehouse
 * Parts coordinator company: sees all warehouses in their company
 */
export async function getInventorySummary(
  serviceCenterId?: string
): Promise<InventorySummary[]> {
  try {
    const response = await apiClient.get("/inventory/summary", {
      params: { serviceCenterId },
    });

    // Transform backend response to match frontend interface
    return response.data.data.summary.map((item: RawInventorySummary) => ({
      warehouseId: item.warehouseId,
      warehouseName: item.warehouse.name,
      totalStock: parseInt(item.totalInStock) || 0,
      reservedStock: Math.max(0, parseInt(item.totalReserved) || 0), // Ensure non-negative
      availableStock: Math.max(0, parseInt(item.totalAvailable) || 0), // Ensure non-negative
    }));
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    throw error;
  }
}

/**
 * Get stock levels by component type for a specific warehouse
 */
export async function getTypeComponents(
  warehouseId: string
): Promise<TypeComponentStock[]> {
  try {
    const response = await apiClient.get("/inventory/type-components", {
      params: { warehouseId },
    });
    return response.data.data.typeComponents;
  } catch (error) {
    console.error("Error fetching type components:", error);
    throw error;
  }
}

/**
 * Get specific components by type
 */
export async function getComponentsByType(
  typeComponentId: string,
  warehouseId?: string
): Promise<ComponentDetail[]> {
  try {
    const response = await apiClient.get(
      `/inventory/type-components/${typeComponentId}/components`,
      {
        params: { warehouseId },
      }
    );
    return response.data.data.components;
  } catch (error) {
    console.error("Error fetching components by type:", error);
    throw error;
  }
}

/**
 * Allocate components from warehouse
 */
export async function allocateComponents(data: AllocationData): Promise<void> {
  try {
    await apiClient.post("/inventory/allocate", data);
  } catch (error) {
    console.error("Error allocating components:", error);
    throw error;
  }
}

/**
 * Transfer components between warehouses
 */
export async function transferComponents(data: TransferData): Promise<void> {
  try {
    await apiClient.post("/inventory/transfer", data);
  } catch (error) {
    console.error("Error transferring components:", error);
    throw error;
  }
}

const inventoryService = {
  getInventorySummary,
  getTypeComponents,
  getComponentsByType,
  allocateComponents,
  transferComponents,
};

export default inventoryService;
