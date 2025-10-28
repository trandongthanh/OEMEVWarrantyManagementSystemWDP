"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import stockTransferService, {
  StockTransferRequest,
} from "@/services/stockTransferService";
import { toast } from "sonner";

export function StockTransferReceiving() {
  const [incomingShipments, setIncomingShipments] = useState<
    StockTransferRequest[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<StockTransferRequest | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiving, setReceiving] = useState(false);

  useEffect(() => {
    loadIncomingShipments();
  }, []);

  const loadIncomingShipments = async () => {
    setLoading(true);
    try {
      const response = await stockTransferService.getRequests({
        status: "SHIPPED",
      });
      setIncomingShipments(response.data.requests);
    } catch (error) {
      console.error("Error loading incoming shipments:", error);
      toast.error("Failed to load incoming shipments");
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async () => {
    if (!selectedRequest) return;

    setReceiving(true);
    try {
      await stockTransferService.receiveRequest(selectedRequest.id);
      toast.success("Shipment received successfully");
      setShowReceiveModal(false);
      setSelectedRequest(null);
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
        <h2 className="text-2xl font-bold text-gray-900">
          Incoming Shipments
        </h2>
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
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Shipments to Receive
            </h3>
            <button
              onClick={loadIncomingShipments}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading shipments...</span>
          </div>
        ) : incomingShipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No incoming shipments</p>
            <p className="text-gray-400 text-sm mt-1">
              All shipments have been received
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {incomingShipments.map((request) => (
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
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Truck className="w-3.5 h-3.5" />
                          <span>In Transit</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Requesting Warehouse</p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.requestingWarehouse?.warehouseName || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Requested By</p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.requestedBy?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Shipped: {formatDate(request.shippedAt || request.createdAt)}</span>
                      </div>
                      {request.estimatedDeliveryDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Est. Delivery: {formatDate(request.estimatedDeliveryDate)}</span>
                        </div>
                      )}
                    </div>

                    {request.items && request.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-2">Components</p>
                        <div className="space-y-2">
                          {request.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {item.typeComponent?.name || "Unknown Component"}
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

                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowReceiveModal(true);
                    }}
                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Receive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Receive Confirmation Modal */}
      {showReceiveModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => !receiving && setShowReceiveModal(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl"
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

            <div className="p-6 space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Verify before receiving:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Check all items are present and undamaged</li>
                    <li>Verify quantities match the transfer request</li>
                    <li>Inspect packaging for any damage</li>
                    <li>Report any discrepancies immediately</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Transfer ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    #{selectedRequest.id.slice(0, 8)}
                  </p>
                </div>
                {selectedRequest.items && selectedRequest.items.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Components</p>
                    <div className="space-y-2">
                      {selectedRequest.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                          <p className="text-sm font-medium text-gray-900">
                            {item.typeComponent?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantityRequested}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Requesting Warehouse</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRequest.requestingWarehouse?.warehouseName}
                  </p>
                </div>
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
    </div>
  );
}
