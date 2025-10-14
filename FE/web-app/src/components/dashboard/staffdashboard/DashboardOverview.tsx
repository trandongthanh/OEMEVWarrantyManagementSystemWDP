"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Technician } from "@/services";

interface DashboardOverviewProps {
  technicians: Technician[];
  onNewClaimClick: () => void;
  onNavigate: (nav: string) => void;
}

export function DashboardOverview({
  technicians,
  onNewClaimClick,
  onNavigate,
}: DashboardOverviewProps) {
  const workingCount = technicians.filter(
    (t) => t.workSchedule?.status === "WORKING"
  ).length;
  const dayOffCount = technicians.filter(
    (t) => t.workSchedule?.status === "DAY_OFF"
  ).length;
  const onLeaveCount = technicians.filter(
    (t) =>
      t.workSchedule?.status === "LEAVE_APPROVED" ||
      t.workSchedule?.status === "LEAVE_REQUESTED"
  ).length;

  const totalWorkload = technicians.reduce(
    (sum, t) => sum + (t.activeTaskCount || 0),
    0
  );
  const avgWorkload =
    technicians.length > 0 ? totalWorkload / technicians.length : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Users className="w-6 h-6 text-blue-600" />
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
              onClick={() => onNavigate("receipts")}
              className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Receipts</h3>
                  <p className="text-sm text-gray-600">View transactions</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Technician Overview - 8 cols */}
          <div className="col-span-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Technician Overview
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {workingCount}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Working</p>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {dayOffCount}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Day Off</p>
                  <p className="text-xs text-gray-500 mt-1">Not available</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {onLeaveCount}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Approved/Requested
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Technicians List */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Active Technicians
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {technicians.slice(0, 8).map((tech) => (
                  <div
                    key={tech.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {tech.name?.charAt(0) || "T"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {tech.name || tech.userId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tech.workSchedule?.status
                            ?.replace(/_/g, " ")
                            .toLowerCase() || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {tech.activeTaskCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">tasks</p>
                    </div>
                  </div>
                ))}
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
                <span className="text-3xl font-bold">{technicians.length}</span>
              </div>
              <p className="font-medium">Total Technicians</p>
              <p className="text-sm opacity-80 mt-1">Active workforce</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {avgWorkload.toFixed(1)}
                </span>
              </div>
              <p className="font-medium">Avg Workload</p>
              <p className="text-sm opacity-80 mt-1">Tasks per technician</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{totalWorkload}</span>
              </div>
              <p className="font-medium">Total Active Tasks</p>
              <p className="text-sm opacity-80 mt-1">Across all technicians</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
