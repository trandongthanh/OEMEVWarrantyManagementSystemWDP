"use client";

import { useEffect, useState } from "react";
import {
  X,
  Package,
  User,
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Archive,
  Ban,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import apiClient from "@/lib/apiClient";

interface StockTransferRequestDetail {
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
  approvedAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  estimatedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: {
    userId: string;
    name: string;
    serviceCenterId: string;
  };
  requestedBy?: {
    userId: string;
    name: string;
    serviceCenterId: string;
  };
  requestingWarehouse?: {
    warehouseId: string;
    name: string;
    serviceCenterId: string;
    vehicleCompanyId: string;
  };
  approvedBy?: {
    userId: string;
    name: string;
  } | null;
  rejectedBy?: {
    userId: string;
    name: string;
  } | null;
  shippedBy?: {
    userId: string;
    name: string;
  } | null;
  receivedBy?: {
    userId: string;
    name: string;
  } | null;
  cancelledBy?: {
    userId: string;
    name: string;
  } | null;
  items?: Array<{
    id: string;
    itemId?: string;
    typeComponentId: string;
    quantityRequested: number;
    quantityApproved?: number;
    typeComponent?: {
      typeComponentId: string;
      name: string;
      partNumber?: string;
      sku?: string;
      price?: number;
    };
  }>;
}

interface StockTransferRequestDetailModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StockTransferRequestDetailModal({
  requestId,
  isOpen,
  onClose,
}: StockTransferRequestDetailModalProps) {
  const [request, setRequest] = useState<StockTransferRequestDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequestDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        `/stock-transfer-requests/${requestId}`
      );
      setRequest(
        response.data.data?.stockTransferRequest || response.data.data?.request
      );
    } catch (err) {
      console.error("Failed to load request details:", err);
      setError("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && requestId) {
      loadRequestDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, requestId]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800 border-yellow-300",
      APPROVED: "bg-blue-100 text-blue-800 border-blue-300",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
      RECEIVED: "bg-green-100 text-green-800 border-green-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-300",
    };

    const icons = {
      PENDING_APPROVAL: Clock,
      APPROVED: CheckCircle,
      SHIPPED: Truck,
      RECEIVED: Archive,
      REJECTED: XCircle,
      CANCELLED: Ban,
    };

    const Icon = icons[status as keyof typeof icons] || Clock;
    const displayStatus = status.replace(/_/g, " ");

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
          styles[status as keyof typeof styles] || styles.PENDING_APPROVAL
        }`}
      >
        <Icon className="w-4 h-4" />
        {displayStatus}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Request Details
            </h2>
            {request && (
              <p className="text-sm text-gray-500 mt-1">
                ID: #{request.id.slice(0, 8)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : request ? (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Status
                </h3>
                {getStatusBadge(request.status)}
              </div>

              {/* Warehouse Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Requesting Warehouse
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-gray-900">
                      {request.requestingWarehouse?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      Service Center ID:{" "}
                      {request.requestingWarehouse?.serviceCenterId?.slice(
                        0,
                        8
                      ) || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Requested By
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-gray-900">
                      {request.requester?.name ||
                        request.requestedBy?.name ||
                        "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(request.requestedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Timeline
                </h3>
                <div className="space-y-3">
                  {request.requestedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Request Created
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.requestedAt)}
                        </p>
                        {(request.requester?.name ||
                          request.requestedBy?.name) && (
                          <p className="text-xs text-gray-500 mt-1">
                            by{" "}
                            {request.requester?.name ||
                              request.requestedBy?.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {request.approvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Approved</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.approvedAt)}
                        </p>
                        {request.approvedBy?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {request.approvedBy.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {request.shippedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Shipped</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.shippedAt)}
                        </p>
                        {request.shippedBy?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {request.shippedBy.name}
                          </p>
                        )}
                        {request.estimatedDeliveryDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Est. delivery:{" "}
                            {formatDate(request.estimatedDeliveryDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {request.receivedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Archive className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Received</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.receivedAt)}
                        </p>
                        {request.receivedBy?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {request.receivedBy.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {request.rejectedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Rejected</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.rejectedAt)}
                        </p>
                        {request.rejectedBy?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {request.rejectedBy.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {request.cancelledAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Ban className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Cancelled</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.cancelledAt)}
                        </p>
                        {request.cancelledBy?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {request.cancelledBy.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection/Cancellation Reason */}
              {(request.rejectionReason || request.cancellationReason) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">
                        {request.rejectionReason
                          ? "Rejection Reason"
                          : "Cancellation Reason"}
                      </p>
                      <p className="text-sm text-red-800">
                        {request.rejectionReason || request.cancellationReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Requested Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Requested Components ({request.items?.length || 0})
                </h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Component
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Part Number
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Qty Requested
                        </th>
                        {request.status !== "PENDING_APPROVAL" &&
                          request.status !== "REJECTED" && (
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                              Qty Approved
                            </th>
                          )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {request.items?.map((item) => (
                        <tr
                          key={item.id || item.itemId}
                          className="hover:bg-gray-100"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.typeComponent?.name || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                            {item.typeComponent?.partNumber ||
                              item.typeComponent?.sku ||
                              "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {item.quantityRequested}
                          </td>
                          {request.status !== "PENDING_APPROVAL" &&
                            request.status !== "REJECTED" && (
                              <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">
                                {item.quantityApproved ||
                                  item.quantityRequested}
                              </td>
                            )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
