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
} from "lucide-react";
import vehicleService, { VehicleHistoryItem } from "@/services/vehicleService";
import { toast } from "sonner";

const statusColors: Record<
  string,
  { bg: string; text: string; icon: typeof CheckCircle }
> = {
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
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

          {/* History Timeline */}
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((record, index) => {
                const statusConfig =
                  statusColors[record.status] || statusColors.IN_PROGRESS;
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={record.recordId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-purple-600 border-4 border-white" />

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-900">
                              {new Date(record.checkInDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{record.serviceCenter.name}</span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}
                        >
                          <StatusIcon
                            className={`w-4 h-4 ${statusConfig.text}`}
                          />
                          <span
                            className={`text-sm font-medium ${statusConfig.text}`}
                          >
                            {record.status}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Odometer</p>
                          <p className="font-medium text-gray-900">
                            {record.odometer.toLocaleString()} km
                          </p>
                        </div>
                        {record.completionDate && (
                          <div>
                            <p className="text-xs text-gray-500">Completed</p>
                            <p className="font-medium text-gray-900">
                              {new Date(
                                record.completionDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {record.description && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            Description
                          </p>
                          <p className="text-sm text-gray-700">
                            {record.description}
                          </p>
                        </div>
                      )}

                      {/* Guarantee Cases */}
                      {record.guaranteeCases &&
                        record.guaranteeCases.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Guarantee Cases ({record.guaranteeCases.length})
                            </p>
                            <div className="space-y-2">
                              {record.guaranteeCases.map((gc) => (
                                <div
                                  key={gc.guaranteeCaseId}
                                  className="bg-white rounded-lg p-2 text-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">
                                      {gc.caseNumber}
                                    </span>
                                    <span className="text-gray-500">
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
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Service History Found
              </h3>
              <p className="text-gray-500">
                No service records found for this vehicle
              </p>
            </div>
          ) : (
            <div className="text-center py-16">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Search for a Vehicle
              </h3>
              <p className="text-gray-500">
                Enter a VIN above to view service history
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
