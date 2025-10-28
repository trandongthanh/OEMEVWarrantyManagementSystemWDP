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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await stockTransferService.getRequests({
        status: selectedStatus as
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
      setRequests(response.data.requests);
    } catch (error) {
      console.error("Failed to fetch stock transfer requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, onRequestCreated]);

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Stock Transfer Requests
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage component transfers between warehouses
          </p>
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus || ""}
          onChange={(e) => setSelectedStatus(e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No stock transfer requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const StatusIcon = statusIcons[request.status];
            const isProcessing = actionLoading === request.id;

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Left: Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          statusColors[request.status]
                        }`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {request.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-500">
                        Request #{request.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">From:</span>{" "}
                        {request.requestingWarehouse?.warehouseName ||
                          "Unknown"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Requested by:</span>{" "}
                        {request.requestedBy?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.requestedAt).toLocaleString()}
                      </p>

                      {/* Items */}
                      {request.items && request.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Components:
                          </p>
                          <div className="space-y-1">
                            {request.items.map((item) => (
                              <p
                                key={item.id}
                                className="text-xs text-gray-600"
                              >
                                • {item.typeComponent?.name || "Unknown"} (x
                                {item.quantityRequested})
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection/Cancellation Reason */}
                      {(request.rejectionReason ||
                        request.cancellationReason) && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                          <span className="font-medium">Reason:</span>{" "}
                          {request.rejectionReason ||
                            request.cancellationReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {/* EMV Staff: Approve/Reject */}
                    {canApproveReject &&
                      request.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}

                    {/* Company Coordinator: Ship */}
                    {canShip && request.status === "APPROVED" && (
                      <button
                        onClick={() => handleShip(request.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Ship
                      </button>
                    )}

                    {/* SC Coordinator: Receive */}
                    {canReceive && request.status === "SHIPPED" && (
                      <button
                        onClick={() => handleReceive(request.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Archive className="w-3.5 h-3.5" />
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
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}

                    {/* View Details */}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" />
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
  );
}
