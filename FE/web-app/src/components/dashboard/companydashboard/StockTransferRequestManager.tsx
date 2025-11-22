"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Building2,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Search,
  Filter,
  AlertTriangle,
  X,
  Eye,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { authService } from "@/services";
import StockTransferRequestDetailModal from "./StockTransferRequestDetailModal";

interface StockTransferRequest {
  id: string;
  requestingWarehouseId: string;
  requestedByUserId: string;
  approvedByUserId: string | null;
  rejectedByUserId: string | null;
  cancelledByUserId: string | null;
  status: string;
  rejectionReason: string | null;
  cancellationReason: string | null;
  requestedAt: string;
  receivedByUserId: string | null;
  approvedAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    userId: string;
    name: string;
    serviceCenterId: string;
  };
  requestingWarehouse: {
    warehouseId: string;
    name: string;
    serviceCenterId: string;
    vehicleCompanyId: string;
  };
  items?: Array<{
    itemId: string;
    component: {
      typeComponentId: string;
      name: string;
      sku: string;
      category?: string;
      makeBrand?: string;
    };
    quantityRequested: number;
    quantityApproved?: number;
  }>;
}

export default function StockTransferRequestManager() {
  const [requests, setRequests] = useState<StockTransferRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    StockTransferRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Get current user role
  const currentUser = authService.getUserInfo() || authService.getCurrentUser();
  const isPartsCoordinatorCompany =
    currentUser?.roleName === "parts_coordinator_company";

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Ship modal - component selection
  const [availableComponents, setAvailableComponents] = useState<any[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any>(null);

  // Approve modal - warehouse selection
  const [companyWarehouses, setCompanyWarehouses] = useState<any[]>([]);
  const [selectedSourceWarehouseId, setSelectedSourceWarehouseId] =
    useState<string>("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [warehouseStockInfo, setWarehouseStockInfo] = useState<
    Record<string, { canFulfill: boolean; items: any[] }>
  >({});

  const filterRequests = useCallback(() => {
    let filtered = [...requests];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.requestingWarehouse.name.toLowerCase().includes(query) ||
          req.requester.name.toLowerCase().includes(query) ||
          req.id.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter]);

  useEffect(() => {
    filterRequests();
  }, [filterRequests]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/stock-transfer-requests");
      const data = response.data.data?.stockTransferRequests || [];
      setRequests(data);
    } catch (err) {
      console.error("Failed to load stock transfer requests:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = async (id: string) => {
    setSelectedRequestId(id);
    setShowApproveModal(true);
    setSelectedSourceWarehouseId("");
    setActionError(null);
    setWarehouseStockInfo({});

    // Fetch request details and company warehouses with stock info
    await fetchCompanyWarehousesWithStock(id);
  };

  const fetchCompanyWarehousesWithStock = async (requestId: string) => {
    try {
      setLoadingWarehouses(true);

      // Fetch request details to get items needed
      const requestResponse = await apiClient.get(
        `/stock-transfer-requests/${requestId}`
      );
      const request =
        requestResponse.data.data?.stockTransferRequest ||
        requestResponse.data.data?.request;
      const items = request?.items || [];

      // Fetch all warehouses with their stocks
      const warehousesResponse = await apiClient.get("/warehouses");
      const allWarehouses =
        warehousesResponse.data.data?.warehouses ||
        warehousesResponse.data.data ||
        [];

      // Filter to only show company central warehouses (not service center warehouses)
      const userCompanyId = currentUser?.companyId;
      const companyWarehouses = allWarehouses.filter(
        (w: any) =>
          w.vehicleCompanyId &&
          w.vehicleCompanyId === userCompanyId &&
          !w.serviceCenterId // Only central warehouses, not service center warehouses
      );

      // Check stock availability for each warehouse
      const stockInfo: Record<string, { canFulfill: boolean; items: any[] }> =
        {};

      for (const warehouse of companyWarehouses) {
        const stocks = warehouse.stocks || [];
        const itemsStatus = items.map((item: any) => {
          const stock = stocks.find(
            (s: any) => s.typeComponentId === item.typeComponentId
          );
          const available = stock?.quantityAvailable || 0;
          const needed = item.quantityRequested || 0;

          return {
            name:
              stock?.typeComponent?.name ||
              item.component?.name ||
              "Unknown Component",
            needed,
            available,
            sufficient: available >= needed,
          };
        });

        stockInfo[warehouse.warehouseId] = {
          canFulfill: itemsStatus.every((i: any) => i.sufficient),
          items: itemsStatus,
        };
      }

      setCompanyWarehouses(companyWarehouses);
      setWarehouseStockInfo(stockInfo);

      // Auto-select first warehouse that can fulfill
      const fulfillableWarehouse = companyWarehouses.find(
        (w: any) => stockInfo[w.warehouseId]?.canFulfill
      );
      if (fulfillableWarehouse) {
        setSelectedSourceWarehouseId(fulfillableWarehouse.warehouseId);
      } else if (companyWarehouses.length === 1) {
        setSelectedSourceWarehouseId(companyWarehouses[0].warehouseId);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      setActionError("Failed to load warehouses and stock information");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedRequestId(id);
    setShowRejectModal(true);
    setRejectionReason("");
    setActionError(null);
  };

  const openShipModal = async (id: string) => {
    setSelectedRequestId(id);
    setShowShipModal(true);
    setEstimatedDeliveryDate("");
    setSelectedComponents([]);
    setActionError(null);

    // Fetch request details and available components
    await fetchComponentsForShipping(id);
  };

  const fetchComponentsForShipping = async (requestId: string) => {
    try {
      setLoadingComponents(true);

      // Get request details with reservations
      const detailsResponse = await apiClient.get(
        `/stock-transfer-requests/${requestId}`
      );
      const details =
        detailsResponse.data.data?.stockTransferRequest ||
        detailsResponse.data.data?.request;
      setRequestDetails(details);

      if (!details?.sourceWarehouseId) {
        setActionError("No source warehouse found for this request");
        return;
      }

      // Get reservations to know what components are needed
      const reservations = details.stockReservations || [];

      if (reservations.length === 0) {
        setActionError("No reservations found for this request");
        return;
      }

      // Fetch available components from source warehouse for each type
      const componentPromises = reservations.map(async (reservation: any) => {
        const typeComponentId = reservation.typeComponentId;
        const quantityNeeded = reservation.quantityReserved;

        try {
          const response = await apiClient.get("/components", {
            params: {
              warehouseId: details.sourceWarehouseId,
              typeComponentId,
              status: "IN_STOCK",
              limit: quantityNeeded + 10, // Get a few extra in case some are unavailable
            },
          });

          const components = response.data.data?.components || [];
          return {
            typeComponentId,
            typeName: reservation.stock?.typeComponent?.name || "Unknown",
            quantityNeeded,
            components: components.filter((c: any) => c.status === "IN_STOCK"),
          };
        } catch (error) {
          console.error(
            `Failed to fetch components for type ${typeComponentId}:`,
            error
          );
          return {
            typeComponentId,
            typeName: "Unknown",
            quantityNeeded,
            components: [],
          };
        }
      });

      const componentsByType = await Promise.all(componentPromises);
      setAvailableComponents(componentsByType);
    } catch (error) {
      console.error("Failed to fetch components:", error);
      setActionError("Failed to load available components");
    } finally {
      setLoadingComponents(false);
    }
  };

  const openDetailModal = (id: string) => {
    setSelectedRequestId(id);
    setShowDetailModal(true);
  };

  const closeModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowShipModal(false);
    setShowDetailModal(false);
    setSelectedRequestId(null);
    setRejectionReason("");
    setEstimatedDeliveryDate("");
    setActionError(null);
    setActionLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedRequestId) return;

    if (!selectedSourceWarehouseId) {
      setActionError("Please select a source warehouse");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await apiClient.patch(
        `/stock-transfer-requests/${selectedRequestId}/approve`,
        {
          sourceWarehouseId: selectedSourceWarehouseId,
        }
      );
      await loadRequests();
      closeModals();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message || "Failed to approve request"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequestId || !rejectionReason.trim()) {
      setActionError("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await apiClient.patch(
        `/stock-transfer-requests/${selectedRequestId}/reject`,
        {
          rejectionReason: rejectionReason.trim(),
        }
      );
      await loadRequests();
      closeModals();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message || "Failed to reject request"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleShip = async () => {
    if (!selectedRequestId || !estimatedDeliveryDate.trim()) {
      setActionError("Please provide an estimated delivery date");
      return;
    }

    if (selectedComponents.length === 0) {
      setActionError("Please select components to ship");
      return;
    }

    // Validate that selected quantity matches required quantity for each type
    const componentsByType = selectedComponents.reduce(
      (acc: any, componentId: string) => {
        const component = availableComponents
          .flatMap((group) => group.components)
          .find((c: any) => c.componentId === componentId);

        if (component) {
          const typeId = component.typeComponentId;
          acc[typeId] = (acc[typeId] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    // Check if quantities match
    for (const group of availableComponents) {
      const selectedQty = componentsByType[group.typeComponentId] || 0;
      if (selectedQty !== group.quantityNeeded) {
        setActionError(
          `Please select exactly ${group.quantityNeeded} component(s) for ${group.typeName}. Currently selected: ${selectedQty}`
        );
        return;
      }
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await apiClient.patch(
        `/stock-transfer-requests/${selectedRequestId}/ship`,
        {
          estimatedDeliveryDate: estimatedDeliveryDate.trim(),
          shippedComponents: selectedComponents,
        }
      );
      await loadRequests();
      closeModals();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || "Failed to ship request");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleComponentSelection = (componentId: string) => {
    setSelectedComponents((prev) =>
      prev.includes(componentId)
        ? prev.filter((id) => id !== componentId)
        : [...prev, componentId]
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800 border-yellow-300",
      APPROVED: "bg-blue-100 text-blue-800 border-blue-300",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
      RECEIVED: "bg-green-100 text-green-800 border-green-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-300",
    };

    const displayStatus = status.replace("_", " ");

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || styles.PENDING_APPROVAL
        }`}
      >
        {displayStatus}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl p-6 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-900 font-semibold">{error}</p>
        <button
          onClick={loadRequests}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by warehouse, requester, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 text-black pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="SHIPPED">Shipped</option>
            <option value="RECEIVED">Received</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No requests found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "No stock transfer requests at the moment"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Request #{request.id.slice(0, 8)}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>
                        <span className="font-medium">From:</span>{" "}
                        {request.requestingWarehouse.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>
                        <span className="font-medium">Requested by:</span>{" "}
                        {request.requester.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {request.items && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>
                          {request.items.length} item
                          {request.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              {request.items && request.items.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Requested Items:
                  </p>
                  <div className="space-y-1">
                    {request.items.slice(0, 3).map((item) => (
                      <div
                        key={item.itemId}
                        className="text-sm text-gray-600 flex justify-between"
                      >
                        <span>
                          {item.component.name} (SKU: {item.component.sku})
                        </span>
                        <span className="font-medium">
                          Qty: {item.quantityRequested}
                        </span>
                      </div>
                    ))}
                    {request.items.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{request.items.length - 3} more item(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200">
                {request.status === "PENDING_APPROVAL" &&
                  isPartsCoordinatorCompany && (
                    <div className="flex gap-3 mb-3">
                      <button
                        onClick={() => openApproveModal(request.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(request.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                {request.status === "APPROVED" && isPartsCoordinatorCompany && (
                  <div className="mb-3">
                    <button
                      onClick={() => openShipModal(request.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Ship Request
                    </button>
                  </div>
                )}

                <button
                  onClick={() => openDetailModal(request.id)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={actionLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Approve Request
                </h3>
                <p className="text-sm text-gray-500">
                  Request #{selectedRequestId?.slice(0, 8)}
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Select the source warehouse to fulfill this request:
            </p>

            {/* Warehouse Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Warehouse *
              </label>
              {loadingWarehouses ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : companyWarehouses.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-sm text-yellow-800">
                    No company warehouses available
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {companyWarehouses.map((warehouse) => {
                    const stockInfo = warehouseStockInfo[warehouse.warehouseId];
                    const canFulfill = stockInfo?.canFulfill || false;
                    return (
                      <div
                        key={warehouse.warehouseId}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSourceWarehouseId === warehouse.warehouseId
                            ? "border-green-500 bg-green-50"
                            : canFulfill
                            ? "border-gray-300 hover:border-green-300 bg-white"
                            : "border-gray-200 bg-gray-50 opacity-75"
                        }`}
                        onClick={() =>
                          setSelectedSourceWarehouseId(warehouse.warehouseId)
                        }
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={
                                  selectedSourceWarehouseId ===
                                  warehouse.warehouseId
                                }
                                onChange={() =>
                                  setSelectedSourceWarehouseId(
                                    warehouse.warehouseId
                                  )
                                }
                                className="w-4 h-4 text-green-600"
                              />
                              <h4 className="font-medium text-gray-900">
                                {warehouse.name || warehouse.warehouseName}
                              </h4>
                            </div>
                            {warehouse.address && (
                              <p className="text-sm text-gray-500 ml-6">
                                {warehouse.address}
                              </p>
                            )}
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              canFulfill
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {canFulfill ? "✓ Available" : "✗ Insufficient"}
                          </div>
                        </div>
                        {stockInfo && (
                          <div className="ml-6 mt-2 space-y-1">
                            {stockInfo.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-gray-600">
                                  {item.name}
                                </span>
                                <span
                                  className={`font-medium ${
                                    item.sufficient
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {item.available} / {item.needed} available
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{actionError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={actionLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Reject Request
                </h3>
                <p className="text-sm text-gray-500">
                  Request #{selectedRequestId?.slice(0, 8)}
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this stock transfer request:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
              rows={4}
              disabled={actionLoading}
            />

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{actionError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ship Request Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Ship Request
                    </h3>
                    <p className="text-sm text-gray-500">
                      Request #{selectedRequestId?.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModals}
                  disabled={actionLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Estimated Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Date *
                </label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={actionLoading}
                />
              </div>

              {/* Component Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Components to Ship *
                  </label>
                  <span className="text-xs text-gray-500">
                    {selectedComponents.length} selected
                  </span>
                </div>

                {loadingComponents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : availableComponents.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-yellow-800">
                      No components available or failed to load
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableComponents.map((group) => {
                      const selectedForType = selectedComponents.filter(
                        (id) => {
                          const comp = group.components.find(
                            (c: any) => c.componentId === id
                          );
                          return !!comp;
                        }
                      ).length;

                      const isComplete =
                        selectedForType === group.quantityNeeded;
                      const isOverSelected =
                        selectedForType > group.quantityNeeded;

                      return (
                        <div
                          key={group.typeComponentId}
                          className={`border-2 rounded-xl p-4 transition-all ${
                            isComplete
                              ? "border-green-300 bg-green-50/30"
                              : isOverSelected
                              ? "border-red-300 bg-red-50/30"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-base">
                                {group.typeName}
                              </h4>
                              <p className="text-sm text-gray-600 mt-0.5">
                                Need to select:{" "}
                                <span className="font-medium">
                                  {group.quantityNeeded}
                                </span>
                              </p>
                            </div>
                            <div
                              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                isComplete
                                  ? "bg-green-100 text-green-700 border-2 border-green-300"
                                  : isOverSelected
                                  ? "bg-red-100 text-red-700 border-2 border-red-300"
                                  : "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                              }`}
                            >
                              {selectedForType}/{group.quantityNeeded} selected
                            </div>
                          </div>

                          {group.components.length === 0 ? (
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center">
                              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                              <p className="text-sm font-medium text-red-800">
                                No IN_STOCK components available
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                              {group.components.map((component: any) => {
                                const isSelected = selectedComponents.includes(
                                  component.componentId
                                );
                                const isDisabled =
                                  actionLoading ||
                                  (!isSelected &&
                                    selectedForType >= group.quantityNeeded);

                                return (
                                  <label
                                    key={component.componentId}
                                    className={`flex items-center gap-3 p-3.5 border-2 rounded-lg cursor-pointer transition-all ${
                                      isDisabled
                                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                                        : isSelected
                                        ? "border-blue-500 bg-blue-50 shadow-sm hover:shadow-md"
                                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        !isDisabled &&
                                        toggleComponentSelection(
                                          component.componentId
                                        )
                                      }
                                      disabled={isDisabled}
                                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 mb-1">
                                        {component.serialNumber ||
                                          `ID: ${component.componentId.slice(
                                            0,
                                            12
                                          )}...`}
                                      </p>
                                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                                        {component.sku && (
                                          <span className="inline-flex items-center text-xs text-gray-600">
                                            <Package className="w-3 h-3 mr-1" />
                                            {component.sku}
                                          </span>
                                        )}
                                        {component.manufacturedDate && (
                                          <span className="inline-flex items-center text-xs text-gray-600">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(
                                              component.manufacturedDate
                                            ).toLocaleDateString()}
                                          </span>
                                        )}
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            component.status === "IN_STOCK"
                                              ? "bg-green-100 text-green-700"
                                              : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {component.status}
                                        </span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{actionError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleShip}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={
                  actionLoading ||
                  !estimatedDeliveryDate.trim() ||
                  selectedComponents.length === 0 ||
                  loadingComponents
                }
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Shipping...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Confirm Shipment ({selectedComponents.length} components)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequestId && (
        <StockTransferRequestDetailModal
          requestId={selectedRequestId}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}
