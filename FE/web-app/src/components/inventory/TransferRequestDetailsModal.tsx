"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Package,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import stockTransferService, {
  TransferRequestDetails,
} from "@/services/stockTransferService";

interface TransferRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export default function TransferRequestDetailsModal({
  isOpen,
  onClose,
  requestId,
}: TransferRequestDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<TransferRequestDetails | null>(null);

  const loadDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await stockTransferService.getTransferRequestDetails(
        requestId
      );
      setDetails(response.data.transferRequest);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load transfer request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && requestId) {
      loadDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, requestId]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "APPROVED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "RECEIVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING_APPROVAL":
        return <Clock className="w-5 h-5" />;
      case "APPROVED":
        return <CheckCircle className="w-5 h-5" />;
      case "SHIPPED":
        return <ArrowRight className="w-5 h-5" />;
      case "RECEIVED":
        return <CheckCircle className="w-5 h-5" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Transfer Request Details
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Request ID: {requestId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Loading details...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-semibold">
                      Error loading details
                    </p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Details Content */}
              {details && !loading && (
                <>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold ${getStatusColor(
                        details.status
                      )}`}
                    >
                      {getStatusIcon(details.status)}
                      {details.status.replace(/_/g, " ")}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Requested</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(details.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Warehouse Transfer Flow */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">From</p>
                            <p className="font-bold text-gray-900 text-lg">
                              {details.fromWarehouse.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {details.fromWarehouse.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-6">
                        <ArrowRight className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 justify-end">
                          <div>
                            <p className="text-sm text-gray-600 text-right">
                              To
                            </p>
                            <p className="font-bold text-gray-900 text-lg text-right">
                              {details.toWarehouse.name}
                            </p>
                            <p className="text-sm text-gray-500 text-right">
                              {details.toWarehouse.location}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-xl">
                            <Building2 className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requested By */}
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Requested By</p>
                      <p className="font-semibold text-gray-900">
                        {details.requestedBy.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        User ID: {details.requestedBy.userId}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Transfer Items ({details.items.length})
                    </h3>
                    <div className="space-y-3">
                      {details.items.map((item, index) => (
                        <motion.div
                          key={item.componentId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.componentName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ID: {item.componentId}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                {item.quantity}
                              </p>
                              <p className="text-xs text-gray-500">units</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {getStatusIcon(item.status)}
                              {item.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  {details.timeline &&
                    details.timeline.length > 0 &&
                    (() => {
                      const timeline = details.timeline;
                      return (
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Timeline
                          </h3>
                          <div className="space-y-4">
                            {timeline.map((event, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex gap-4"
                              >
                                <div className="flex flex-col items-center">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                  </div>
                                  {index < timeline.length - 1 && (
                                    <div className="w-0.5 h-full bg-blue-200 mt-2" />
                                  )}
                                </div>
                                <div className="flex-1 pb-6">
                                  <p className="font-semibold text-gray-900">
                                    {event.action || "Unknown action"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {event.performedBy || "Unknown user"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {event.timestamp
                                      ? new Date(
                                          event.timestamp
                                        ).toLocaleString()
                                      : "Unknown time"}
                                  </p>
                                  {event.details && (
                                    <p className="text-sm text-gray-700 mt-1 bg-gray-50 rounded p-2">
                                      {event.details}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                  {/* Notes */}
                  {details.notes && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900 mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-amber-800">
                            {details.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50 rounded-b-2xl flex justify-end">
              <Button
                onClick={onClose}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
