"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  User,
  Car,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { processingRecordService, ProcessingRecord } from "@/services";
import { Pagination } from "@/components/ui";
import { LucideIcon } from "lucide-react";

interface ManagerCasesListProps {
  onNavigateToAssignments?: (recordVin: string) => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: LucideIcon }
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

export function ManagerCasesList({
  onNavigateToAssignments,
}: ManagerCasesListProps) {
  const [records, setRecords] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await processingRecordService.getAllRecords({
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });
      // Handle nested structure: response.data.records.records
      const recordsData =
        response.data?.records?.records || response.data?.records || [];
      // Ensure we always set an array
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = Array.isArray(records)
    ? records.filter((record) => {
        const matchesSearch =
          searchQuery === "" ||
          record.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.vehicle?.licensePlate
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          record.vehicle?.owner?.fullName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
    : [];

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Records
          </h2>
          <p className=" text-gray-600">
            View all vehicle processing records and their status
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by VIN, license plate, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="ALL">All Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : paginatedRecords.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedRecords.map((record, index) => {
                  const status = statusConfig[record.status] || {
                    label: record.status,
                    color: "text-gray-700",
                    bgColor: "bg-gray-100",
                    icon: AlertCircle,
                  };
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex-1 grid grid-cols-12 gap-4">
                        {/* VIN & Vehicle */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Car className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">VIN</span>
                          </div>
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {record.vin}
                          </p>
                          <p className="text-xs text-gray-500">
                            {typeof record.vehicle.model === "string"
                              ? record.vehicle.model
                              : record.vehicle.model?.name || "N/A"}
                          </p>
                        </div>

                        {/* Owner */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Owner</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.vehicle.owner?.fullName || "N/A"}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Status
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${status.bgColor} ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        {/* Technician */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Technician
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.mainTechnician?.name || (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Check-in
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {new Date(record.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Manage Assignments Button */}
                      <button
                        onClick={() => onNavigateToAssignments?.(record.vin)}
                        className="ml-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        Manage Assignments
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
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
  );
}
