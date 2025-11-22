"use client";

import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Ban,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Archive,
  Filter,
  User,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import stockTransferService from "@/services/stockTransferService";
import type { StockTransferRequest } from "@/services/stockTransferService";
import { CreateStockTransferRequestModal } from "./CreateStockTransferRequestModal";
import StockTransferRequestDetailModal from "../companydashboard/StockTransferRequestDetailModal";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PromptDialog } from "@/components/ui/PromptDialog";

interface StockTransferRequestListProps {
  userRole: string;
  onRequestCreated?: () => void;
  warehouseId?: string;
}

const statusColors = {
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
  RECEIVED: "bg-purple-100 text-purple-800 border-purple-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  PENDING_APPROVAL: Clock,
  APPROVED: CheckCircle,
  SHIPPED: Truck,
  RECEIVED: Archive,
  REJECTED: XCircle,
  CANCELLED: Ban,
};

export function StockTransferRequestList({
  userRole,
  onRequestCreated,
  warehouseId,
}: StockTransferRequestListProps) {
  const [requests, setRequests] = useState<StockTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [confirmReceiveDialogOpen, setConfirmReceiveDialogOpen] =
    useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [pendingActionRequestId, setPendingActionRequestId] = useState<
    string | null
  >(null);

  // Approve modal - warehouse selection
  const [companyWarehouses, setCompanyWarehouses] = useState<
    Array<{
      warehouseId: string;
      name?: string;
      warehouseName?: string;
      vehicleCompanyId?: string;
      serviceCenterId?: string;
    }>
  >([]);
  const [selectedSourceWarehouseId, setSelectedSourceWarehouseId] =
    useState<string>("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const fetchRequests = async (status?: string) => {
    try {
      setLoading(true);
      const response = await stockTransferService.getRequests({
        status: status as
          | "PENDING_APPROVAL"
          | "APPROVED"
          | "SHIPPED"
          | "RECEIVED"
          | "REJECTED"
          | "CANCELLED"
          | undefined,
        page: 1,
        limit: 50,
      });
      // Handle both possible response structures
      const requestsData =
        response.data?.requests || response.data?.stockTransferRequests || [];
      setRequests(requestsData);
    } catch (error) {
      console.error("Failed to fetch stock transfer requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRequestCreated]);

  // Auto-open detail modal when navigating from notification
  useEffect(() => {
    const notificationId = sessionStorage.getItem("selectedItemId");
    const notificationType = sessionStorage.getItem("selectedItemType");

    if (
      (notificationType === "stock-transfers" ||
        notificationType === "transfers") &&
      notificationId
    ) {
      // Auto-open the detail modal
      setSelectedRequestId(notificationId);
      setShowDetailModal(true);

      // Clear storage
      sessionStorage.removeItem("selectedItemId");
      sessionStorage.removeItem("selectedItemType");
    }
  }, []);

  const handleStatusFilterChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value || undefined;
    setSelectedStatus(newStatus);
    await fetchRequests(newStatus);
  };

  const handleApprove = async (requestId: string) => {
    setPendingActionRequestId(requestId);
    setSelectedSourceWarehouseId("");
    setApproveError(null);
    setApproveDialogOpen(true);
    await fetchCompanyWarehouses();
  };

  const fetchCompanyWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await fetch("/api/warehouse", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch warehouses");
      const data = await response.json();
      const warehouses = data.data?.warehouses || [];
      setCompanyWarehouses(
        warehouses.filter(
          (w: {
            warehouseId: string;
            vehicleCompanyId?: string;
            serviceCenterId?: string;
          }) => w.vehicleCompanyId
        )
      ); // Filter company warehouses

      if (warehouses.length === 1) {
        setSelectedSourceWarehouseId(warehouses[0].warehouseId);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      setApproveError("Failed to load warehouses");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleApproveConfirm = async () => {
    if (!pendingActionRequestId) return;

    if (!selectedSourceWarehouseId) {
      setApproveError("Please select a source warehouse");
      return;
    }

    try {
      setActionLoading(pendingActionRequestId);
      await stockTransferService.approveRequest(
        pendingActionRequestId,
        selectedSourceWarehouseId
      );
      await fetchRequests();
      toast.success("Request approved successfully");
      setApproveDialogOpen(false);
      setPendingActionRequestId(null);
    } catch (error) {
      console.error("Failed to approve request:", error);
      setApproveError(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to approve request"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setPendingActionRequestId(requestId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!pendingActionRequestId) return;

    try {
      setActionLoading(pendingActionRequestId);
      await stockTransferService.rejectRequest(pendingActionRequestId, {
        rejectionReason: reason,
      });
      await fetchRequests();
      toast.success("Request rejected");
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Failed to reject request");
    } finally {
      setActionLoading(null);
      setPendingActionRequestId(null);
    }
  };

  const handleShip = async (requestId: string) => {
    // NOTE: This function should never be called since service_center_manager cannot ship
    // Only parts_coordinator_company can ship (via StockTransferRequestManager component)
    toast.error(
      "Shipping requests is only available to parts coordinators from the company."
    );
    console.warn(
      "Ship action attempted by unauthorized role:",
      userRole,
      "Request ID:",
      requestId
    );
  };

  const handleShipConfirm = async () => {
    // NOTE: Deprecated - Ship functionality moved to StockTransferRequestManager
    // Service center managers cannot ship requests
    toast.error(
      "Shipping requests is only available to parts coordinators from the company."
    );
  };

  const handleReceive = async (requestId: string) => {
    setPendingActionRequestId(requestId);
    setConfirmReceiveDialogOpen(true);
  };

  const handleReceiveConfirm = async () => {
    if (!pendingActionRequestId) return;

    try {
      setActionLoading(pendingActionRequestId);
      await stockTransferService.receiveRequest(pendingActionRequestId);
      await fetchRequests();
      toast.success("Shipment marked as received");
    } catch (error) {
      console.error("Failed to receive request:", error);
      toast.error("Failed to receive request");
    } finally {
      setActionLoading(null);
      setPendingActionRequestId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setPendingActionRequestId(requestId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!pendingActionRequestId) return;

    try {
      setActionLoading(pendingActionRequestId);
      await stockTransferService.cancelRequest(pendingActionRequestId, {
        cancellationReason: reason,
      });
      await fetchRequests();
      toast.success("Request cancelled");
    } catch (error) {
      console.error("Failed to cancel request:", error);
      toast.error("Failed to cancel request");
    } finally {
      setActionLoading(null);
      setPendingActionRequestId(null);
    }
  };

  const canApproveReject = userRole === "emv_staff";
  const canShip = userRole === "parts_coordinator_company";
  const canReceive = userRole === "parts_coordinator_service_center";
  const canCancel =
    userRole === "service_center_manager" || userRole === "emv_staff";

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Stock Transfer Requests
          </h2>
          <p className="text-gray-600 mt-1">
            Manage component transfers between warehouses
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedStatus || ""}
                  onChange={handleStatusFilterChange}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="RECEIVED">Received</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                {userRole === "service_center_manager" && warehouseId && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Request
                  </button>
                )}
                <p className="text-sm text-gray-500">
                  {requests.length} request{requests.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  No stock transfer requests found
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {requests.map((request) => {
                  const StatusIcon = statusIcons[request.status];
                  const isProcessing = actionLoading === request.id;

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          {/* Status Badge and ID */}
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                statusColors[request.status]
                              }`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {request.status.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              #{request.id.slice(0, 8)}
                            </span>
                          </div>

                          {/* Request Details */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">From:</span>{" "}
                                {request.requestingWarehouse?.warehouseName ||
                                  request.requestingWarehouse?.name ||
                                  "Unknown"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                Requested by{" "}
                                {request.requestedBy?.name ||
                                  request.requester?.name ||
                                  "Unknown"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                {new Date(request.requestedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Items */}
                          {request.items && request.items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                Components ({request.items.length}):
                              </p>
                              <div className="space-y-1.5">
                                {request.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-900">
                                      {item.typeComponent?.name || "Unknown"}
                                    </span>
                                    <span className="text-gray-500 font-mono text-xs">
                                      Qty: {item.quantityRequested}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rejection/Cancellation Reason */}
                          {(request.rejectionReason ||
                            request.cancellationReason) && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-red-900">
                                    Reason:
                                  </p>
                                  <p className="text-sm text-red-700 mt-1">
                                    {request.rejectionReason ||
                                      request.cancellationReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {/* EMV Staff: Approve/Reject */}
                          {canApproveReject &&
                            request.status === "PENDING_APPROVAL" && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <ThumbsUp className="w-4 h-4" />
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(request.id)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}

                          {/* Company Coordinator: Ship */}
                          {canShip && request.status === "APPROVED" && (
                            <button
                              onClick={() => handleShip(request.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              Ship
                            </button>
                          )}

                          {/* SC Coordinator: Receive */}
                          {canReceive && request.status === "SHIPPED" && (
                            <button
                              onClick={() => handleReceive(request.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Archive className="w-4 h-4" />
                              )}
                              Receive
                            </button>
                          )}

                          {/* Manager Only: Cancel */}
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(request.id)}
                              disabled={
                                isProcessing ||
                                ["RECEIVED", "REJECTED", "CANCELLED"].includes(
                                  request.status
                                ) ||
                                request.status !== "PENDING_APPROVAL"
                              }
                              title={
                                ["RECEIVED", "REJECTED", "CANCELLED"].includes(
                                  request.status
                                )
                                  ? `Cannot cancel ${request.status.toLowerCase()} request`
                                  : request.status !== "PENDING_APPROVAL"
                                  ? "Manager can only cancel pending approval requests"
                                  : "Cancel this request"
                              }
                              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Ban className="w-4 h-4" />
                              Cancel
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setShowDetailModal(true);
                            }}
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Stock Transfer Request Modal */}
      {warehouseId && (
        <CreateStockTransferRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          warehouseId={warehouseId}
          onSuccess={() => {
            fetchRequests(selectedStatus);
            onRequestCreated?.();
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedRequestId && (
        <StockTransferRequestDetailModal
          requestId={selectedRequestId}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Reject Dialog */}
      <PromptDialog
        isOpen={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setPendingActionRequestId(null);
        }}
        onConfirm={handleRejectConfirm}
        title="Reject Request"
        message="Please provide a reason for rejecting this request:"
        placeholder="Enter rejection reason..."
        required
      />

      {/* Approve Dialog with Warehouse Selection */}
      {approveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Approve Request #{pendingActionRequestId?.slice(0, 8)}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the source warehouse to fulfill this request:
            </p>

            {loadingWarehouses ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : companyWarehouses.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center mb-4">
                <p className="text-sm text-yellow-800">
                  No company warehouses available
                </p>
              </div>
            ) : (
              <select
                value={selectedSourceWarehouseId}
                onChange={(e) => setSelectedSourceWarehouseId(e.target.value)}
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                disabled={actionLoading !== null}
              >
                <option value="">Select warehouse...</option>
                {companyWarehouses.map(
                  (warehouse: {
                    warehouseId: string;
                    name?: string;
                    warehouseName?: string;
                  }) => (
                    <option
                      key={warehouse.warehouseId}
                      value={warehouse.warehouseId}
                    >
                      {warehouse.name || warehouse.warehouseName}
                    </option>
                  )
                )}
              </select>
            )}

            {approveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{approveError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApproveDialogOpen(false);
                  setPendingActionRequestId(null);
                }}
                disabled={actionLoading !== null}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={actionLoading !== null || !selectedSourceWarehouseId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ship Dialog */}
      <PromptDialog
        isOpen={shipDialogOpen}
        onClose={() => {
          setShipDialogOpen(false);
          setPendingActionRequestId(null);
        }}
        onConfirm={handleShipConfirm}
        title="Ship Request"
        message="Enter the estimated delivery date:"
        placeholder="YYYY-MM-DD"
        inputType="date"
        required
      />

      {/* Cancel Dialog */}
      <PromptDialog
        isOpen={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setPendingActionRequestId(null);
        }}
        onConfirm={handleCancelConfirm}
        title="Cancel Request"
        message="Please provide a detailed reason for cancelling this stock transfer request:"
        placeholder="Enter cancellation reason (e.g., parts no longer needed, alternative sourcing, etc.)..."
        inputType="textarea"
        rows={4}
        minLength={10}
        maxLength={500}
        required
      />

      {/* Confirm Receive Dialog */}
      <ConfirmDialog
        isOpen={confirmReceiveDialogOpen}
        onClose={() => {
          setConfirmReceiveDialogOpen(false);
          setPendingActionRequestId(null);
        }}
        onConfirm={handleReceiveConfirm}
        title="Confirm Receipt"
        message="Mark this shipment as received? This action will update the stock levels."
        confirmText="Confirm"
        variant="info"
      />
    </div>
  );
}
