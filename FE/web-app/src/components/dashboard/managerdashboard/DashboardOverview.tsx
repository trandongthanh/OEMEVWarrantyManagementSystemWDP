"use client";

import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Technician } from "@/services";

interface DashboardOverviewProps {
  technicians: Technician[];
}

export function DashboardOverview({ technicians }: DashboardOverviewProps) {
  const workingCount = technicians.filter(
    (t) => t.workSchedule?.[0]?.status === "WORKING"
  ).length;
  const dayOffCount = technicians.filter(
    (t) => t.workSchedule?.[0]?.status === "DAY_OFF"
  ).length;
  const onLeaveCount = technicians.filter(
    (t) =>
      t.workSchedule?.[0]?.status === "LEAVE_APPROVED" ||
      t.workSchedule?.[0]?.status === "LEAVE_REQUESTED"
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
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - 8 cols */}
          <div className="col-span-8 space-y-6">
            {/* Team Performance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Team Performance
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Current workforce status
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-900">
                      Working
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {workingCount}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">Day Off</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-600">
                    {dayOffCount}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-900">
                      On Leave
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">
                    {onLeaveCount}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Technician Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">
                Technician Overview
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {technicians.map((tech) => (
                  <div
                    key={tech.userId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {tech.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tech.name}</p>
                        <p className="text-sm text-gray-500">
                          {tech.workSchedule[0]?.status
                            ?.replace(/_/g, " ")
                            .toLowerCase() || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {tech.activeTaskCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">active tasks</p>
                    </div>
                  </div>
                ))}
              </div>
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
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{technicians.length}</span>
              </div>
              <p className="font-medium">Total Team</p>
              <p className="text-sm opacity-80 mt-1">All technicians</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  {avgWorkload.toFixed(1)}
                </span>
              </div>
              <p className="font-medium">Avg Workload</p>
              <p className="text-sm opacity-80 mt-1">Tasks per tech</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{totalWorkload}</span>
              </div>
              <p className="font-medium">Active Tasks</p>
              <p className="text-sm opacity-80 mt-1">Currently assigned</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-green-200 p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="font-semibold text-gray-900">Team Status</p>
              </div>
              <p className="text-sm text-gray-600">
                {workingCount} technicians actively working
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}