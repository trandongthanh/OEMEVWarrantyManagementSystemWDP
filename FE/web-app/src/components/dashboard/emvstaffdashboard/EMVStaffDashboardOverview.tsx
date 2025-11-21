"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  AlertCircle,
  Package,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "@/lib/apiClient";
import MostUsedComponents from "../MostUsedComponents";

interface DashboardStats {
  totalTransferRequests: number;
  pendingRequests: number;
  activeRecallCampaigns: number;
  completedToday: number;
}

interface TransferRequest {
  status: string;
  updatedAt?: string;
}

interface EMVStaffDashboardOverviewProps {
  onNavigate?: (nav: string) => void;
}

export default function EMVStaffDashboardOverview({
  onNavigate,
}: EMVStaffDashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransferRequests: 0,
    pendingRequests: 0,
    activeRecallCampaigns: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stock transfer requests
      const [allRequests, pendingRequests, recallCampaigns] = await Promise.all(
        [
          apiClient.get("/stock-transfer-requests"),
          apiClient.get("/stock-transfer-requests", {
            params: { status: "PENDING" },
          }),
          apiClient.get("/recall-campaigns", {
            params: { status: "ACTIVE" },
          }),
        ]
      );

      // Calculate completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allRequestsData =
        allRequests.data?.data?.stockTransferRequests || [];
      const completedTodayCount = allRequestsData.filter(
        (req: TransferRequest) => {
          if (req.status !== "APPROVED" && req.status !== "COMPLETED")
            return false;
          if (!req.updatedAt) return false;

          const updateDate = new Date(req.updatedAt);
          updateDate.setHours(0, 0, 0, 0);

          return updateDate.getTime() === today.getTime();
        }
      ).length;

      setStats({
        totalTransferRequests: allRequestsData.length,
        pendingRequests:
          pendingRequests.data?.data?.stockTransferRequests?.length || 0,
        activeRecallCampaigns:
          recallCampaigns.data?.data?.campaigns?.length || 0,
        completedToday: completedTodayCount,
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Transfer Requests",
      value: stats.totalTransferRequests,
      icon: ArrowLeftRight,
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: AlertCircle,
      iconColor: "text-orange-600",
    },
    {
      title: "Active Recall Campaigns",
      value: stats.activeRecallCampaigns,
      icon: Package,
      iconColor: "text-red-600",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle,
      iconColor: "text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-900 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          EMV Staff Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage transfer requests and recall campaigns
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {card.title}
            </p>
            <p className={`text-3xl font-bold ${card.iconColor}`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate?.("transfer-requests")}
            className="p-4 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors text-left"
          >
            <ArrowLeftRight className="w-8 h-8 text-orange-600 mb-2" />
            <p className="font-semibold text-gray-900">Transfer Requests</p>
            <p className="text-sm text-gray-500">Review pending requests</p>
          </button>
          <button
            onClick={() => onNavigate?.("recall-campaigns")}
            className="p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors text-left"
          >
            <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="font-semibold text-gray-900">Recall Campaigns</p>
            <p className="text-sm text-gray-500">Manage vehicle recalls</p>
          </button>
          <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
            <Package className="w-8 h-8 text-gray-400 mb-2" />
            <p className="font-semibold text-gray-500">Coming Soon</p>
            <p className="text-sm text-gray-400">Additional features</p>
          </div>
        </div>
      </motion.div>

      {/* Most Used Components */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MostUsedComponents limit={10} showDateFilter={true} />
      </motion.div>
    </div>
  );
}
