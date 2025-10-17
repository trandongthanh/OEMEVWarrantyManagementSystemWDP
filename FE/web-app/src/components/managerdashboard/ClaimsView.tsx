"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Loader,
  Search,
  Filter,
  Eye,
  Clock,
  UserCheck,
} from "lucide-react";
import managerService, {
  type ProcessingRecord,
} from "@/services/managerService";
import { CaseLinesList } from "./CaseLinesList";

export function ClaimsView() {
  const [processingRecords, setProcessingRecords] = useState<
    ProcessingRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    loadProcessingRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const loadProcessingRecords = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await managerService.getProcessingRecords(
        currentPage,
        10,
        statusFilter || undefined
      );
      setProcessingRecords(response.data.records.records);
      setTotalPages(response.data.records.pagination.totalPages);
    } catch (err: unknown) {
      setError("Failed to load claims");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      CHECKED_IN: "bg-blue-100 text-blue-700",
      IN_DIAGNOSIS: "bg-yellow-100 text-yellow-700",
      WAITING_FOR_PARTS: "bg-orange-100 text-orange-700",
      PAID: "bg-green-100 text-green-700",
      IN_REPAIR: "bg-purple-100 text-purple-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };

  const filteredRecords = processingRecords.filter((record) =>
    record.vin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedRecordId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedRecordId(null)}
            className="mb-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Back to Claims List
          </button>
          <CaseLinesList recordId={selectedRecordId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Claims</h1>
          <p className="text-gray-600 mt-2">
            View and manage all warranty claims
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by VIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">All Statuses</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_DIAGNOSIS">In Diagnosis</option>
                <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                <option value="IN_REPAIR">In Repair</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button
              onClick={loadProcessingRecords}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Claims List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No claims found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            VIN: {record.vin}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {record.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Check-in:{" "}
                            {new Date(record.checkInDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Odometer:</span>
                            {record.odometer.toLocaleString()} km
                          </div>
                        </div>

                        {record.mainTechnician && (
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Assigned to:</span>
                            <span className="font-medium text-gray-900">
                              {record.mainTechnician.name}
                            </span>
                          </div>
                        )}

                        <div className="text-sm">
                          <span className="text-gray-600 font-medium">
                            Guarantee Cases ({record.guaranteeCases.length}):
                          </span>
                          <div className="mt-2 space-y-1">
                            {record.guaranteeCases.slice(0, 2).map((gCase) => (
                              <div
                                key={gCase.guaranteeCaseId}
                                className="text-gray-700 pl-4 border-l-2 border-gray-200 text-sm"
                              >
                                {gCase.contentGuarantee}
                              </div>
                            ))}
                            {record.guaranteeCases.length > 2 && (
                              <p className="text-xs text-gray-500 pl-4">
                                +{record.guaranteeCases.length - 2} more cases
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedRecordId(record.id)}
                        className="ml-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
