"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Car,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  MessageCircle,
  Package,
} from "lucide-react";
import { processingRecordService, ProcessingRecord } from "@/services";

interface DashboardOverviewProps {
  onNewClaimClick: () => void;
  onNavigate: (nav: string) => void;
  onRegisterVehicleClick: () => void;
}

export function DashboardOverview({
  onNewClaimClick,
  onNavigate,
  onRegisterVehicleClick,
}: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    completedToday: 0,
    pendingApproval: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await processingRecordService.getAllRecords({});
      // Handle nested structure: response.data.records.records
      const records =
        response.data?.records?.records ||
        response.data?.records ||
        response.data ||
        [];

      // Ensure records is an array
      const recordsArray = Array.isArray(records) ? records : [];

      // Calculate stats
      const total = recordsArray.length;
      const active = recordsArray.filter(
        (r: ProcessingRecord) =>
          r.status === "CHECKED_IN" ||
          r.status === "IN_DIAGNOSIS" ||
          r.status === "IN_REPAIR"
      ).length;
      const completed = recordsArray.filter(
        (r: ProcessingRecord) => r.status === "COMPLETED"
      ).length;
      const pending = recordsArray.filter(
        (r: ProcessingRecord) => r.status === "WAITING_FOR_PARTS"
      ).length;

      setStats({
        totalCases: total,
        activeCases: active,
        completedToday: completed,
        pendingApproval: pending,
      });

      // Get recent activity (last 5 records)
      setRecentActivity(recordsArray.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewClaimClick}
              className="p-6 bg-white border-2 border-gray-900 rounded-2xl hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Claim</h3>
                  <p className="text-sm text-gray-600">Create warranty claim</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("cases")}
              className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Cases</h3>
                  <p className="text-sm text-gray-600">Manage all claims</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegisterVehicleClick}
              className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Register Vehicle
                  </h3>
                  <p className="text-sm text-gray-600">
                    Register vehicle ownership
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("chat-support")}
              className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Chat Support</h3>
                  <p className="text-sm text-gray-600">Customer assistance</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Cases Overview - 8 cols */}
          <div className="col-span-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Cases Overview
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : stats.totalCases}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Cases
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    All warranty claims
                  </p>
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
                      {loading ? "..." : stats.activeCases}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
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
                      {loading ? "..." : stats.completedToday}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-xs text-gray-500 mt-1">Finished cases</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : stats.pendingApproval}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Waiting Parts
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Pending</p>
                </motion.div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Loading...</p>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((record, index) => (
                    <div
                      key={record.vehicleProcessingRecordId || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {record.vin || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.status?.replace(/_/g, " ").toLowerCase() ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {record.vehicle?.licensePlate || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">License Plate</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats - 4 cols */}
          <div className="col-span-4 space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.totalCases}
                </span>
              </div>
              <p className="font-medium">Total Claims</p>
              <p className="text-sm opacity-80 mt-1">All warranty cases</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.completedToday}
                </span>
              </div>
              <p className="font-medium">Completed</p>
              <p className="text-sm opacity-80 mt-1">Successfully finished</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.activeCases}
                </span>
              </div>
              <p className="font-medium">Active Cases</p>
              <p className="text-sm opacity-80 mt-1">Currently in progress</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
