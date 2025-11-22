"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Loader2,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  X,
  Building2,
  Box,
  Hash,
  Clock,
  Eye,
} from "lucide-react";
import stockTransferService, {
  StockTransferRequest,
} from "@/services/stockTransferService";
import { toast } from "sonner";

interface DetailedRequest extends StockTransferRequest {
  transferComponents?: Array<{
    requestId: string;
    componentId: string;
    component?: {
      componentId: string;
      serialNumber: string | null;
      sku: string | null;
      status: string;
      manufacturedDate?: string | null;
      typeComponentId: string;
      typeComponent?: {
        typeComponentId: string;
        name: string;
        sku: string;
      };
    };
  }>;
  sourcingWarehouse?: {
    warehouseId: string;
    name: string;
    vehicleCompanyId?: string;
  };
  sourceWarehouse?: {
    warehouseId: string;
    name: string;
    vehicleCompanyId?: string;
  };
  requester?: {
    userId: string;
    name: string;
  };
  requestedByUser?: {
    userId: string;
    name: string;
  };
  approver?: {
    userId: string;
    name: string;
  };
  approvedByUser?: {
    userId: string;
    name: string;
  };
  shippedByUser?: {
    userId: string;
    name: string;
  };
  receivedByUser?: {
    userId: string;
    name: string;
  };
  receiver?: {
    userId: string;
    name: string;
  } | null;
  items?: Array<{
    id: string;
    requestId: string;
    typeComponentId: string;
    quantityRequested: number;
    caselineId?: string;
    typeComponent?: {
      typeComponentId: string;
      name: string;
      sku: string;
    };
  }>;
  stockReservations?: Array<{
    reservationId: string;
    requestId: string;
    stockId: string;
    typeComponentId: string;
    quantityReserved: number;
    status: string;
    stock?: {
      typeComponent?: {
        typeComponentId: string;
        name: string;
        sku: string;
      };
    };
  }>;
  receivingNotes?: string;
}

export function StockTransferReceiving() {
  const [incomingShipments, setIncomingShipments] = useState<
    StockTransferRequest[]
  >([]);
  const [filteredShipments, setFilteredShipments] = useState<
    StockTransferRequest[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<DetailedRequest | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
  const [receivingNotes, setReceivingNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const applyFilter = (shipments: StockTransferRequest[], filter: string) => {
    if (filter === "ALL") {
      setFilteredShipments(shipments);
    } else {
      setFilteredShipments(
        shipments.filter((shipment) => shipment.status === filter)
      );
    }
  };

  const loadIncomingShipments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockTransferService.getRequests({});

      // Handle both response formats: requests or stockTransferRequests
      const shipments =
        response.data?.requests || response.data?.stockTransferRequests || [];

      console.log("Incoming shipments response:", response);
      console.log("Parsed shipments:", shipments);

      setIncomingShipments(shipments);
      applyFilter(shipments, statusFilter);
    } catch (error) {
      console.error("Error loading incoming shipments:", error);
      toast.error("Failed to load incoming shipments");
      setIncomingShipments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadIncomingShipments();
  }, [loadIncomingShipments]);

  const loadRequestDetails = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      const response = await stockTransferService.getRequestById(requestId);
      const detailedRequest: DetailedRequest =
        response.data.stockTransferRequest || response.data.request;
      console.log("Loaded request details:", detailedRequest);
      setSelectedRequest(detailedRequest);
      setShowReceiveModal(true);
    } catch (error) {
      console.error("Error loading request details:", error);
      toast.error("Failed to load shipment details");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const loadDetailsOnly = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      const response = await stockTransferService.getRequestById(requestId);
      const detailedRequest: DetailedRequest =
        response.data.stockTransferRequest || response.data.request;
      console.log("Loaded details only:", detailedRequest);
      setSelectedRequest(detailedRequest);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error loading request details:", error);
      toast.error("Failed to load request details");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return {
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: <Clock className="w-3.5 h-3.5" />,
          label: "Pending Approval",
        };
      case "SHIPPED":
        return {
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <Truck className="w-3.5 h-3.5" />,
          label: "In Transit",
        };
      case "RECEIVED":
        return {
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: "Received",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <Package className="w-3.5 h-3.5" />,
          label: status,
        };
    }
  };

  const handleReceive = async () => {
    if (!selectedRequest) return;
    if (selectedRequest.status !== "SHIPPED") {
      toast.error("Only shipped requests can be received");
      return;
    }

    setReceiving(true);
    try {
      await stockTransferService.receiveRequest(selectedRequest.id);
      toast.success("Shipment received successfully");
      setShowReceiveModal(false);
      setSelectedRequest(null);
      setReceivingNotes("");
      loadIncomingShipments();
    } catch (error) {
      console.error("Error receiving shipment:", error);
      toast.error("Failed to receive shipment");
    } finally {
      setReceiving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Incoming Shipments</h2>
        <p className="text-sm text-gray-500 mt-1">
          Receive and process incoming stock transfers
        </p>
      </div>

      {/* Shipments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Stock Transfer History
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-yellow-600">
                    {
                      incomingShipments.filter(
                        (r) => r.status === "PENDING_APPROVAL"
                      ).length
                    }
                  </span>{" "}
                  Pending
                </span>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">
                    {
                      incomingShipments.filter((r) => r.status === "SHIPPED")
                        .length
                    }
                  </span>{" "}
                  In Transit
                </span>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">
                    {
                      incomingShipments.filter((r) => r.status === "RECEIVED")
                        .length
                    }
                  </span>{" "}
                  Received
                </span>
              </div>
            </div>
            <button
              onClick={loadIncomingShipments}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {[
              { value: "ALL", label: "All" },
              { value: "PENDING_APPROVAL", label: "Pending" },
              { value: "SHIPPED", label: "In Transit" },
              { value: "RECEIVED", label: "Received" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading shipments...</span>
          </div>
        ) : !filteredShipments || filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {statusFilter === "ALL"
                ? "No transfer requests"
                : `No ${statusFilter.toLowerCase().replace("_", " ")} requests`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try changing the filter
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredShipments.map((request) => (
              <div
                key={request.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Transfer Request #{request.id.slice(0, 8)}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              getStatusBadge(request.status).color
                            }`}
                          >
                            {getStatusBadge(request.status).icon}
                            {getStatusBadge(request.status).label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Requesting Warehouse
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.requestingWarehouse?.warehouseName ||
                              request.requestingWarehouse?.name ||
                              "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Requested By</p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.requestedBy?.name ||
                              request.requester?.name ||
                              "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Shipped:{" "}
                          {formatDate(request.shippedAt || request.createdAt)}
                        </span>
                      </div>
                      {request.estimatedDeliveryDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Est. Delivery:{" "}
                            {formatDate(request.estimatedDeliveryDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {request.items && request.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-2">Components</p>
                        <div className="space-y-2">
                          {request.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {item.typeComponent?.name ||
                                  "Unknown Component"}
                              </p>
                              <p className="text-xs text-gray-600">
                                Qty: {item.quantityRequested}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    {/* View Details button for all statuses */}
                    <button
                      onClick={() => loadDetailsOnly(request.id)}
                      disabled={loadingRequestId === request.id}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingRequestId === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      View Details
                    </button>

                    {/* Receive button only for SHIPPED status */}
                    {request.status === "SHIPPED" && (
                      <button
                        onClick={() => loadRequestDetails(request.id)}
                        disabled={loadingRequestId === request.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingRequestId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Receive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Receive Confirmation Modal */}
      {showReceiveModal && selectedRequest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => !receiving && setShowReceiveModal(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Confirm Receipt
                  </h2>
                  <p className="text-sm text-gray-500">
                    Mark shipment as received
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiveModal(false)}
                disabled={receiving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Verify before receiving:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Check all items are present and undamaged</li>
                    <li>Verify serial numbers match the shipped components</li>
                    <li>Inspect packaging for any damage</li>
                    <li>Report any discrepancies immediately</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Transfer ID
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    #{selectedRequest.id.slice(0, 12)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Est. Delivery
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.estimatedDeliveryDate
                      ? formatDate(selectedRequest.estimatedDeliveryDate)
                      : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    From Warehouse
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.sourcingWarehouse?.name || "Not assigned"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    To Warehouse
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.requestingWarehouse?.name ||
                      selectedRequest.requestingWarehouse?.warehouseName}
                  </p>
                </div>
              </div>

              {/* Shipped Components with Serial Numbers */}
              {selectedRequest.transferComponents &&
              selectedRequest.transferComponents.length > 0 ? (
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Box className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      Shipped Components
                    </h4>
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {selectedRequest.transferComponents.length} items
                    </span>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {Object.entries(
                      selectedRequest.transferComponents.reduce<
                        Record<
                          string,
                          Array<
                            NonNullable<
                              typeof selectedRequest.transferComponents
                            >[0]
                          >
                        >
                      >((acc, transferComp) => {
                        const typeName =
                          transferComp.component?.typeComponent?.name ||
                          "Unknown Component";
                        if (!acc[typeName]) {
                          acc[typeName] = [];
                        }
                        acc[typeName].push(transferComp);
                        return acc;
                      }, {})
                    ).map(([typeName, components]) => (
                      <div
                        key={typeName}
                        className="bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {typeName}
                          </p>
                          <span className="text-xs text-gray-500">
                            Qty: {components.length}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {components.map((transferComp) => (
                            <div
                              key={transferComp.componentId}
                              className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="font-mono font-medium text-gray-900">
                                  {transferComp.component?.serialNumber ||
                                    `ID: ${transferComp.componentId.slice(
                                      0,
                                      8
                                    )}`}
                                </span>
                              </div>
                              {transferComp.component?.sku && (
                                <span className="text-gray-500">
                                  {transferComp.component.sku}
                                </span>
                              )}
                              {transferComp.component?.manufacturedDate && (
                                <span className="text-gray-500">
                                  Mfg:{" "}
                                  {new Date(
                                    transferComp.component.manufacturedDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedRequest.items && selectedRequest.items.length > 0 ? (
                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">
                      Requested Components
                    </h4>
                    <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                      {selectedRequest.items.reduce(
                        (sum, item) => sum + (item.quantityRequested || 0),
                        0
                      )}{" "}
                      items
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Specific component details not available yet
                  </p>
                  <div className="space-y-2">
                    {selectedRequest.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {item.typeComponent?.name || "Unknown Component"}
                        </p>
                        <span className="text-xs text-gray-600">
                          Qty: {item.quantityRequested}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Receiving Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiving Notes (Optional)
                </label>
                <textarea
                  value={receivingNotes}
                  onChange={(e) => setReceivingNotes(e.target.value)}
                  placeholder="Add any notes about the received shipment (e.g., condition, discrepancies, damage)..."
                  rows={3}
                  disabled={receiving}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReceiveModal(false)}
                disabled={receiving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReceive}
                disabled={receiving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {receiving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Receiving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Receipt
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDetailsModal(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedRequest.status === "PENDING_APPROVAL"
                      ? "bg-yellow-100"
                      : selectedRequest.status === "SHIPPED"
                      ? "bg-blue-100"
                      : "bg-green-100"
                  }`}
                >
                  {selectedRequest.status === "PENDING_APPROVAL" ? (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  ) : selectedRequest.status === "SHIPPED" ? (
                    <Truck className="w-5 h-5 text-blue-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Transfer Request Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Request #{selectedRequest.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Request ID
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.id.slice(0, 8)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const badge = getStatusBadge(selectedRequest.status);
                      return (
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    From Warehouse
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.sourcingWarehouse?.name ||
                      selectedRequest.sourceWarehouse?.name ||
                      "Not assigned"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    To Warehouse
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.requestingWarehouse?.name || "Unknown"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Requested By
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.requester?.name ||
                      selectedRequest.requestedByUser?.name ||
                      "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedRequest.requestedAt).toLocaleString()}
                  </p>
                </div>

                {(selectedRequest.approver ||
                  selectedRequest.approvedByUser) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Approved By
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRequest.approver?.name ||
                        selectedRequest.approvedByUser?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedRequest.approvedAt &&
                        new Date(selectedRequest.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedRequest.shippedByUser && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Shipped By
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRequest.shippedByUser.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedRequest.shippedAt &&
                        new Date(selectedRequest.shippedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {(selectedRequest.receiver ||
                  selectedRequest.receivedByUser) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Received By
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRequest.receiver?.name ||
                        selectedRequest.receivedByUser?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedRequest.receivedAt &&
                        new Date(selectedRequest.receivedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedRequest.stockReservations &&
                selectedRequest.stockReservations.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      Requested Items
                    </p>
                    <div className="space-y-2">
                      {selectedRequest.stockReservations.map(
                        (reservation, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-3 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {reservation.stock?.typeComponent?.name ||
                                  "Unknown Component"}
                              </p>
                              <p className="text-xs text-gray-500">
                                SKU:{" "}
                                {reservation.stock?.typeComponent?.sku || "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                Qty: {reservation.quantityReserved}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedRequest.transferComponents &&
                selectedRequest.transferComponents.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-900">
                        Transfer Components
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {selectedRequest.transferComponents.length} items
                      </span>
                    </div>

                    {/* Grouped by Component Type */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {Object.entries(
                        selectedRequest.transferComponents.reduce<
                          Record<
                            string,
                            typeof selectedRequest.transferComponents
                          >
                        >((acc, transfer) => {
                          const typeKey =
                            transfer.component?.typeComponent
                              ?.typeComponentId || "unknown";
                          if (!acc[typeKey]) {
                            acc[typeKey] = [];
                          }
                          acc[typeKey].push(transfer);
                          return acc;
                        }, {})
                      ).map(([typeKey, components]) => {
                        const firstComponent = components[0];
                        const typeName =
                          firstComponent.component?.typeComponent?.name ||
                          "Unknown Component";
                        const sku =
                          firstComponent.component?.typeComponent?.sku || "N/A";

                        return (
                          <div
                            key={typeKey}
                            className="bg-white rounded-lg border border-gray-200"
                          >
                            {/* Component Type Header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {typeName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    SKU: {sku}
                                  </p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                                  {components.length} unit
                                  {components.length > 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>

                            {/* Serial Numbers Grid */}
                            <div className="p-3 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-2">
                                {components.map((transfer, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-100"
                                  >
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                    <p className="text-xs font-mono text-gray-700 truncate">
                                      {transfer.component?.serialNumber ||
                                        `ID: ${transfer.componentId.slice(
                                          0,
                                          8
                                        )}`}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {selectedRequest.receivingNotes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Receiving Notes
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.receivingNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
