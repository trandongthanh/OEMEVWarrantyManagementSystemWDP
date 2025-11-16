import apiClient from "@/lib/apiClient";

/**
 * Stock Transfer Request Service
 *
 * Handles all stock transfer request operations between Service Center and Company warehouses.
 *
 * ROLE-BASED ACCESS:
 * - service_center_manager: Create, view, cancel requests
 * - emv_staff: View all, approve, reject requests
 * - parts_coordinator_company: Ship requests
 * - parts_coordinator_service_center: Receive requests
 */

export interface StockTransferRequestItem {
   typeComponentId?: string;  // ✔ optional
  sku?: string;              // ✔ thêm sku cho warehouse restock
  quantityRequested: number;
  caselineId?: string;
}

export interface CreateStockTransferRequest {
  requestingWarehouseId: string;
  items: StockTransferRequestItem[];
  caselineIds?: string[];
}

export interface StockTransferRequest {
  id: string;
  requestingWarehouseId: string;
  sourcingWarehouseId?: string;
  status:
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "SHIPPED"
    | "RECEIVED"
    | "REJECTED"
    | "CANCELLED";
  requestedByUserId: string;
  approvedByUserId?: string | null;
  rejectedByUserId?: string | null;
  shippedByUserId?: string | null;
  receivedByUserId?: string | null;
  cancelledByUserId?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  shippedAt?: string | null;
  receivedAt?: string | null;
  cancelledAt?: string | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  estimatedDeliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;

  requestingWarehouse?: {
    warehouseId?: string;
    warehouseName?: string;
    name?: string;
    serviceCenterId?: string;
    vehicleCompanyId?: string;
  };
  requestedBy?: {
    userId: string;
    name: string;
    serviceCenterId?: string;
  };
  requester?: {
    userId: string;
    name: string;
    serviceCenterId?: string;
  };
  items?: Array<{
    id?: string;
    itemId?: string;
    typeComponentId: string;
    quantityRequested: number;
    quantityApproved?: number;
    caselineId?: string | null;
    typeComponent?: {
      typeComponentId: string;
      name: string;
      sku?: string;
      partNumber?: string;
      price?: number;
    };
  }>;
}

export interface StockTransferRequestListResponse {
  status: "success";
  data: {
    requests?: StockTransferRequest[];
    stockTransferRequests?: StockTransferRequest[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface StockTransferRequestDetailResponse {
  status: "success";
  data: {
    request: StockTransferRequest;
  };
}

export interface CreateStockTransferResponse {
  status: "success";
  data: {
    stockTransferRequest: {
      newStockTransferRequest: StockTransferRequest;
      items: StockTransferRequestItem[];
    };
  };
}

export interface RejectStockTransferRequest {
  rejectionReason: string;
}

export interface ShipStockTransferRequest {
  estimatedDeliveryDate: string;
}

export interface CancelStockTransferRequest {
  cancellationReason: string;
}

export interface TransferRequestDetails {
  id: string;
  fromWarehouse: {
    id: string;
    name: string;
    location: string;
  };
  toWarehouse: {
    id: string;
    name: string;
    location: string;
  };
  items: Array<{
    componentId: string;
    componentName: string;
    quantity: number;
    status: string;
  }>;
  requestedBy: {
    userId: string;
    name: string;
  };
  status: string;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
  timeline?: Array<{
    timestamp: string;
    action: string;
    performedBy: string;
    details?: string;
  }>;
}

export interface TransferRequestDetailsResponse {
  status: "success";
  data: {
    transferRequest: TransferRequestDetails;
  };
}

class StockTransferService {
  async createRequest(
    data: CreateStockTransferRequest
  ): Promise<CreateStockTransferResponse> {
    try {
      const response = await apiClient.post("/stock-transfer-requests", data);
      return response.data;
    } catch (error) {
      console.error("Error creating stock transfer request:", error);
      throw error;
    }
  }

  async getRequests(params?: {
    page?: number;
    limit?: number;
    status?:
      | "PENDING_APPROVAL"
      | "APPROVED"
      | "SHIPPED"
      | "RECEIVED"
      | "REJECTED"
      | "CANCELLED";
  }): Promise<StockTransferRequestListResponse> {
    try {
      const response = await apiClient.get("/stock-transfer-requests", {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.status && { status: params.status }),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching stock transfer requests:", error);
      throw error;
    }
  }

  async getRequestById(
    requestId: string
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.get(
        `/stock-transfer-requests/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching stock transfer request details:", error);
      throw error;
    }
  }

  async approveRequest(
    requestId: string
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.patch(
        `/stock-transfer-requests/${requestId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error("Error approving stock transfer request:", error);
      throw error;
    }
  }

  async rejectRequest(
    requestId: string,
    data: RejectStockTransferRequest
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.patch(
        `/stock-transfer-requests/${requestId}/reject`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting stock transfer request:", error);
      throw error;
    }
  }

  async shipRequest(
    requestId: string,
    data: ShipStockTransferRequest
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.patch(
        `/stock-transfer-requests/${requestId}/ship`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error shipping stock transfer request:", error);
      throw error;
    }
  }

  async receiveRequest(
    requestId: string
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.patch(
        `/stock-transfer-requests/${requestId}/receive`
      );
      return response.data;
    } catch (error) {
      console.error("Error receiving stock transfer request:", error);
      throw error;
    }
  }

  async cancelRequest(
    requestId: string,
    data: CancelStockTransferRequest
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.patch(
        `/stock-transfer-requests/${requestId}/cancel`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling stock transfer request:", error);
      throw error;
    }
  }

  async getTransferRequestDetails(
    requestId: string
  ): Promise<TransferRequestDetailsResponse> {
    try {
      const response = await apiClient.get(
        `/stock-transfer-requests/${requestId}/details`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching transfer request details:", error);
      throw error;
    }
  }

  /**
   * Create warehouse restock request
   * POST /stock-transfer-requests/warehouse-restock
   *
   * @role parts_coordinator_service_center
   */
  async createWarehouseRestock(
    data: CreateStockTransferRequest
  ): Promise<CreateStockTransferResponse> {
    try {
      const response = await apiClient.post(
        "/stock-transfer-requests/warehouse-restock",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating warehouse restock request:", error);
      throw error;
    }
  }
}

const stockTransferService = new StockTransferService();
export default stockTransferService;
