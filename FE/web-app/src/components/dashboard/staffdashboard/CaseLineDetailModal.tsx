"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Wrench,
  CheckSquare,
  Square,
} from "lucide-react";
import type { ProcessingRecord } from "@/services/processingRecordService";
import { useState } from "react";

interface CaseLineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ProcessingRecord | null;
  onApproveCaseLines?: (caseLineIds: string[]) => void;
  onRejectCaseLines?: (caseLineIds: string[]) => void;
}

interface CaseLine {
  id: string;
  caseLineId?: string;
  diagnosisText: string;
  correctionText: string;
  quantity: number;
  warrantyStatus: string;
  status: string;
}

export function CaseLineDetailModal({
  isOpen,
  onClose,
  record,
  onApproveCaseLines,
  onRejectCaseLines,
}: CaseLineDetailModalProps) {
  const [selectedCaseLines, setSelectedCaseLines] = useState<Set<string>>(
    new Set()
  );

  if (!record) return null;

  // Extract all case lines from guarantee cases
  const allCaseLines: CaseLine[] = [];
  record.guaranteeCases?.forEach((gc) => {
    gc.caseLines?.forEach((cl) => {
      allCaseLines.push({
        id: cl.caseLineId || (cl as { id?: string }).id || "",
        caseLineId: cl.caseLineId,
        diagnosisText: cl.diagnosisText || "",
        correctionText: cl.correctionText || "",
        quantity: cl.quantity || 0,
        warrantyStatus: cl.warrantyStatus || "UNKNOWN",
        status: "PENDING", // Default status since it's not provided in processing record
      });
    });
  });

  const handleApprove = (caseId: string) => {
    if (onApproveCaseLines) {
      onApproveCaseLines([caseId]);
    }
  };

  const handleReject = (caseId: string) => {
    if (onRejectCaseLines) {
      onRejectCaseLines([caseId]);
    }
  };

  const toggleCaseLineSelection = (caseLineId: string) => {
    const newSelected = new Set(selectedCaseLines);
    if (newSelected.has(caseLineId)) {
      newSelected.delete(caseLineId);
    } else {
      newSelected.add(caseLineId);
    }
    setSelectedCaseLines(newSelected);
  };

  const handleBulkApprove = () => {
    if (selectedCaseLines.size > 0 && onApproveCaseLines) {
      onApproveCaseLines(Array.from(selectedCaseLines));
      setSelectedCaseLines(new Set()); // Clear selection after action
    }
  };

  const handleBulkReject = () => {
    if (selectedCaseLines.size > 0 && onRejectCaseLines) {
      onRejectCaseLines(Array.from(selectedCaseLines));
      setSelectedCaseLines(new Set()); // Clear selection after action
    }
  };

  const selectAll = () => {
    const allIds = new Set(allCaseLines.map((cl) => cl.id));
    setSelectedCaseLines(allIds);
  };

  const clearSelection = () => {
    setSelectedCaseLines(new Set());
  };

  const getWarrantyStatusBadge = (status: string) => {
    switch (status) {
      case "ELIGIBLE":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Eligible
          </span>
        );
      case "INELIGIBLE":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Ineligible
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const getCaseLineStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig: Record<
      string,
      { label: string; className: string; icon: typeof Clock }
    > = {
      PENDING_APPROVAL: {
        label: "Pending Approval",
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      CUSTOMER_APPROVED: {
        label: "Customer Approved",
        className: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
      },
      REJECTED_BY_CUSTOMER: {
        label: "Rejected by Customer",
        className: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      READY_FOR_REPAIR: {
        label: "Ready for Repair",
        className: "bg-purple-100 text-purple-800",
        icon: Wrench,
      },
      IN_PROGRESS: {
        label: "In Progress",
        className: "bg-indigo-100 text-indigo-800",
        icon: Clock,
      },
      COMPLETED: {
        label: "Completed",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Case Line Details
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  VIN: {record.vin} • {allCaseLines.length} item
                  {allCaseLines.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {allCaseLines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Case Lines Yet
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    This claim doesn&apos;t have any case lines. Case lines are
                    created by technicians during diagnosis.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Actions - Only show when multiple case lines exist */}
                  {allCaseLines.length > 1 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            Bulk Actions
                          </h4>
                          <span className="text-xs text-gray-500">
                            {selectedCaseLines.size} of {allCaseLines.length}{" "}
                            selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={selectAll}
                            className="text-xs px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            onClick={clearSelection}
                            className="text-xs px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      {selectedCaseLines.size > 0 && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleBulkApprove}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve Selected ({selectedCaseLines.size})
                          </button>
                          <button
                            onClick={handleBulkReject}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Selected ({selectedCaseLines.size})
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Case Lines List */}
                  {allCaseLines.map((caseLine, index) => (
                    <motion.div
                      key={caseLine.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Header - Always Visible */}
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox for bulk selection - only show when multiple case lines */}
                          {allCaseLines.length > 1 && (
                            <button
                              onClick={() =>
                                toggleCaseLineSelection(caseLine.id)
                              }
                              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {selectedCaseLines.has(caseLine.id) ? (
                                <CheckSquare className="w-5 h-5 text-gray-900" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          )}
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-0.5">
                              Case Line Item
                            </h4>
                            <p className="text-xs text-gray-500 font-mono truncate">
                              Case ID:{" "}
                              {caseLine.caseLineId
                                ? caseLine.caseLineId.substring(0, 16)
                                : caseLine.id
                                ? caseLine.id.substring(0, 16)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getWarrantyStatusBadge(caseLine.warrantyStatus)}
                          {caseLine.status &&
                            getCaseLineStatusBadge(caseLine.status)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="px-4 pb-4 space-y-3">
                        {/* Diagnosis */}
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-gray-600" />
                            <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                              Diagnosis
                            </h5>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {caseLine.diagnosisText}
                          </p>
                        </div>

                        {/* Correction */}
                        <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Wrench className="w-3.5 h-3.5 text-green-600" />
                            <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                              Correction/Repair
                            </h5>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {caseLine.correctionText}
                          </p>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex items-center justify-between gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              Qty:
                            </span>
                            <span className="text-gray-700">
                              {caseLine.quantity}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleReject(caseLine.id)}
                              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(caseLine.id)}
                              className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {allCaseLines.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {allCaseLines.length}
                  </span>{" "}
                  case line{allCaseLines.length !== 1 ? "s" : ""} in this claim
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
