"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  User,
  Car,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import { processingRecordService, ProcessingRecord } from "@/services";
import { Pagination } from "@/components/ui";

interface CasesListProps {
  onViewDetails?: (record: ProcessingRecord) => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  CHECKED_IN: {
    label: "Checked In",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: CheckCircle,
  },
  IN_DIAGNOSIS: {
    label: "In Diagnosis",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Clock,
  },
  WAITING_FOR_PARTS: {
    label: "Waiting for Parts",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: AlertCircle,
  },
  IN_REPAIR: {
    label: "In Repair",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: AlertCircle,
  },
  PAID: {
    label: "Paid",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: CheckCircle,
  },
};

export function CasesList({ onViewDetails }: CasesListProps) {
  const [records, setRecords] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<ProcessingRecord | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const itemsPerPage = 6;

  useEffect(() => {
    fetchRecords();
  }, [currentPage, statusFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await processingRecordService.getAllRecords({
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });
      // Backend returns nested structure: { data: { records: { records: Array } } }
      const recordsData =
        (response as any)?.data?.records?.records ||
        response.data?.records ||
        (response as any)?.records ||
        [];
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = Array.isArray(records)
    ? records.filter((record) => {
        const searchLower = searchQuery.toLowerCase();
        const modelName =
          typeof record.vehicle?.model === "object"
            ? record.vehicle?.model?.name
            : record.vehicle?.model;
        return (
          record.vin?.toLowerCase().includes(searchLower) ||
          modelName?.toLowerCase().includes(searchLower) ||
          record.mainTechnician?.name?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleViewDetails = (record: ProcessingRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
    if (onViewDetails) {
      onViewDetails(record);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Warranty Claims & Cases
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage all warranty claims and processing records
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by VIN, model, staff, or technician..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors cursor-pointer hover:bg-white"
              >
                <option value="ALL" className="text-gray-900">
                  All Status
                </option>
                <option value="CHECKED_IN" className="text-gray-900">
                  Checked In
                </option>
                <option value="IN_DIAGNOSIS" className="text-gray-900">
                  In Diagnosis
                </option>
                <option value="WAITING_FOR_PARTS" className="text-gray-900">
                  Waiting for Parts
                </option>
                <option value="IN_REPAIR" className="text-gray-900">
                  In Repair
                </option>
                <option value="COMPLETED" className="text-gray-900">
                  Completed
                </option>
                <option value="PAID" className="text-gray-900">
                  Paid
                </option>
                <option value="CANCELLED" className="text-gray-900">
                  Cancelled
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No claims found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No warranty claims or cases available"}
            </p>
          </div>
        ) : (
          /* Records List */
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginatedRecords.map((record) => {
                const StatusIcon =
                  statusConfig[record.status]?.icon || AlertCircle;
                const statusInfo =
                  statusConfig[record.status] || statusConfig.CHECKED_IN;

                return (
                  <motion.div
                    key={`${record.vin}-${record.checkInDate}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleViewDetails(record)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* VIN and Model */}
                        <div className="flex items-center gap-3 mb-2">
                          <Car className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {typeof record.vehicle?.model === "object"
                              ? record.vehicle.model.name
                              : record.vehicle?.model || "Unknown Model"}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({record.vin})
                          </span>
                        </div>

                        {/* Guarantee Cases */}
                        <div className="ml-8 space-y-1">
                          {record.guaranteeCases?.map((gCase: any) => (
                            <p
                              key={gCase.guaranteeCaseId || gCase.caseId}
                              className="text-sm text-gray-600"
                            >
                              • {gCase.contentGuarantee}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusInfo.bgColor}`}
                      >
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span
                          className={`text-sm font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                      {/* Check-in Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Check-in</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(record.checkInDate)}
                          </p>
                        </div>
                      </div>

                      {/* Odometer */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Odometer</p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.odometer.toLocaleString()} km
                          </p>
                        </div>
                      </div>

                      {/* Technician */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Technician</p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.mainTechnician?.name || "Unassigned"}
                          </p>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Owner</p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.vehicle?.owner?.fullName || "No Owner"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View Details Arrow */}
                    <div className="flex justify-end mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredRecords.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRecords.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Details Modal - Minimalistic Design */}
        <AnimatePresence>
          {showDetailsModal && selectedRecord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
              >
                {/* Modal Header - Clean & Simple */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Case Details
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      VIN: {selectedRecord.vin}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content - Minimalistic Sections */}
                <div className="p-6 space-y-6">
                  {/* Vehicle Information */}
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Car className="w-5 h-5 text-gray-700" />
                      <h3 className="text-base font-medium text-gray-900">
                        Vehicle Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Model
                        </p>
                        <p className="text-sm text-gray-900">
                          {typeof selectedRecord.vehicle?.model === "object"
                            ? selectedRecord.vehicle.model.name
                            : selectedRecord.vehicle?.model || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          VIN
                        </p>
                        <p className="text-sm text-gray-900 font-mono">
                          {selectedRecord.vin}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Owner
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.vehicle?.owner?.fullName ||
                            "No Owner Registered"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Odometer
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.odometer?.toLocaleString()} km
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Timeline */}
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-gray-700" />
                      <h3 className="text-base font-medium text-gray-900">
                        Status & Timeline
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Status
                        </p>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                            statusConfig[selectedRecord.status]?.bgColor ||
                            "bg-gray-100"
                          } ${
                            statusConfig[selectedRecord.status]?.color ||
                            "text-gray-700"
                          }`}
                        >
                          {statusConfig[selectedRecord.status]?.label ||
                            selectedRecord.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Check-in Date
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedRecord.checkInDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Technician
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.mainTechnician?.name ||
                            "Not Assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Created By
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.createdByStaff?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warranty Cases */}
                  {selectedRecord.guaranteeCases &&
                    selectedRecord.guaranteeCases.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-gray-700" />
                          <h3 className="text-base font-medium text-gray-900">
                            Warranty Cases
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {selectedRecord.guaranteeCases.map((gCase: any) => (
                            <div
                              key={gCase.guaranteeCaseId || gCase.caseId}
                              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <p className="text-sm text-gray-900 flex-1">
                                  {gCase.contentGuarantee}
                                </p>
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium whitespace-nowrap">
                                  {gCase.status || gCase.statusForGuaranteeCase}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 font-mono">
                                {gCase.guaranteeCaseId || gCase.caseId}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
