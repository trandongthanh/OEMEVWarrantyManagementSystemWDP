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
  XCircle,
  LucideIcon,
} from "lucide-react";
import caseLineService, {
  CaseLine,
  GetCaseLinesListParams,
} from "@/services/caseLineService";

// Status config
const statusConfig: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  PENDING_APPROVAL: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  CUSTOMER_APPROVED: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  READY_FOR_REPAIR: {
    label: "Ready",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle,
  },
  REJECTED_BY_CUSTOMER: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  REJECTED_BY_TECH: {
    label: "Tech Rejected",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: XCircle,
  },
  REJECTED_BY_OUT_OF_WARRANTY: {
    label: "Out of Warranty",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertCircle,
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
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="CUSTOMER_APPROVED">Customer Approved</option>
                  <option value="READY_FOR_REPAIR">Ready for Repair</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED_BY_CUSTOMER">
                    Rejected by Customer
                  </option>
                  <option value="REJECTED_BY_TECH">Rejected by Tech</option>
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
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No case lines found</p>
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
    </div>
  );
}
