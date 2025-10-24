/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
  Car,
  Search,
  Filter,
  X,
  ShoppingCart,
  FileCheck,
} from "lucide-react";
import processingRecordService from "@/services/processingRecordService";
import caseLineService from "@/services/caseLineService";
import userService from "@/services/userService";
import { Pagination } from "@/components/ui";

// Status config for case lines
const caseLineStatusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING_APPROVAL: {
    label: "Pending Approval",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  CUSTOMER_APPROVED: {
    label: "Customer Approved",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  READY_FOR_REPAIR: {
    label: "Ready for Repair",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  REJECTED_BY_CUSTOMER: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  REJECTED_BY_TECH: {
    label: "Rejected by Tech",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  REJECTED_BY_OUT_OF_WARRANTY: {
    label: "Out of Warranty",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

// Status config for processing records
const recordStatusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  CHECKED_IN: {
    label: "Checked In",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  IN_DIAGNOSIS: {
    label: "In Diagnosis",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  WAITING_FOR_PARTS: {
    label: "Waiting Parts",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  IN_REPAIR: {
    label: "In Repair",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  PAID: { label: "Paid", color: "text-emerald-700", bgColor: "bg-emerald-100" },
};

export function CaseLineManagement() {
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [guaranteeCases, setGuaranteeCases] = useState<any[]>([]);
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
  const [caseLineStatusFilter, setCaseLineStatusFilter] =
    useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchRecords();
    fetchTechnicians();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await processingRecordService.getAllRecords();
      setRecords(response.data.records.records);
    } catch (error) {
      console.error("Error fetching records:", error);
      setErrorMessage("Failed to load processing records");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const techs = await userService.getTechnicians();
      setTechnicians(techs);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  };

  const handleSelectRecord = async (record: any) => {
    setSelectedRecord(record);
    setGuaranteeCases(record.guaranteeCases || []);
  };

  const handleAllocateStock = async (caseLineId: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Find the guarantee case that contains this case line
      let guaranteeCaseId = "";
      for (const gCase of guaranteeCases) {
        const foundCaseLine = gCase.caseLines?.find(
          (cl: any) => cl.caseLineId === caseLineId
        );
        if (foundCaseLine) {
          guaranteeCaseId = gCase.guaranteeCaseId || gCase.caseId;
          break;
        }
      }

      if (!guaranteeCaseId) {
        setErrorMessage("Could not find the associated guarantee case");
        return;
      }

      const response = await caseLineService.allocateStock(
        caseLineId,
        guaranteeCaseId
      );
      setSuccessMessage(
        `Stock allocated successfully! Reserved ${response.data.caseline.quantityReserved} units from ${response.data.reservations.length} warehouse(s).`
      );

      if (selectedRecord) {
        const recordResponse = await processingRecordService.getRecordById(
          selectedRecord.vehicleProcessingRecordId
        );
        setSelectedRecord(recordResponse);
        setGuaranteeCases(recordResponse.guaranteeCases || []);
      }
    } catch (error: any) {
      console.error("Error allocating stock:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to allocate stock"
      );
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
      await caseLineService.assignTechnicianToRepair(
        selectedCaseLineForAssignment,
        { technicianId: selectedTechnician }
      );
      setSuccessMessage("Technician assigned successfully!");
      setShowTechnicianModal(false);
      setSelectedCaseLineForAssignment(null);

      if (selectedRecord) {
        const response = await processingRecordService.getRecordById(
          selectedRecord.vehicleProcessingRecordId
        );
        setSelectedRecord(response);
        setGuaranteeCases(response.guaranteeCases || []);
      }
    } catch (error: any) {
      console.error("Error assigning technician:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to assign technician"
      );
    }
  };

  // Count total case lines across all guarantee cases
  const getTotalCaseLines = (guaranteeCases: any[]) => {
    return guaranteeCases.reduce(
      (total, gCase) => total + (gCase.caseLines?.length || 0),
      0
    );
  };

  // Get filtered case lines based on status filter
  const getFilteredCaseLines = () => {
    const allCaseLines = guaranteeCases.flatMap((gCase: any) =>
      (gCase.caseLines || []).map((caseLine: any) => ({
        ...caseLine,
        guaranteeCaseId: gCase.guaranteeCaseId,
      }))
    );

    if (caseLineStatusFilter === "ALL") {
      return allCaseLines;
    }

    return allCaseLines.filter(
      (caseLine: any) => caseLine.status === caseLineStatusFilter
    );
  };

  const filteredCaseLines = getFilteredCaseLines();

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      record.vehicle.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicle.licensePlate
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination for records list
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Case Line Management
          </h2>
          <p className="text-gray-600 mt-1">
            Allocate stock and assign technicians to approved case lines
          </p>
          <div className="mt-2 text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <strong>Workflow:</strong> Case lines must be approved by staff
            first → then stock can be allocated → finally technicians can be
            assigned
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
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
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
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-12 gap-6">
          {/* Records List - Left Side */}
          <div className="col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Processing Records
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by VIN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                  >
                    <option value="ALL">All Status</option>
                    {Object.entries(recordStatusConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Records List */}
              <div className="p-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                  </div>
                ) : paginatedRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No records found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {paginatedRecords.map((record) => {
                      const statusInfo =
                        recordStatusConfig[record.status] ||
                        recordStatusConfig.CHECKED_IN;
                      const totalCaseLines = getTotalCaseLines(
                        record.guaranteeCases || []
                      );

                      return (
                        <button
                          key={record.vehicleProcessingRecordId || record.vin}
                          onClick={() => handleSelectRecord(record)}
                          className={`w-full p-3 text-left border rounded-xl transition-all ${
                            selectedRecord?.vehicleProcessingRecordId ===
                            record.vehicleProcessingRecordId
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="w-4 h-4 text-gray-400" />
                            <p className="font-mono text-sm font-semibold text-gray-900 truncate">
                              {record.vehicle.vin}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {totalCaseLines} case line
                                {totalCaseLines !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {!isLoading && filteredRecords.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredRecords.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Case Lines - Right Side */}
          <div className="col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              {selectedRecord ? (
                <>
                  {/* Header with Actions */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Case Lines - {selectedRecord.vehicle.vin}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {filteredCaseLines.length} total case lines
                        </p>
                      </div>
                    </div>

                    {/* Case Line Status Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <select
                        value={caseLineStatusFilter}
                        onChange={(e) =>
                          setCaseLineStatusFilter(e.target.value)
                        }
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                      >
                        <option value="ALL">All Case Line Status</option>
                        {Object.entries(caseLineStatusConfig).map(
                          ([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Case Lines List */}
                  <div className="p-6">
                    {filteredCaseLines.length === 0 ? (
                      <div className="text-center py-12">
                        <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          No case lines found with selected filter
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {filteredCaseLines.map((caseLine: any) => (
                          <div
                            key={caseLine.id}
                            className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-md ${
                                    caseLineStatusConfig[caseLine.status]
                                      ?.bgColor || "bg-gray-100"
                                  } ${
                                    caseLineStatusConfig[caseLine.status]
                                      ?.color || "text-gray-700"
                                  }`}
                                >
                                  {caseLineStatusConfig[caseLine.status]
                                    ?.label || caseLine.status}
                                </span>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-md ${
                                    caseLine.warrantyStatus === "ELIGIBLE"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {caseLine.warrantyStatus}
                                </span>
                                {caseLine.typeComponent && (
                                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                                    {caseLine.typeComponent.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500">
                                    Diagnosis:
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {caseLine.diagnosisText}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Wrench className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500">
                                    Correction:
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {caseLine.correctionText}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  Qty: {caseLine.quantity}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAllocateStock(caseLine.id)}
                                disabled={
                                  caseLine.status !== "CUSTOMER_APPROVED"
                                }
                                className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  caseLine.status !== "CUSTOMER_APPROVED"
                                    ? "Case line must be approved first"
                                    : "Allocate stock for this case line"
                                }
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Allocate Stock
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenTechnicianModal(caseLine.id)
                                }
                                disabled={
                                  caseLine.status !== "READY_FOR_REPAIR"
                                }
                                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  caseLine.status !== "READY_FOR_REPAIR"
                                    ? "Stock must be allocated first"
                                    : "Assign a technician to repair"
                                }
                              >
                                <UserPlus className="w-4 h-4" />
                                Assign Technician
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Record Selected
                  </h3>
                  <p className="text-gray-600">
                    Select a processing record from the left to view case lines
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technician Assignment Modal */}
        <AnimatePresence>
          {showTechnicianModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowTechnicianModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Assign Technician to Repair
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Select a technician for this case line
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTechnicianModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Technician
                  </label>
                  <select
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                  >
                    <option value="">Choose a technician...</option>
                    {technicians.map((tech) => (
                      <option key={tech.userId} value={tech.userId}>
                        {tech.name} ({tech.activeTaskCount} active tasks)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTechnicianModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignTechnician}
                    disabled={!selectedTechnician}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
