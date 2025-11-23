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
  Image as ImageIcon,
} from "lucide-react";
import type { ProcessingRecord } from "@/services/processingRecordService";
import { useState, useEffect } from "react";
import { caseLineService, type CaseLine as CaseLineType } from "@/services";

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
  evidenceImageUrls?: string[];
  rejectionReason?: string;
}

export function CaseLineDetailModal({
  isOpen,
  onClose,
  record,
  onApproveCaseLines,
  onRejectCaseLines,
}: CaseLineDetailModalProps) {
  const [caseLineDetails, setCaseLineDetails] = useState<
    Map<string, CaseLineType>
  >(new Map());
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Track approve/reject decisions for each caseline
  const [caseLineDecisions, setCaseLineDecisions] = useState<
    Map<string, "approve" | "reject">
  >(new Map()); // Fetch detailed case line information when modal opens
  useEffect(() => {
    console.log("🔵 CaseLineDetailModal useEffect triggered", {
      isOpen,
      hasRecord: !!record,
    });

    if (!isOpen || !record) {
      console.log("⏹️ Skipping fetch - modal closed or no record");
      // Reset decisions when modal closes
      setCaseLineDecisions(new Map());
      return;
    }

    const fetchCaseLineDetails = async () => {
      console.log("🚀 Starting to fetch case line details...");
      setIsLoadingDetails(true);
      const detailsMap = new Map<string, CaseLineType>();

      try {
        // Extract case line IDs and guarantee case IDs from processing record
        const caseLineRequests: Array<{
          caseLineId: string;
          guaranteeCaseId: string;
        }> = [];
        record.guaranteeCases?.forEach((gc) => {
          gc.caseLines?.forEach((cl) => {
            const id = cl.caseLineId || cl.id;
            if (id && gc.guaranteeCaseId) {
              caseLineRequests.push({
                caseLineId: id,
                guaranteeCaseId: gc.guaranteeCaseId,
              });
            }
          });
        });

        console.log("📝 Case line requests to fetch:", caseLineRequests);

        // Fetch details for each case line
        const detailPromises = caseLineRequests.map(
          async ({ caseLineId, guaranteeCaseId }) => {
            try {
              console.log(
                `⏳ Fetching details for case line: ${caseLineId}, case: ${guaranteeCaseId}`
              );
              const response = await caseLineService.getCaseLineById(
                caseLineId
              );
              console.log(
                `✅ Received data for case line ${caseLineId}:`,
                response.data
              );
              return { id: caseLineId, data: response.data.caseLine };
            } catch (error) {
              console.error(
                `❌ Error fetching case line ${caseLineId}:`,
                error
              );
              return null;
            }
          }
        );

        const results = await Promise.all(detailPromises);

        results.forEach((result) => {
          if (result) {
            console.log(
              `Case line ${result.id} details:`,
              JSON.stringify(result.data, null, 2)
            );
            detailsMap.set(result.id, result.data);
          }
        });

        console.log("All fetched case line details:", detailsMap);
        setCaseLineDetails(detailsMap);
      } catch (error) {
        console.error("Error fetching case line details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchCaseLineDetails();
  }, [isOpen, record]);

  if (!record) return null;

  // Extract all case lines from guarantee cases with detailed information
  const allCaseLines: CaseLine[] = [];
  record.guaranteeCases?.forEach((gc) => {
    gc.caseLines?.forEach((cl) => {
      const id = cl.caseLineId || cl.id || "";
      const detailedInfo = caseLineDetails.get(id);

      const evidenceUrls =
        (detailedInfo as { evidenceImageUrls?: string[] })?.evidenceImageUrls ||
        (cl as { evidenceImageUrls?: string[] }).evidenceImageUrls ||
        [];

      console.log(`Case line ${id} evidence URLs:`, evidenceUrls);

      allCaseLines.push({
        id,
        caseLineId: cl.caseLineId,
        diagnosisText: detailedInfo?.diagnosisText || cl.diagnosisText || "",
        correctionText: detailedInfo?.correctionText || cl.correctionText || "",
        quantity: detailedInfo?.quantity || cl.quantity || 0,
        warrantyStatus:
          detailedInfo?.warrantyStatus || cl.warrantyStatus || "UNKNOWN",
        status: detailedInfo?.status || cl.status || "PENDING_APPROVAL",
        evidenceImageUrls: evidenceUrls,
      });
    });
  });

  console.log("Final allCaseLines with images:", allCaseLines);

  // Get all pending caselines
  const pendingCaseLines = allCaseLines.filter(
    (cl) => cl.status === "PENDING_APPROVAL"
  );

  // Check if all pending caselines have decisions
  const allPendingDecided = pendingCaseLines.every((cl) =>
    caseLineDecisions.has(cl.id)
  );

  // Get approve and reject arrays
  const approveIds = Array.from(caseLineDecisions.entries())
    .filter(([, decision]) => decision === "approve")
    .map(([id]) => id);

  const rejectIds = Array.from(caseLineDecisions.entries())
    .filter(([, decision]) => decision === "reject")
    .map(([id]) => id);

  const handleApprove = (caseId: string) => {
    const newDecisions = new Map(caseLineDecisions);
    newDecisions.set(caseId, "approve");
    setCaseLineDecisions(newDecisions);
  };

  const handleReject = (caseId: string) => {
    const newDecisions = new Map(caseLineDecisions);
    newDecisions.set(caseId, "reject");
    setCaseLineDecisions(newDecisions);
  };

  const handleSubmitDecisions = () => {
    if (!allPendingDecided) return;

    // Need to include ALL pending caselines in the request
    if (onApproveCaseLines && onRejectCaseLines) {
      // Call a combined handler - we need to modify the parent component
      // For now, we'll pass both arrays separately but backend expects them together
      // This is a temporary solution - ideally parent should have a combined handler
      onApproveCaseLines(approveIds);
      onRejectCaseLines(rejectIds);
    }
  };

  const handleClearDecision = (caseId: string) => {
    const newDecisions = new Map(caseLineDecisions);
    newDecisions.delete(caseId);
    setCaseLineDecisions(newDecisions);
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
  /** Test */
  const getCaseLineStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig: Record<
      string,
      { label: string; className: string; icon: typeof Clock }
    > = {
      DRAFT: {
        label: "Draft",
        className: "bg-gray-100 text-gray-800",
        icon: FileText,
      },
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
      REJECTED_BY_TECH: {
        label: "Rejected by Tech",
        className: "bg-orange-100 text-orange-800",
        icon: XCircle,
      },
      REJECTED_BY_OUT_OF_WARRANTY: {
        label: "Out of Warranty",
        className: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
      },
      REJECTED_BY_OEM: {
        label: "Rejected by OEM",
        className: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      WAITING_FOR_PARTS: {
        label: "Waiting for Parts",
        className: "bg-orange-100 text-orange-800",
        icon: Package,
      },
      PARTS_AVAILABLE: {
        label: "Parts Available",
        className: "bg-teal-100 text-teal-800",
        icon: CheckCircle,
      },
      READY_FOR_REPAIR: {
        label: "Ready for Repair",
        className: "bg-purple-100 text-purple-800",
        icon: Wrench,
      },
      IN_REPAIR: {
        label: "In Repair",
        className: "bg-indigo-100 text-indigo-800",
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
      CANCELLED: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800",
        icon: XCircle,
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
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
              {isLoadingDetails && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    <span>Loading case line details...</span>
                  </div>
                </div>
              )}
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
                  {/* Status Summary */}
                  {(() => {
                    const pendingCount = allCaseLines.filter(
                      (cl) => cl.status === "PENDING_APPROVAL"
                    ).length;
                    const approvedCount = allCaseLines.filter(
                      (cl) =>
                        cl.status === "CUSTOMER_APPROVED" ||
                        cl.status === "READY_FOR_REPAIR" ||
                        cl.status === "IN_REPAIR" ||
                        cl.status === "COMPLETED"
                    ).length;
                    const rejectedCount = allCaseLines.filter((cl) =>
                      cl.status?.includes("REJECTED")
                    ).length;

                    if (
                      pendingCount === 0 &&
                      approvedCount === 0 &&
                      rejectedCount === 0
                    ) {
                      return null;
                    }

                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-6">
                          <h4 className="text-sm font-semibold text-gray-900">
                            Status Overview:
                          </h4>
                          {pendingCount > 0 && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-gray-900">
                                <span className="font-semibold">
                                  {pendingCount}
                                </span>{" "}
                                Pending Approval
                              </span>
                            </div>
                          )}
                          {approvedCount > 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-900">
                                <span className="font-semibold">
                                  {approvedCount}
                                </span>{" "}
                                Approved
                              </span>
                            </div>
                          )}
                          {rejectedCount > 0 && (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-gray-900">
                                <span className="font-semibold">
                                  {rejectedCount}
                                </span>{" "}
                                Rejected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

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
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {caseLine.diagnosisText}
                          </p>

                          {/* Evidence Images Section - View Only for Staff */}
                          {caseLine.evidenceImageUrls &&
                            caseLine.evidenceImageUrls.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <div className="flex items-center gap-2 mb-2">
                                  <ImageIcon className="w-4 h-4 text-gray-600" />
                                  <span className="text-xs font-medium text-gray-700">
                                    Evidence Images
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {caseLine.evidenceImageUrls.map(
                                    (url, idx) => (
                                      <div
                                        key={idx}
                                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-white"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={url}
                                          alt={`Evidence ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
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

                        {/* Rejection Reason - Show for all rejection statuses */}
                        {(caseLine.status?.includes("REJECTED") ||
                          caseLine.warrantyStatus === "INELIGIBLE") && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-red-900 mb-1">
                                  Rejection Reason
                                </h5>
                                <p className="text-sm text-red-700 leading-relaxed">
                                  {caseLineDetails.get(caseLine.id)
                                    ?.rejectionReason ||
                                    caseLine.rejectionReason ||
                                    "No reason provided"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status Information */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                                Current Status
                              </h5>
                            </div>
                            {(() => {
                              const detailedInfo = caseLineDetails.get(
                                caseLine.id
                              );
                              const updatedAt = (
                                detailedInfo as { updatedAt?: string }
                              )?.updatedAt;

                              if (updatedAt) {
                                return (
                                  <span className="text-xs text-gray-600">
                                    Updated:{" "}
                                    {new Date(updatedAt).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div className="mt-2">
                            {getCaseLineStatusBadge(caseLine.status)}
                          </div>
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

                          {/* Action Buttons - Only show for PENDING_APPROVAL status */}
                          {caseLine.status === "PENDING_APPROVAL" ? (
                            <div className="flex items-center gap-3">
                              {caseLineDecisions.has(caseLine.id) ? (
                                // Show decision made
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                                      caseLineDecisions.get(caseLine.id) ===
                                      "approve"
                                        ? "bg-green-100 text-green-800 border-2 border-green-300"
                                        : "bg-red-100 text-red-800 border-2 border-red-300"
                                    }`}
                                  >
                                    {caseLineDecisions.get(caseLine.id) ===
                                    "approve" ? (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        Will Approve
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-4 h-4" />
                                        Will Reject
                                      </>
                                    )}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleClearDecision(caseLine.id)
                                    }
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Change
                                  </button>
                                </div>
                              ) : (
                                // Show approve/reject buttons
                                <>
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
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              {caseLine.status?.includes("APPROVED")
                                ? "✓ Already processed"
                                : caseLine.status?.includes("REJECTED")
                                ? "✗ Already rejected"
                                : "No action needed"}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {allCaseLines.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                {pendingCaseLines.length > 0 ? (
                  <>
                    {/* Decision Progress */}
                    <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Decision Progress
                        </span>
                        <span className="text-sm text-gray-600">
                          {caseLineDecisions.size} / {pendingCaseLines.length}{" "}
                          decided
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (caseLineDecisions.size /
                                pendingCaseLines.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">
                            {approveIds.length} to approve
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700">
                            {rejectIds.length} to reject
                          </span>
                        </div>
                      </div>
                      {!allPendingDecided && (
                        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          You must make a decision for all pending caselines
                          before submitting
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitDecisions}
                        disabled={!allPendingDecided}
                        className={`px-8 py-2.5 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
                          allPendingDecided
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Submit All Decisions
                      </button>
                    </div>
                  </>
                ) : (
                  // No pending caselines - just show close button
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {allCaseLines.length}
                      </span>{" "}
                      case line{allCaseLines.length !== 1 ? "s" : ""} in this
                      claim
                    </div>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
