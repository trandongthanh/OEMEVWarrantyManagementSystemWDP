"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wrench,
  TrendingUp,
  Activity,
} from "lucide-react";
import { processingRecordService, ProcessingRecord } from "@/services";

export function DashboardOverview() {
  const [processingRecords, setProcessingRecords] = useState<
    ProcessingRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProcessingRecords();
  }, []);

  const loadProcessingRecords = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await processingRecordService.getAllRecords();
      // Handle nested structure: response.data.records.records
      const recordsData =
        response.data?.records?.records || response.data?.records || [];
      // Filter records assigned to current technician
      const assignedRecords = (
        Array.isArray(recordsData) ? recordsData : []
      ).filter((record: ProcessingRecord) => record.mainTechnician);
      setProcessingRecords(assignedRecords);
    } catch (err: unknown) {
      setError("Failed to load processing records");
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
      IN_REPAIR: "bg-purple-100 text-purple-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };

  const activeCount = processingRecords.filter(
    (r) => r.status === "IN_DIAGNOSIS" || r.status === "IN_REPAIR"
  ).length;
  const completedToday = processingRecords.filter(
    (r) => r.status === "COMPLETED"
  ).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - 8 cols */}
          <div className="col-span-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    My Assigned Cases
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Warranty cases assigned to you
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <button
                onClick={loadProcessingRecords}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Cases List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : processingRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No assigned cases
                  </h3>
                  <p className="text-gray-500 text-center">
                    You don&apos;t have any warranty cases assigned to you at
                    the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {processingRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              VIN: {record.vin}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Check-in:{" "}
                              {new Date(
                                record.checkInDate
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Odometer:</span>
                              {record.odometer.toLocaleString()} km
                            </div>
                          </div>

                          {record.guaranteeCases &&
                            record.guaranteeCases.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                  Guarantee Cases (
                                  {record.guaranteeCases.length}
                                  ):
                                </p>
                                <div className="space-y-1">
                                  {record.guaranteeCases.map(
                                    (guaranteeCase, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-gray-600 bg-white px-2 py-1 rounded"
                                      >
                                        {guaranteeCase.contentGuarantee}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Stats Sidebar - 4 cols */}
          <div className="col-span-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <ClipboardList className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {processingRecords.length}
                </span>
              </div>
              <p className="font-medium">Total Assigned</p>
              <p className="text-sm opacity-80 mt-1">All your cases</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{activeCount}</span>
              </div>
              <p className="font-medium">Active Cases</p>
              <p className="text-sm opacity-80 mt-1">In progress</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{completedToday}</span>
              </div>
              <p className="font-medium">Completed</p>
              <p className="text-sm opacity-80 mt-1">Finished cases</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-blue-200 p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <p className="font-semibold text-gray-900">Work Status</p>
              </div>
              <p className="text-sm text-gray-600">
                {activeCount > 0
                  ? `${activeCount} cases need attention`
                  : "All cases up to date"}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Active</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
