"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  Calendar,
  User,
  Car,
  Loader2,
  Filter,
  Search,
  X,
  FileText,
  TrendingUp,
} from "lucide-react";
import technicianService, {
  TechnicianProcessingRecord,
} from "@/services/technicianService";

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
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
    icon: X,
  },
};

export function WorkHistory() {
  const [history, setHistory] = useState<TechnicianProcessingRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<
    TechnicianProcessingRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, searchQuery, statusFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await technicianService.getAssignedRecords();
      const recordsData = response.data?.records?.records || [];
      // Only show completed or cancelled tasks
      const completedTasks = recordsData.filter(
        (record) =>
          record.status === "COMPLETED" || record.status === "CANCELLED"
      );
      setHistory(completedTasks);
    } catch (err: unknown) {
      console.error("Failed to load work history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...history];

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.vin.toLowerCase().includes(query) ||
          task.vehicle.model.name.toLowerCase().includes(query) ||
          task.guaranteeCases.some((gc) =>
            gc.contentGuarantee.toLowerCase().includes(query)
          )
      );
    }

    setFilteredHistory(filtered);
  };

  // Calculate stats
  const stats = {
    total: history.length,
    completed: history.filter((r) => r.status === "COMPLETED").length,
    thisMonth: history.filter((r) => {
      const completedDate = new Date(r.checkInDate);
      const now = new Date();
      return (
        completedDate.getMonth() === now.getMonth() &&
        completedDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  const successRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Work History</h2>
          <p className="text-gray-600 mt-1">
            Review your complete work history and past repairs
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.total}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Total History</p>
              <p className="text-xs text-gray-500 mt-1">All work records</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.completed}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xs text-gray-500 mt-1">Finished jobs</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.thisMonth}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-xs text-gray-500 mt-1">Recent work</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : `${successRate}%`}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-xs text-gray-500 mt-1">Completion ratio</p>
            </motion.div>
          </div>
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
                  placeholder="Search by VIN, vehicle model, or case content..."
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors cursor-pointer hover:bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No history found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your filters to see more records"
                : "Your completed work history will appear here"}
            </p>
          </div>
        ) : (
          /* History List */
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((record) => {
                const StatusIcon =
                  statusConfig[record.status]?.icon || CheckCircle;
                const statusInfo =
                  statusConfig[record.status] || statusConfig.COMPLETED;

                return (
                  <motion.div
                    key={record.vin}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
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
                        {record.guaranteeCases &&
                          record.guaranteeCases.length > 0 && (
                            <div className="ml-8 space-y-1">
                              {record.guaranteeCases.map((gc) => (
                                <p
                                  key={gc.guaranteeCaseId}
                                  className="text-sm text-gray-600"
                                >
                                  • {gc.contentGuarantee}
                                </p>
                              ))}
                            </div>
                          )}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      {/* Check-in Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Check-in</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(record.checkInDate).toLocaleDateString()}
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

                      {/* Created By */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Created By</p>
                          <p className="text-sm font-medium text-gray-900">
                            {record.createdByStaff.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}