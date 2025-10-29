/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  CheckCircle,
  Package,
  UserPlus,
  AlertCircle,
  Wrench,
  FileText,
  Loader2,
  Search,
  Filter,
  X,
  ShoppingCart,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import caseLineService from "@/services/caseLineService";
import userService from "@/services/userService";
import { Pagination } from "@/components/ui";

// Status configuration with modern styling
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  DRAFT: {
    label: "Draft",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: FileText,
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: Clock,
  },
  CUSTOMER_APPROVED: {
    label: "Approved",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle2,
  },
  WAITING_FOR_PARTS: {
    label: "Waiting Parts",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: AlertTriangle,
  },
  READY_FOR_REPAIR: {
    label: "Ready",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: CheckCircle,
  },
  IN_REPAIR: {
    label: "In Repair",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Wrench,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: CheckCircle,
  },
  REJECTED_BY_CUSTOMER: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
  REJECTED_BY_TECH: {
    label: "Tech Rejected",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: XCircle,
  },
  REJECTED_BY_OUT_OF_WARRANTY: {
    label: "Out of Warranty",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

export function CaseLineOperations() {
  const [caseLines, setCaseLines] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [selectedCaseLineForAssignment, setSelectedCaseLineForAssignment] =
    useState<string | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [warrantyFilter, setWarrantyFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCaseLineIds, setSelectedCaseLineIds] = useState<Set<string>>(
    new Set()
  );
  const [bulkAllocating, setBulkAllocating] = useState(false);
  const itemsPerPage = 10;

  // Calculate quantity reserved from reservations array
  const getQuantityReserved = (caseLine: any): number => {
    if (!caseLine.reservations || caseLine.reservations.length === 0) {
      return 0;
    }
    return caseLine.reservations.reduce(
      (total: number, reservation: any) => total + (reservation.quantity || 0),
      0
    );
  };

  const fetchCaseLines = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      if (warrantyFilter !== "ALL") {
        params.warrantyStatus = warrantyFilter;
      }

      const response = await caseLineService.getCaseLinesList(params);
      setCaseLines(response.data.caseLines);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching case lines:", error);
      setErrorMessage("Failed to load case lines");
      setCaseLines([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, warrantyFilter]);

  const fetchTechnicians = async () => {
    try {
      const techs = await userService.getTechnicians();
      setTechnicians(techs);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  };

  useEffect(() => {
    fetchCaseLines();
  }, [fetchCaseLines]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleAllocateStock = async (caseLineId: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const caseLine = caseLines.find(
        (cl: any) => cl.id === caseLineId || cl.caseLineId === caseLineId
      );

      if (!caseLine || !caseLine.guaranteeCaseId) {
        setErrorMessage("Could not find the associated guarantee case");
        return;
      }

      const response = await caseLineService.allocateStock(
        caseLine.guaranteeCaseId,
        caseLineId
      );

      const reservedQty = response.data.reservations.reduce(
        (sum: number, r: any) => sum + r.quantity,
        0
      );

      setSuccessMessage(
        `✓ Stock allocated! Reserved ${reservedQty} units from ${response.data.reservations.length} warehouse(s).`
      );

      await fetchCaseLines();
    } catch (error: any) {
      console.error("Error allocating stock:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to allocate stock";

      let helpText = "";
      if (error?.response?.status === 409) {
        helpText =
          " Reasons: (1) Insufficient stock, (2) No component specified, or (3) Already allocated.";
      }

      setErrorMessage(`${errorMsg}${helpText}`);
    }
  };

  const handleOpenTechnicianModal = (caseLineId: string) => {
    setSelectedCaseLineForAssignment(caseLineId);
    setShowTechnicianModal(true);
    setSelectedTechnician("");
  };

  const handleAssignTechnician = async () => {
    if (!selectedCaseLineForAssignment || !selectedTechnician) {
      setErrorMessage("Please select a technician");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const caseLine = caseLines.find(
        (cl: any) =>
          cl.id === selectedCaseLineForAssignment ||
          cl.caseLineId === selectedCaseLineForAssignment
      );

      if (!caseLine || !caseLine.guaranteeCaseId) {
        setErrorMessage("Could not find the associated guarantee case");
        return;
      }

      await caseLineService.assignTechnicianToRepair(
        caseLine.guaranteeCaseId,
        selectedCaseLineForAssignment,
        { technicianId: selectedTechnician }
      );

      setSuccessMessage("✓ Technician assigned successfully!");
      setShowTechnicianModal(false);
      setSelectedCaseLineForAssignment(null);

      await fetchCaseLines();
    } catch (error: any) {
      console.error("Error assigning technician:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to assign technician"
      );
    }
  };

  const handleToggleCaseLineSelection = (caseLineId: string) => {
    setSelectedCaseLineIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caseLineId)) {
        newSet.delete(caseLineId);
      } else {
        newSet.add(caseLineId);
      }
      return newSet;
    });
  };

  const handleSelectAllApproved = () => {
    const approvedCaseLines = filteredCaseLines.filter(
      (cl: any) => cl.status === "CUSTOMER_APPROVED"
    );
    if (
      selectedCaseLineIds.size === approvedCaseLines.length &&
      approvedCaseLines.length > 0
    ) {
      setSelectedCaseLineIds(new Set());
    } else {
      setSelectedCaseLineIds(
        new Set(approvedCaseLines.map((cl: any) => cl.id))
      );
    }
  };

  const handleBulkAllocateStock = async () => {
    if (selectedCaseLineIds.size === 0) {
      setErrorMessage("Please select at least one case line");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setBulkAllocating(true);

    try {
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const caseLineId of Array.from(selectedCaseLineIds)) {
        try {
          const caseLine = caseLines.find(
            (cl: any) => cl.id === caseLineId || cl.caseLineId === caseLineId
          );

          if (!caseLine || !caseLine.guaranteeCaseId) {
            errors.push(
              `${caseLineId.substring(0, 8)}...: Guarantee case not found`
            );
            failedCount++;
            continue;
          }

          await caseLineService.allocateStock(
            caseLine.guaranteeCaseId,
            caseLineId
          );
          successCount++;
        } catch (error: any) {
          failedCount++;
          const errorMsg = error?.response?.data?.message || error.message;
          const shortId = caseLineId.substring(0, 8);
          errors.push(`${shortId}...: ${errorMsg}`);
        }
      }

      if (successCount > 0) {
        setSuccessMessage(
          `✓ Allocated stock for ${successCount} case line${
            successCount !== 1 ? "s" : ""
          }!${failedCount > 0 ? ` ${failedCount} failed.` : ""}`
        );
      }

      if (failedCount > 0 && successCount === 0) {
        setErrorMessage(`All allocations failed: ${errors.join("; ")}`);
      } else if (failedCount > 0) {
        setErrorMessage(`Some failed: ${errors.join("; ")}`);
      }

      setSelectedCaseLineIds(new Set());
      await fetchCaseLines();
    } catch (error: any) {
      console.error("Error bulk allocating stock:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to bulk allocate stock"
      );
    } finally {
      setBulkAllocating(false);
    }
  };

  const filteredCaseLines = caseLines.filter((caseLine: any) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const vin =
      caseLine.guaranteeCase?.vehicleProcessingRecord?.vin?.toLowerCase() || "";
    const componentName = caseLine.typeComponent?.name?.toLowerCase() || "";
    const diagnosis = caseLine.diagnosisText?.toLowerCase() || "";

    return (
      vin.includes(query) ||
      componentName.includes(query) ||
      diagnosis.includes(query)
    );
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Stats for the dashboard
  const stats = {
    total: filteredCaseLines.length,
    approved: filteredCaseLines.filter(
      (cl: any) => cl.status === "CUSTOMER_APPROVED"
    ).length,
    ready: filteredCaseLines.filter(
      (cl: any) => cl.status === "READY_FOR_REPAIR"
    ).length,
    completed: filteredCaseLines.filter((cl: any) => cl.status === "COMPLETED")
      .length,
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Case Line Operations
              </h2>
              <p className="text-gray-600 mt-1">
                Manage stock allocation and technician assignments
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Case Lines</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready for Repair</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.ready}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-green-900">
                {successMessage}
              </p>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-auto p-1 hover:bg-green-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-green-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Filters and Actions Bar */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Top Row - Bulk Actions */}
            {selectedCaseLineIds.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCaseLineIds.size} case line
                    {selectedCaseLineIds.size > 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkAllocateStock}
                    disabled={bulkAllocating}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {bulkAllocating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Allocating...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Allocate Stock
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedCaseLineIds(new Set())}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Filters Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by VIN, component, diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                >
                  <option value="ALL">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={warrantyFilter}
                  onChange={(e) => {
                    setWarrantyFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                >
                  <option value="ALL">All Warranty</option>
                  <option value="ELIGIBLE">Eligible</option>
                  <option value="INELIGIBLE">Ineligible</option>
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSelectAllApproved}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors font-medium"
              >
                {selectedCaseLineIds.size === stats.approved &&
                stats.approved > 0
                  ? "Deselect All Approved"
                  : "Select All Approved"}
              </button>

              <button
                onClick={fetchCaseLines}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Case Lines List */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-500">Loading case lines...</p>
              </div>
            ) : filteredCaseLines.length === 0 ? (
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
              <div className="space-y-4">
                {filteredCaseLines.map((caseLine: any, index: number) => {
                  const statusConfig =
                    STATUS_CONFIG[caseLine.status] || STATUS_CONFIG.DRAFT;
                  const StatusIcon = statusConfig.icon;
                  const isApproved = caseLine.status === "CUSTOMER_APPROVED";
                  const isSelected = selectedCaseLineIds.has(caseLine.id);
                  const quantityReserved = getQuantityReserved(caseLine);
                  const isFullyReserved =
                    quantityReserved >= (caseLine.quantity || 0);

                  return (
                    <motion.div
                      key={caseLine.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border rounded-xl p-5 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        {isApproved && (
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                handleToggleCaseLineSelection(caseLine.id)
                              }
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Case Line Content */}
                        <div className="flex-1">
                          {/* Header Row */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                                {caseLine.id?.substring(0, 8)}...
                              </span>
                              <span
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg ${statusConfig.bgColor} ${statusConfig.color} flex items-center gap-1.5 border border-current border-opacity-20`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                              </span>
                              {caseLine.warrantyStatus && (
                                <span
                                  className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                                    caseLine.warrantyStatus === "ELIGIBLE"
                                      ? "bg-green-100 text-green-700 border border-green-200"
                                      : "bg-red-100 text-red-700 border border-red-200"
                                  }`}
                                >
                                  {caseLine.warrantyStatus}
                                </span>
                              )}
                            </div>

                            {/* VIN Badge */}
                            {caseLine.guaranteeCase
                              ?.vehicleProcessingRecord && (
                              <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white">
                                {
                                  caseLine.guaranteeCase.vehicleProcessingRecord
                                    .vin
                                }
                              </span>
                            )}
                          </div>

                          {/* Component Info */}
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {caseLine.typeComponent ? (
                                  <>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {caseLine.typeComponent.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {caseLine.typeComponent.category}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 text-amber-600">
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="text-sm font-medium">
                                      No component specified
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Quantity Status */}
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    Needed
                                  </p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {caseLine.quantity}
                                  </p>
                                </div>
                                {quantityReserved > 0 && (
                                  <div className="text-right">
                                    <p className="text-xs text-green-600">
                                      Reserved
                                    </p>
                                    <p
                                      className={`text-lg font-bold ${
                                        isFullyReserved
                                          ? "text-green-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {quantityReserved}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Diagnosis and Correction */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Diagnosis
                                </p>
                              </div>
                              <p className="text-sm text-gray-900">
                                {caseLine.diagnosisText || "N/A"}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Wrench className="w-4 h-4 text-gray-400" />
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Correction
                                </p>
                              </div>
                              <p className="text-sm text-gray-900">
                                {caseLine.correctionText || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleAllocateStock(caseLine.id)}
                              disabled={!isApproved || isFullyReserved}
                              className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              title={
                                !isApproved
                                  ? "Must be approved first"
                                  : isFullyReserved
                                  ? "Stock already allocated"
                                  : "Allocate stock"
                              }
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {isFullyReserved
                                ? "Stock Allocated"
                                : "Allocate Stock"}
                            </button>
                            <button
                              onClick={() =>
                                handleOpenTechnicianModal(caseLine.id)
                              }
                              disabled={caseLine.status !== "READY_FOR_REPAIR"}
                              className="flex-1 px-4 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              title={
                                caseLine.status !== "READY_FOR_REPAIR"
                                  ? "Stock must be allocated first"
                                  : "Assign technician"
                              }
                            >
                              <UserPlus className="w-4 h-4" />
                              Assign Technician
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Technician Assignment Modal */}
      <AnimatePresence>
        {showTechnicianModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowTechnicianModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Assign Technician
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select a technician for repair
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Technician
                  </label>
                  <select
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  >
                    <option value="">Choose a technician...</option>
                    {technicians.map((tech) => (
                      <option key={tech.userId} value={tech.userId}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowTechnicianModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignTechnician}
                    disabled={!selectedTechnician}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
