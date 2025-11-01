"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Package,
  ArrowLeftRight,
  Boxes,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "@/lib/apiClient";
import { authService } from "@/services";

interface DashboardStats {
  totalWarehouses: number;
  totalStock: number;
  pendingRequests: number;
  lowStockItems: number;
}

export default function CompanyDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWarehouses: 0,
    totalStock: 0,
    pendingRequests: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = authService.getUserInfo() || authService.getCurrentUser();

      // Load warehouses
      const warehousesResponse = await apiClient.get("/warehouses", {
        params: {
          context: "COMPANY",
          entityId: user?.companyId,
        },
      });

      // Load stock transfer requests
      const requestsResponse = await apiClient.get("/stock-transfer-requests", {
        params: {
          status: "PENDING",
        },
      });

      // Load inventory summary
      const inventoryResponse = await apiClient.get("/inventory/summary");

      const warehouses = warehousesResponse.data.data || [];
      const requests = requestsResponse.data.data || [];
      const inventory = inventoryResponse.data.data || {};

      setStats({
        totalWarehouses: warehouses.length,
        totalStock: inventory.totalQuantity || 0,
        pendingRequests: requests.length,
        lowStockItems: inventory.lowStockCount || 0,
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
      title: "Company Warehouses",
      value: stats.totalWarehouses,
      icon: Building2,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Stock",
      value: stats.totalStock,
      icon: Boxes,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: ArrowLeftRight,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertCircle,
      color: "red",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
            <p className="text-blue-100">
              Manage your company warehouses, inventory, and stock transfer
              requests
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${card.bgColor} border-2 ${card.borderColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-left">
                <Boxes className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-semibold text-gray-900">View Inventory</p>
                <p className="text-sm text-gray-500">
                  Check current stock levels
                </p>
              </button>
              <button className="p-4 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors text-left">
                <ArrowLeftRight className="w-8 h-8 text-orange-600 mb-2" />
                <p className="font-semibold text-gray-900">Transfer Requests</p>
                <p className="text-sm text-gray-500">Review pending requests</p>
              </button>
              <button className="p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors text-left">
                <Building2 className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-semibold text-gray-900">Warehouses</p>
                <p className="text-sm text-gray-500">
                  Manage warehouse network
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
