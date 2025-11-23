"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Filter,
  Loader2,
  Package,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ClipboardList,
  XCircle,
  LucideIcon,
  Image as ImageIcon,
  PackageCheck,
  Wrench,
  FilePenLine,
  RotateCcw,
} from "lucide-react";
import caseLineService, {
  CaseLine,
  GetCaseLinesListParams,
} from "@/services/caseLineService";
import { toast } from "sonner";

// Status config
const statusConfig: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  DRAFT: {
    label: "Draft",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FilePenLine,
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  CUSTOMER_APPROVED: {
    label: "Customer Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  WAITING_FOR_PARTS: {
    label: "Waiting for Parts",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Package,
  },
  PARTS_AVAILABLE: {
    label: "Parts Available",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: PackageCheck,
  },
  READY_FOR_REPAIR: {
    label: "Ready for Repair",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Wrench,
  },
  IN_REPAIR: {
    label: "In Repair",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Wrench,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle,
  },
  REJECTED_BY_CUSTOMER: {
    label: "Rejected by Customer",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  REJECTED_BY_TECH: {
    label: "Rejected by Tech",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: XCircle,
  },
  REJECTED_BY_OUT_OF_WARRANTY: {
    label: "Out of Warranty",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertCircle,
  },
  REJECTED_BY_OEM: {
    label: "Rejected by OEM",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

export function AllCaseLinesList() {
  const [caseLines, setCaseLines] = useState<CaseLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<GetCaseLinesListParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const [requestingRevision, setRequestingRevision] = useState<string | null>(
    null
  );
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedCaseLineForRevision, setSelectedCaseLineForRevision] =
    useState<CaseLine | null>(null);
  const [revisionReason, setRevisionReason] = useState("");

  useEffect(() => {
    fetchCaseLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    filters.status,
    filters.warrantyStatus,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const fetchCaseLines = async () => {
    setLoading(true);
    try {
      const response = await caseLineService.getCaseLinesList({
        ...filters,
        page: currentPage,
      });

      setCaseLines(response.data.caseLines);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching case lines:", error);
      setCaseLines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    key: keyof GetCaseLinesListParams,
    value: string | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
    setCurrentPage(1);
  };

  const handleRequestRevision = (caseLine: CaseLine) => {
    setSelectedCaseLineForRevision(caseLine);
    setRevisionReason("");
    setShowRevisionModal(true);
  };

  const handleSubmitRevision = async () => {
    if (!selectedCaseLineForRevision?.id) return;
    if (!revisionReason.trim()) {
      toast.error("Please provide revision instructions");
      return;
    }

    setRequestingRevision(selectedCaseLineForRevision.id);
    try {
      await caseLineService.requestRevision(
        selectedCaseLineForRevision.id,
        revisionReason.trim()
      );

      // Show success toast
      toast.success("Revision request sent to technician successfully", {
        duration: 4000,
        description: `Technician will be notified to revise case line #${selectedCaseLineForRevision.id.slice(
          0,
          8
        )}`,
      });

      // Wait a bit before closing modal so user sees the success state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close modal and reset
      setShowRevisionModal(false);
      setSelectedCaseLineForRevision(null);
      setRevisionReason("");

      // Refresh the list to show updated status
      fetchCaseLines();
    } catch (error: unknown) {
      console.error("Error requesting revision:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError?.response?.data?.message ||
        "Failed to request revision. Please try again.";
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setRequestingRevision(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">All Case Lines</h2>
          <p className="text-gray-600 mt-1">
            View and manage all case lines across all processing records
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="CUSTOMER_APPROVED">Customer Approved</option>
                  <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                  <option value="PARTS_AVAILABLE">Parts Available</option>
                  <option value="READY_FOR_REPAIR">Ready for Repair</option>
                  <option value="IN_REPAIR">In Repair</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED_BY_CUSTOMER">
                    Rejected by Customer
                  </option>
                  <option value="REJECTED_BY_TECH">Rejected by Tech</option>
                  <option value="REJECTED_BY_OUT_OF_WARRANTY">
                    Out of Warranty
                  </option>
                  <option value="REJECTED_BY_OEM">Rejected by OEM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Status
                </label>
                <select
                  value={filters.warrantyStatus || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "warrantyStatus",
                      e.target.value
                        ? (e.target.value as "ELIGIBLE" | "INELIGIBLE")
                        : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                >
                  <option value="">All</option>
                  <option value="ELIGIBLE">Eligible</option>
                  <option value="INELIGIBLE">Ineligible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || "createdAt"}
                  onChange={(e) =>
                    handleFilterChange(
                      "sortBy",
                      e.target.value as
                        | "createdAt"
                        | "updatedAt"
                        | "status"
                        | "warrantyStatus"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="updatedAt">Updated Date</option>
                  <option value="status">Status</option>
                  <option value="warrantyStatus">Warranty Status</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Case Lines List Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Case Lines
              </h3>
              <span className="text-sm text-gray-500">
                {caseLines.length} case line{caseLines.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : caseLines.length === 0 ? (
              <div className="text-center py-16">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">
                  No case lines found
                </p>
                <p className="text-sm text-gray-500">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {caseLines.map((caseLine) => {
                  const statusInfo =
                    statusConfig[caseLine.status || "PENDING_APPROVAL"];
                  const StatusIcon = statusInfo?.icon || Clock;

                  return (
                    <motion.div
                      key={caseLine.caseLineId || caseLine.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Status and Warranty */}
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusInfo?.color}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusInfo?.label}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                                caseLine.warrantyStatus === "ELIGIBLE"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {caseLine.warrantyStatus === "ELIGIBLE"
                                ? "Warranty"
                                : "No Warranty"}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Diagnosis:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {caseLine.diagnosisText || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Correction:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {caseLine.correctionText || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Rejection Reason - Show for rejected case lines */}
                          {(caseLine.status?.includes("REJECTED") ||
                            caseLine.warrantyStatus === "INELIGIBLE") &&
                            caseLine.rejectionReason && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-red-900 mb-1">
                                      Rejection Reason:
                                    </p>
                                    <p className="text-sm text-red-700">
                                      {caseLine.rejectionReason}
                                    </p>

                                    {/* Request Revision Button - Only for REJECTED_BY_OEM */}
                                    {caseLine.status === "REJECTED_BY_OEM" && (
                                      <button
                                        onClick={() =>
                                          handleRequestRevision(caseLine)
                                        }
                                        disabled={
                                          requestingRevision === caseLine.id
                                        }
                                        className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {requestingRevision === caseLine.id ? (
                                          <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Requesting...
                                          </>
                                        ) : (
                                          <>
                                            <RotateCcw className="w-4 h-4" />
                                            Request Revision
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Evidence Images */}
                          {caseLine.evidenceImageUrls &&
                            caseLine.evidenceImageUrls.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1.5">
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                  Evidence Images (
                                  {caseLine.evidenceImageUrls.length})
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                  {caseLine.evidenceImageUrls.map(
                                    (url, idx) => (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100 hover:border-blue-400 transition-colors"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={url}
                                          alt={`Evidence ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            const parent = target.parentElement;
                                            if (
                                              parent &&
                                              !parent.querySelector(
                                                ".error-placeholder"
                                              )
                                            ) {
                                              const placeholder =
                                                document.createElement("div");
                                              placeholder.className =
                                                "error-placeholder absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400";
                                              placeholder.innerHTML =
                                                '<svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-xs">Failed to load</span>';
                                              parent.appendChild(placeholder);
                                            }
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center pointer-events-none">
                                          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                      </a>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Component & Technicians */}
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Component
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {caseLine.typeComponent?.name || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty: {caseLine.quantity || 0} | Reserved:{" "}
                                  {caseLine.quantityReserved || 0}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Technician
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {caseLine.repairTechnician?.name ||
                                    caseLine.diagnosticTechnician?.name ||
                                    "Unassigned"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Created:{" "}
                              {caseLine.createdAt
                                ? new Date(
                                    caseLine.createdAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Updated:{" "}
                              {caseLine.updatedAt
                                ? new Date(
                                    caseLine.updatedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Revision Modal */}
      {showRevisionModal && selectedCaseLineForRevision && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Request Revision
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ask technician to revise this rejected caseline
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setSelectedCaseLineForRevision(null);
                  setRevisionReason("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Caseline Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Case Line
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCaseLineForRevision.typeComponent?.name || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {selectedCaseLineForRevision.id}
                </p>
              </div>

              {/* Current Rejection Reason */}
              {selectedCaseLineForRevision.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-medium text-red-900 mb-1">
                    Current Rejection Reason
                  </p>
                  <p className="text-sm text-red-700">
                    {selectedCaseLineForRevision.rejectionReason}
                  </p>
                </div>
              )}

              {/* Revision Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revision Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Provide specific instructions or guidance for the technician..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The technician will receive a notification to revise this
                  caseline
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRevisionModal(false);
                    setSelectedCaseLineForRevision(null);
                    setRevisionReason("");
                  }}
                  disabled={requestingRevision !== null}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRevision}
                  disabled={
                    requestingRevision !== null || !revisionReason.trim()
                  }
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {requestingRevision ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
