"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Calendar,
  Wrench,
  Car,
  User,
  X,
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
    icon: Wrench,
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
    icon: X,
  },
};

export function MyTasks() {
  const [tasks, setTasks] = useState<TechnicianProcessingRecord[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<
    TechnicianProcessingRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, searchQuery, statusFilter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await technicianService.getAssignedRecords();
      const recordsData = response.data?.records?.records || [];
      setTasks(recordsData);
    } catch (err: unknown) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

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

    setFilteredTasks(filtered);
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    urgent: tasks.filter(
      (t) => t.status === "IN_REPAIR" || t.status === "WAITING_FOR_PARTS"
    ).length,
    today: tasks.filter((t) => {
      const checkInDate = new Date(t.checkInDate);
      const today = new Date();
      return checkInDate.toDateString() === today.toDateString();
    }).length,
    pending: tasks.filter((t) => t.status === "CHECKED_IN").length,
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-600 mt-1">
            Manage your assigned warranty cases and repairs
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
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.total}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-xs text-gray-500 mt-1">All assigned work</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.urgent}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-xs text-gray-500 mt-1">High priority</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.today}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">
                Checked In Today
              </p>
              <p className="text-xs text-gray-500 mt-1">Today&apos;s work</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.pending}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
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
                <option value="ALL">All Status</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_DIAGNOSIS">In Diagnosis</option>
                <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                <option value="IN_REPAIR">In Repair</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search or filters"
                : "You don't have any assigned tasks at the moment"}
            </p>
          </div>
        ) : (
          /* Tasks List */
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => {
                const StatusIcon =
                  statusConfig[task.status]?.icon || AlertCircle;
                const statusInfo =
                  statusConfig[task.status] || statusConfig.CHECKED_IN;

                return (
                  <motion.div
                    key={task.vin}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* VIN and Model */}
                        <div className="flex items-center gap-3 mb-2">
                          <Car className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.vehicle.model.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({task.vin})
                          </span>
                        </div>

                        {/* Guarantee Cases */}
                        {task.guaranteeCases &&
                          task.guaranteeCases.length > 0 && (
                            <div className="ml-8 space-y-1">
                              {task.guaranteeCases.map((gc) => (
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
                            {new Date(task.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Odometer */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Odometer</p>
                          <p className="text-sm font-medium text-gray-900">
                            {task.odometer.toLocaleString()} km
                          </p>
                        </div>
                      </div>

                      {/* Created By */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Created By</p>
                          <p className="text-sm font-medium text-gray-900">
                            {task.createdByStaff.name}
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