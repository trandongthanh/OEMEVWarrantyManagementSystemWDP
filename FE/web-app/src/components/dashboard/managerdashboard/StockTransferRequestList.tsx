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
} from "lucide-react";
import { useState, useEffect } from "react";
import stockTransferService from "@/services/stockTransferService";
import type { StockTransferRequest } from "@/services/stockTransferService";

interface StockTransferRequestListProps {
  userRole: string;
  onRequestCreated?: () => void;
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
}: StockTransferRequestListProps) {
  const [requests, setRequests] = useState<StockTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      setRequests(response.data?.requests || []);
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

  const handleStatusFilterChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value || undefined;
    setSelectedStatus(newStatus);
    await fetchRequests(newStatus);
  };

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await stockTransferService.approveRequest(requestId);
      await fetchRequests();
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setActionLoading(requestId);
      await stockTransferService.rejectRequest(requestId, {
        rejectionReason: reason,
      });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert("Failed to reject request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleShip = async (requestId: string) => {
    const deliveryDate = prompt("Enter estimated delivery date (YYYY-MM-DD):");
    if (!deliveryDate) return;

    try {
      setActionLoading(requestId);
      await stockTransferService.shipRequest(requestId, {
        estimatedDeliveryDate: deliveryDate,
      });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to ship request:", error);
      alert("Failed to ship request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReceive = async (requestId: string) => {
    if (!confirm("Mark this shipment as received?")) return;

    try {
      setActionLoading(requestId);
      await stockTransferService.receiveRequest(requestId);
      await fetchRequests();
    } catch (error) {
      console.error("Failed to receive request:", error);
      alert("Failed to receive request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      setActionLoading(requestId);
      await stockTransferService.cancelRequest(requestId, {
        cancellationReason: reason,
      });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to cancel request:", error);
      alert("Failed to cancel request");
    } finally {
      setActionLoading(null);
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
              <p className="text-sm text-gray-500">
                {requests.length} request{requests.length !== 1 ? "s" : ""}
              </p>
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
                                  "Unknown"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                Requested by{" "}
                                {request.requestedBy?.name || "Unknown"}
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

                          {/* Manager/EMV: Cancel */}
                          {canCancel &&
                            !["RECEIVED", "REJECTED", "CANCELLED"].includes(
                              request.status
                            ) && (
                              <button
                                onClick={() => handleCancel(request.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Ban className="w-4 h-4" />
                                Cancel
                              </button>
                            )}

                          {/* View Details */}
                          <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
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
    </div>
  );
}
