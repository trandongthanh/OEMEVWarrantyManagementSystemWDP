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
} from "lucide-react";
import { processingRecordService } from "@/services";

interface GuaranteeCase {
  guaranteeCaseId: string;
  status: string;
  contentGuarantee: string;
}

interface ProcessingRecord {
  vin: string;
  checkInDate: string;
  odometer: number;
  status: string;
  mainTechnician?: {
    userId: string;
    name: string;
  } | null;
  vehicle: {
    vin: string;
    model: {
      name: string;
      vehicleModelId: string;
    };
  };
  guaranteeCases: GuaranteeCase[];
  createdByStaff: {
    userId: string;
    name: string;
  };
}

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

  useEffect(() => {
    fetchRecords();
  }, [currentPage, statusFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const response = await processingRecordService.getAllRecords(params);
      setRecords(response.records || []);
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      record.vin.toLowerCase().includes(searchLower) ||
      record.vehicle.model.name.toLowerCase().includes(searchLower) ||
      record.createdByStaff.name.toLowerCase().includes(searchLower) ||
      record.mainTechnician?.name.toLowerCase().includes(searchLower)
    );
  });

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
              {filteredRecords.map((record) => {
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
                    onClick={() => onViewDetails?.(record)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* VIN and Model */}
                        <div className="flex items-center gap-3 mb-2">
                          <Car className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.vehicle.model.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({record.vin})
                          </span>
                        </div>

                        {/* Guarantee Cases */}
                        <div className="ml-8 space-y-1">
                          {record.guaranteeCases.map((gCase) => (
                            <p
                              key={gCase.guaranteeCaseId}
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

                      {/* Created By */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Created by</p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.createdByStaff.name}
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
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={filteredRecords.length < 10}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
