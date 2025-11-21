import apiClient from "@/lib/apiClient";

// ============================================================
// ✅ TYPES — MATCH CHUẨN THEO BACKEND
// ============================================================

// ====================== INVENTORY SUMMARY ===================

export interface InventorySummary {
  warehouseId: string;
  warehouseName: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

export interface RawInventorySummary {
  warehouseId: string;
  totalInStock: string;
  totalReserved: string;
  totalAvailable: string;
  warehouse?: {
    warehouseId: string;
    name: string;
    serviceCenterId: string | null;
    vehicleCompanyId: string;
  };
}

// ====================== TYPE COMPONENTS =====================

export interface TypeComponentStock {
  typeComponentId: string;
  typeComponentName: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

// Raw API structure
export interface StockItemFromAPI {
  stockId: string;
  warehouseId: string;
  typeComponentId: string;
  quantityInStock: number;
  quantityReserved: number;
  quantityAvailable: number;
  warehouse: {
    warehouseId: string;
    name: string;
    serviceCenterId: string | null;
    vehicleCompanyId: string;
  };
  typeComponent: {
    typeComponentId: string;
    name: string;
    sku: string;
    category: string;
    price: number;
  };
}

export interface ComponentDetail {
  componentId: string;
  serialNumber: string;
  status: string;
  typeComponentId: string;
}

// ====================== ALLOCATION / TRANSFER ===============

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

// ========================== ADJUSTMENT =======================

export interface InventoryAdjustmentSummary {
  adjustmentId: string;
  stockId: string;
  warehouseId?: string;
  adjustmentType: "IN" | "OUT";
  quantity: number;
  reason: string;
  note: string | null;
  adjustedByUserId: string;
  adjustedAt: string;
  created_at: string;
  updated_at: string;
  stock?: {
    stockId: string;
    quantityAvailable: number;
    quantityInStock: number;
    quantityReserved: number;
    typeComponentId: string;
    warehouseId: string;
    warehouse?: {
      warehouseId: string;
      name: string;
      address: string;
      serviceCenterId: string;
    };
    typeComponent?: {
      typeComponentId: string;
      name: string;
      sku: string;
      category: string;
      price: number;
      makeBrand: string;
    };
  };
  adjustedBy?: {
    userId: string;
    name: string;
    email: string;
  };
}

export interface InventoryAdjustmentDetail {
  adjustmentId: string;
  stockId: string;
  adjustedBy?: {
    userId: string;
    name: string;
    email: string;
  };
  warehouseId?: string;
  adjustmentType: "IN" | "OUT";
  quantity: number;
  reason: string;
  note: string | null;
  adjustedAt: string;
  createdAt: string;
  stock?: {
    stockId: string;
    quantityAvailable: number;
    quantityInStock: number;
    typeComponentId: string;
    warehouse?: {
      warehouseId: string;
      name: string;
      address: string;
    };
    typeComponent?: {
      typeComponentId: string;
      name: string;
      sku: string;
      category: string;
      price: number;
    };
  };
  items?: {
    componentId: string;
    typeComponentId: string;
    serialNumber: string;
    oldStatus: string;
    newStatus: string;
    delta: number;
  }[];
}

export interface AdjustmentPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface InventoryAdjustmentListResponse {
  items: InventoryAdjustmentSummary[];
  pagination: AdjustmentPagination;
}

// ======================= STOCK HISTORY ======================

export interface StockHistoryItem {
  adjustmentId: string;
  stockId: string;
  adjustmentType: "IN" | "OUT";
  quantity: number;
  quantityChange: number;
  reason: string;
  note?: string;
  adjustedByUserId?: string;
  adjustedAt?: string;
  created_at?: string;
  updated_at?: string;
  stock_id?: string;
  adjusted_by_user_id?: string;
  adjustedBy?: {
    userId: string;
    name: string;
    email: string;
  };
  adjustedByUser?: {
    userId: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  eventType: string;
  stock?: {
    stockId: string;
    warehouseId: string;
    typeComponentId: string;
    quantityInStock: number;
    quantityReserved: number;
    quantityAvailable: number;
    warehouse?: {
      warehouseId: string;
      name: string;
      address?: string;
    };
    typeComponent?: {
      typeComponentId: string;
      name: string;
      price: number;
      sku: string;
      category: string;
      makeBrand?: string;
    };
  };
}

export interface StockHistoryPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface StockHistoryResponse {
  stock?: {
    stockId: string;
    warehouseId: string;
    typeComponentId: string;
    quantityInStock: number;
    quantityReserved: number;
    quantityAvailable: number;
  };
  history: StockHistoryItem[];
  pagination: StockHistoryPagination;
}

// ======================= CREATE ADJUSTMENT ===================

export interface CreateAdjustmentIN {
  stockId: string;
  adjustmentType: "IN";
  reason: string;
  note?: string;
  components: { serialNumber: string }[];
}

export interface CreateAdjustmentOUT {
  stockId: string;
  adjustmentType: "OUT";
  reason: string;
  note?: string;
  components: { serialNumber: string }[];
}

export type CreateAdjustmentRequest = CreateAdjustmentIN | CreateAdjustmentOUT;

// ============================================================
// ⭐ NEW: MOST USED TYPE COMPONENTS
// ============================================================

export interface MostUsedTypeComponentItem {
  typeComponentId: string;
  typeComponentName: string;
  totalUsed: number;
}

// ============================================================
// ✅ HELPERS – CLEAN PARAMS
// ============================================================

function cleanParams<T extends Record<string, unknown>>(raw: T): Partial<T> {
  const result: Partial<T> = {};

  (Object.entries(raw) as [keyof T, unknown][]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value as T[keyof T];
    }
  });

  return result;
}

// ============================================================
// ✅ API FUNCTIONS
// ============================================================

export async function getInventorySummary(
  serviceCenterId?: string
): Promise<InventorySummary[]> {
  const response = await apiClient.get("/inventory/summary", {
    params: cleanParams({ serviceCenterId }),
  });

  return (response.data.data.summary ?? []).map(
    (item: RawInventorySummary) => ({
      warehouseId: item.warehouseId,
      warehouseName: item.warehouse?.name || `Warehouse ${item.warehouseId}`,
      totalStock: Number(item.totalInStock) || 0,
      reservedStock: Math.max(0, Number(item.totalReserved) || 0),
      availableStock: Math.max(0, Number(item.totalAvailable) || 0),
    })
  );
}

export async function getTypeComponents(
  warehouseId: string
): Promise<StockItemFromAPI[]> {
  const response = await apiClient.get("/inventory/type-components", {
    params: cleanParams({ warehouseId }),
  });

  return response.data.data.components?.typeComponents ?? [];
}

export async function getComponentsByType(
  typeComponentId: string,
  warehouseId?: string
): Promise<ComponentDetail[]> {
  const response = await apiClient.get(
    `/inventory/type-components/${typeComponentId}/components`,
    { params: cleanParams({ warehouseId }) }
  );

  return response.data.data.components ?? [];
}

// -------------------- ALLOCATION & TRANSFER -------------------

export async function allocateComponents(data: AllocationData): Promise<void> {
  await apiClient.post("/inventory/allocate", data);
}

export async function transferComponents(data: TransferData): Promise<void> {
  await apiClient.post("/inventory/transfer", data);
}

// --------------------------- ADJUSTMENT ----------------------

export async function getAdjustmentList(
  rawParams?: Partial<{
    warehouseId: string;
    typeComponentId: string;
    adjustmentType: string;
    reason: string;
    adjustedByUserId: string;
    startDate: string;
    endDate: string;
    page: number;
    limit: number;
  }>
): Promise<InventoryAdjustmentListResponse> {
  const params = cleanParams(rawParams ?? {});
  const response = await apiClient.get("/inventory/adjustments", { params });
  return response.data.data;
}

export async function getAdjustmentById(
  adjustmentId: string
): Promise<InventoryAdjustmentDetail> {
  const response = await apiClient.get(
    `/inventory/adjustments/${adjustmentId}`
  );
  return response.data.data;
}

export async function createAdjustment(
  data: CreateAdjustmentRequest
): Promise<void> {
  await apiClient.post("/inventory/adjustments", data);
}

// ----------------------- STOCK HISTORY -----------------------

export async function getStockHistory(
  stockId: string,
  page = 1,
  limit = 20
): Promise<StockHistoryResponse> {
  const response = await apiClient.get(`/inventory/stocks/${stockId}/history`, {
    params: cleanParams({ page, limit }),
  });

  return response.data.data;
}

// ============================================================
// ⭐ NEW API — MOST USED TYPE COMPONENTS
// ============================================================

export async function getMostUsedTypeComponents(
  params?: Partial<{
    limit: number;
    page: number;
    startDate: string;
    endDate: string;
  }>
): Promise<{
  items: MostUsedTypeComponentItem[];
  pagination: { totalItems: number; totalPages: number; currentPage: number };
}> {
  const response = await apiClient.get("/inventory/most-used-type-components", {
    params: cleanParams(params ?? {}),
  });

  return response.data.data;
}

// ============================================================
// ⭐ BULK ADJUSTMENT IMPORT
// ============================================================

/**
 * Download bulk adjustment import template
 */
export async function downloadBulkAdjustmentTemplate(): Promise<Blob> {
  const response = await apiClient.get(
    "/inventory/adjustments/import/template",
    {
      params: { template: "true" },
      responseType: "blob",
    }
  );

  return response.data;
}

/**
 * Bulk create inventory adjustments from Excel file
 */
export async function bulkCreateAdjustments(data: {
  file: File;
  warehouseId: string;
  adjustmentType: "IN" | "OUT";
  reason: string;
  note?: string;
}): Promise<{
  status: string;
  data: Array<{
    adjustment: {
      inventoryAdjustmentId: string;
      stockId: string;
      adjustmentType: string;
      quantity: number;
      reason: string;
      note?: string;
      adjustedByUserId: string;
      createdAt: string;
    };
    updatedStock: Record<string, unknown>;
    stock: Record<string, unknown>;
    quantity: number;
  }>;
}> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("warehouseId", data.warehouseId);
  formData.append("adjustmentType", data.adjustmentType);
  formData.append("reason", data.reason);
  if (data.note) {
    formData.append("note", data.note);
  }

  const response = await apiClient.post(
    "/inventory/adjustments/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

// ============================================================
// ✅ EXPORT
// ============================================================

const inventoryService = {
  getInventorySummary,
  getTypeComponents,
  getComponentsByType,
  allocateComponents,
  transferComponents,
  getAdjustmentList,
  getAdjustmentById,
  createAdjustment,
  getStockHistory,
  getMostUsedTypeComponents,
  downloadBulkAdjustmentTemplate, // ⭐ NEW
  bulkCreateAdjustments, // ⭐ NEW
};

export default inventoryService;
