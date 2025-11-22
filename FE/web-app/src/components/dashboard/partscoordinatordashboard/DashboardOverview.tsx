"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  CheckCircle,
} from "lucide-react";
import componentReservationService from "@/services/componentReservationService";
import stockTransferService from "@/services/stockTransferService";
import inventoryService from "@/services/inventoryService";
import { authService } from "@/services";
import MostUsedComponents from "../MostUsedComponents";

interface DashboardOverviewProps {
  onNavigate?: (nav: string) => void;
}

export function DashboardOverview({}: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    pendingPickups: 0,
    pendingTransfers: 0,
    incomingShipments: 0,
    lowStockItems: 0,
  });

  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getUserInfo() || authService.getCurrentUser();
    setUserRole(user?.roleName || null);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const currentUser =
        authService.getUserInfo() || authService.getCurrentUser();
      const isServiceCenter =
        currentUser?.roleName === "parts_coordinator_service_center";

      // Load component reservations (pending pickups)
      const reservationsPromise = componentReservationService
        .getComponentReservations({
          status: "RESERVED",
          limit: 1,
        })
        .catch(() => ({ data: { pagination: { total: 0 } } }));

      // Load stock transfer requests
      const transfersPromise = stockTransferService
        .getRequests({
          status: isServiceCenter ? "PENDING_APPROVAL" : "APPROVED",
          limit: 1,
        })
        .catch(() => ({ data: { pagination: { total: 0 } } }));

      // Load incoming shipments (only for service center)
      const shipmentsPromise = isServiceCenter
        ? stockTransferService
            .getRequests({
              status: "SHIPPED",
              limit: 1,
            })
            .catch(() => ({
              data: { requests: [], stockTransferRequests: [] },
            }))
        : Promise.resolve({
            data: { requests: [], stockTransferRequests: [] },
          });

      // Load inventory to check low stock (get user's warehouse)
      const warehouseId =
        currentUser?.serviceCenterId || currentUser?.companyId || "";

      const inventoryPromise = warehouseId
        ? inventoryService.getTypeComponents(warehouseId).catch(() => [])
        : Promise.resolve([]);

      const [reservations, transfers, shipments, inventory] = await Promise.all(
        [
          reservationsPromise,
          transfersPromise,
          shipmentsPromise,
          inventoryPromise,
        ]
      );

      // Count low stock items (quantityAvailable < 10)
      const lowStock = inventory.filter(
        (stock) => stock.quantityAvailable < 10
      ).length;

      // Get shipments count
      const shipmentsCount =
        shipments.data.requests?.length ||
        shipments.data.stockTransferRequests?.length ||
        0;

      setStats({
        pendingPickups: reservations.data.pagination?.total || 0,
        pendingTransfers: transfers.data.pagination?.total || 0,
        incomingShipments: shipmentsCount,
        lowStockItems: lowStock,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setStats({
        pendingPickups: 0,
        pendingTransfers: 0,
        incomingShipments: 0,
        lowStockItems: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const isServiceCenter = userRole === "parts_coordinator_service_center";

  const statCards = isServiceCenter
    ? [
        {
          label: "Pending Component Pickups",
          value: stats.pendingPickups,
          icon: Package,
          bgColor: "bg-blue-100",
          textColor: "text-blue-600",
        },
        {
          label: "Pending Transfer Requests",
          value: stats.pendingTransfers,
          icon: FileText,
          bgColor: "bg-orange-100",
          textColor: "text-orange-600",
        },
        {
          label: "Incoming Shipments",
          value: stats.incomingShipments,
          icon: Truck,
          bgColor: "bg-purple-100",
          textColor: "text-purple-600",
        },
        {
          label: "Low Stock Items",
          value: stats.lowStockItems,
          icon: AlertCircle,
          bgColor: "bg-red-100",
          textColor: "text-red-600",
        },
      ]
    : [
        {
          label: "Pending Component Pickups",
          value: stats.pendingPickups,
          icon: Package,
          bgColor: "bg-blue-100",
          textColor: "text-blue-600",
        },
        {
          label: "Ready to Ship",
          value: stats.pendingTransfers,
          icon: Truck,
          bgColor: "bg-green-100",
          textColor: "text-green-600",
        },
        {
          label: "Low Stock Items",
          value: stats.lowStockItems,
          icon: AlertCircle,
          bgColor: "bg-red-100",
          textColor: "text-red-600",
        },
        {
          label: "Total Active Reservations",
          value: stats.pendingPickups,
          icon: CheckCircle,
          bgColor: "bg-purple-100",
          textColor: "text-purple-600",
        },
      ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <h1 className="text-2xl font-bold text-gray-900">
                Parts Coordinator Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isServiceCenter
                  ? "Manage inventory, stock transfers, and component reservations"
                  : "Manage company inventory and fulfill stock transfer requests"}
              </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Today Activity */}
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
                  Quick Stats
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Actions</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.pendingPickups + stats.pendingTransfers}
                  </span>
                </div>

                {isServiceCenter && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Items in Transit
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.incomingShipments}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Low Stock Alerts
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      stats.lowStockItems > 0 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {stats.lowStockItems}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Most Used Components */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <MostUsedComponents limit={5} showDateFilter={false} />
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
                {isServiceCenter
                  ? "Service Center Workflow"
                  : "Company Workflow"}
              </h3>

              {isServiceCenter ? (
                <div className="space-y-3">
                  <InstructionStep
                    number="1"
                    title="Request Parts"
                    desc="Create stock transfer requests when inventory is low"
                  />
                  <InstructionStep
                    number="2"
                    title="Receive Shipments"
                    desc="Process incoming shipments from company warehouse"
                  />
                  <InstructionStep
                    number="3"
                    title="Handle Pickups"
                    desc="Mark components as picked up by technicians"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <InstructionStep
                    number="1"
                    title="Monitor Inventory"
                    desc="Keep track of stock levels across all components"
                  />
                  <InstructionStep
                    number="2"
                    title="Process Requests"
                    desc="Review and approve transfer requests from service centers"
                  />
                  <InstructionStep
                    number="3"
                    title="Ship Parts"
                    desc="Ship approved requests to service centers"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small UI helper component
function InstructionStep({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="text-sm font-medium text-blue-900">{title}</p>
        <p className="text-xs text-blue-700 mt-1">{desc}</p>
      </div>
    </div>
  );
}
