"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  RotateCcw,
  Truck,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import { ComponentPickupList } from "./ComponentPickupList";

interface DashboardOverviewProps {
  onNavigate?: (nav: string) => void;
}

export function DashboardOverview({}: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    pendingPickups: 0,
    inTransit: 0,
    awaitingReturn: 0,
    returnedToday: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Fetch real stats from API when available
      // For now, using placeholder data
      setStats({
        pendingPickups: 0,
        inTransit: 0,
        awaitingReturn: 0,
        returnedToday: 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Pending Pickups",
      value: stats.pendingPickups,
      icon: Package,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Components in Transit",
      value: stats.inTransit,
      icon: Truck,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      label: "Awaiting Return",
      value: stats.awaitingReturn,
      icon: Clock,
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      label: "Returned Today",
      value: stats.returnedToday,
      icon: RotateCcw,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
  ];

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
                    Parts Coordinator Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage component pickups, installations, and returns
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Reserved Components List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200"
            >
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Reserved Components Ready for Pickup
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Components that have been reserved and are waiting to be
                      picked up from the warehouse
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ComponentPickupList />
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 4 cols */}
          <div className="col-span-4 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Today&apos;s Activity
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Components Picked Up
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.inTransit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Parts Returned</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.returnedToday}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Actions</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.pendingPickups + stats.awaitingReturn}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Workflow Instructions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Workflow Instructions
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Pickup</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Click &ldquo;Pickup&rdquo; on reserved components to mark
                      them as picked up from warehouse
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Install</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Technician will install the component on the vehicle
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Return</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Open the component detail to return old/defective parts
                      with serial number
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
