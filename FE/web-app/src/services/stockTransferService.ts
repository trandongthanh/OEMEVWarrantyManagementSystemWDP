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
  typeComponentId: string;
  quantityRequested: number;
  caselineId?: string;
}

export interface CreateStockTransferRequest {
  requestingWarehouseId: string;
  items: StockTransferRequestItem[];
  caselineIds: string[];
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
  // Relations
  requestingWarehouse?: {
    warehouseId: string;
    warehouseName: string;
  };
  requestedBy?: {
    userId: string;
    name: string;
  };
  items?: Array<{
    id: string;
    typeComponentId: string;
    quantityRequested: number;
    caselineId?: string | null;
    typeComponent?: {
      typeComponentId: string;
      name: string;
      sku: string;
      price: number;
    };
  }>;
}

export interface StockTransferRequestListResponse {
  status: "success";
  data: {
    requests: StockTransferRequest[];
    pagination: {
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

class StockTransferService {
  /**
   * Create a stock transfer request (Service Center Manager only)
   * POST /stock-transfer-requests
   *
   * @role service_center_manager
   */
  async createRequest(
    data: CreateStockTransferRequest
  ): Promise<CreateStockTransferResponse> {
    try {
      const response = await apiClient.post("/stock-transfer-requests", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating stock transfer request:", error);
      throw error;
    }
  }

  /**
   * Get list of stock transfer requests
   * GET /stock-transfer-requests
   *
   * @role service_center_manager, emv_staff, parts_coordinator_service_center, parts_coordinator_company
   */
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
    } catch (error: unknown) {
      console.error("Error fetching stock transfer requests:", error);
      throw error;
    }
  }

  /**
   * Get stock transfer request details by ID
   * GET /stock-transfer-requests/{requestId}
   *
   * @role service_center_manager, emv_staff, parts_coordinator_service_center, parts_coordinator_company
   */
  async getRequestById(
    requestId: string
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.get(
        `/stock-transfer-requests/${requestId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching stock transfer request details:", error);
      throw error;
    }
  }

  /**
   * Approve a stock transfer request (EMV Staff only)
   * PATCH /stock-transfer-requests/{requestId}/approve
   *
   * @role emv_staff
   */
  async approveRequest(
    requestId: string
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.patch(
        `/stock-transfer-requests/${requestId}/approve`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error approving stock transfer request:", error);
      throw error;
    }
  }

  /**
   * Reject a stock transfer request (EMV Staff only)
   * PATCH /stock-transfer-requests/{requestId}/reject
   *
   * @role emv_staff
   */
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
    } catch (error: unknown) {
      console.error("Error rejecting stock transfer request:", error);
      throw error;
    }
  }

  /**
   * Ship a stock transfer request (Parts Coordinator Company only)
   * PATCH /stock-transfer-requests/{requestId}/ship
   *
   * @role parts_coordinator_company
   */
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
    } catch (error: unknown) {
      console.error("Error shipping stock transfer request:", error);
      throw error;
    }
  }

  /**
   * Receive a stock transfer request (Parts Coordinator Service Center only)
   * PATCH /stock-transfer-requests/{requestId}/receive
   *
   * @role parts_coordinator_service_center
   */
  async receiveRequest(
    requestId: string
  ): Promise<StockTransferRequestDetailResponse> {
    try {
      const response = await apiClient.patch(
        `/stock-transfer-requests/${requestId}/receive`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error receiving stock transfer request:", error);
      throw error;
    }
  }

  /**
   * Cancel a stock transfer request (Service Center Manager or EMV Staff)
   * PATCH /stock-transfer-requests/{requestId}/cancel
   *
   * @role service_center_manager, emv_staff
   */
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
    } catch (error: unknown) {
      console.error("Error cancelling stock transfer request:", error);
      throw error;
    }
  }
}

const stockTransferService = new StockTransferService();
export default stockTransferService;
