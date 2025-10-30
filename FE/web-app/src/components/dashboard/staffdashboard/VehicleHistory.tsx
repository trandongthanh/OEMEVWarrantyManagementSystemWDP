"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  History,
  Calendar,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Gauge,
  Activity,
} from "lucide-react";
import vehicleService, { VehicleHistoryItem } from "@/services/vehicleService";
import { toast } from "sonner";

const statusColors: Record<
  string,
  {
    bg: string;
    text: string;
    icon: typeof CheckCircle;
    borderColor: string;
    dotColor: string;
  }
> = {
  COMPLETED: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle,
    borderColor: "border-green-300",
    dotColor: "bg-green-600",
  },
  IN_PROGRESS: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: Clock,
    borderColor: "border-blue-300",
    dotColor: "bg-blue-600",
  },
  PENDING: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Clock,
    borderColor: "border-yellow-300",
    dotColor: "bg-yellow-600",
  },
  PROCESSING: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: Activity,
    borderColor: "border-purple-300",
    dotColor: "bg-purple-600",
  },
};

export function VehicleHistory() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<VehicleHistoryItem[]>([]);

  const handleSearch = async () => {
    if (!vin.trim()) {
      toast.error("Please enter a VIN");
      return;
    }

    setLoading(true);
    try {
      const response = await vehicleService.getVehicleHistory(vin);
      if (response.status === "success") {
        setHistory(response.data.history);
        toast.success(`Found ${response.data.history.length} service records`);
      }
    } catch (error: unknown) {
      console.error("Error fetching history:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to fetch history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vehicle Service History
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View complete service and warranty history
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter vehicle VIN..."
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Summary Stats */}
          {history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      Total Services
                    </p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">
                      {history.length}
                    </p>
                  </div>
                  <History className="w-10 h-10 text-purple-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {history.filter((h) => h.status === "COMPLETED").length}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Latest Odometer
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {history[0]?.odometer.toLocaleString()}
                      <span className="text-sm ml-1">km</span>
                    </p>
                  </div>
                  <Gauge className="w-10 h-10 text-blue-600 opacity-60" />
                </div>
              </motion.div>
            </div>
          )}

          {/* History Timeline */}
          {history.length > 0 ? (
            <div className="space-y-6">
              {history.map((record, index) => {
                const statusConfig =
                  statusColors[record.status] || statusColors.PROCESSING;
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={record.recordId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-12 pb-6 border-l-2 border-gray-300 last:border-l-0 last:pb-0"
                  >
                    {/* Timeline Dot - Enhanced */}
                    <div
                      className={`absolute left-[-13px] top-0 w-6 h-6 rounded-full ${statusConfig.dotColor} border-4 border-white shadow-lg ring-2 ring-gray-100`}
                    />

                    <div
                      className={`bg-white rounded-2xl p-6 border-2 ${statusConfig.borderColor} hover:shadow-xl transition-all group`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                {new Date(
                                  record.checkInDate
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  record.checkInDate
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 ml-12">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {record.serviceCenter.name}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${statusConfig.bg} border ${statusConfig.borderColor} shadow-sm`}
                        >
                          <StatusIcon
                            className={`w-5 h-5 ${statusConfig.text}`}
                          />
                          <span
                            className={`text-sm font-bold ${statusConfig.text}`}
                          >
                            {record.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid - Enhanced */}
                      <div className="grid grid-cols-2 gap-4 mt-5">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Gauge className="w-5 h-5 text-blue-600" />
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                              Odometer
                            </p>
                          </div>
                          <p className="text-xl font-bold text-blue-900">
                            {record.odometer.toLocaleString()}
                            <span className="text-sm ml-1">km</span>
                          </p>
                        </div>
                        {record.completionDate && (
                          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                Completed
                              </p>
                            </div>
                            <p className="text-lg font-bold text-green-900">
                              {new Date(
                                record.completionDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {record.description && (
                        <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Service Description
                            </p>
                          </div>
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {record.description}
                          </p>
                        </div>
                      )}

                      {/* Guarantee Cases - Enhanced */}
                      {record.guaranteeCases &&
                        record.guaranteeCases.length > 0 && (
                          <div className="mt-5">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              <p className="text-sm font-bold text-gray-900">
                                Warranty Cases
                              </p>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                {record.guaranteeCases.length}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {record.guaranteeCases.map((gc) => (
                                <div
                                  key={gc.guaranteeCaseId}
                                  className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200 hover:border-indigo-300 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 text-sm">
                                      {gc.caseNumber}
                                    </span>
                                    <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">
                                      {gc.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : !loading && vin ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Service History Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                This vehicle doesn&apos;t have any service records yet. History
                will appear here after the first service appointment.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <History className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                View Service History
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Enter a vehicle VIN number above to access complete service and
                warranty history, including past repairs and maintenance
                records.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Service dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Case details</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Service centers</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
