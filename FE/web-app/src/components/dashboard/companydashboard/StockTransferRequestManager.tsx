"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Building2,
  Clock,
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
    typeComponent: {
      typeComponentId: string;
      name: string;
      partNumber: string;
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

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const openApproveModal = (id: string) => {
    setSelectedRequestId(id);
    setShowApproveModal(true);
    setActionError(null);
  };

  const openRejectModal = (id: string) => {
    setSelectedRequestId(id);
    setShowRejectModal(true);
    setRejectionReason("");
    setActionError(null);
  };

  const openDetailModal = (id: string) => {
    setSelectedRequestId(id);
    setShowDetailModal(true);
  };

  const closeModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowDetailModal(false);
    setSelectedRequestId(null);
    setRejectionReason("");
    setActionError(null);
    setActionLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedRequestId) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await apiClient.patch(
        `/stock-transfer-requests/${selectedRequestId}/approve`
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
                          {item.typeComponent.name} (
                          {item.typeComponent.partNumber})
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
                {request.status === "PENDING_APPROVAL" && (
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

                {request.status === "APPROVED" && (
                  <p className="text-sm text-blue-600 font-medium flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4" />
                    Approved - Awaiting shipment
                  </p>
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
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
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

            <p className="text-gray-600 mb-6">
              Are you sure you want to approve this stock transfer request? This
              action will allow the warehouse to prepare and ship the requested
              components.
            </p>

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
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
