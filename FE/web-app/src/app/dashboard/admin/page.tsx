"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Package,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Database,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  ArrowLeftRight,
} from "lucide-react";
import {
  authService,
  userService,
  warehouseService,
  Warehouse,
  Technician,
} from "@/services";
import {
  Sidebar,
  DashboardHeader,
  PlaceholderContent,
} from "@/components/dashboard";
import StockTransferRequestManager from "@/components/dashboard/companydashboard/StockTransferRequestManager";

interface CurrentUser {
  userId: string;
  roleName: string;
}

export default function EMVStaffDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [warehouseData, techData] = await Promise.all([
        warehouseService.getWarehouseInfo(),
        userService.getTechnicians(),
      ]);
      setWarehouses(warehouseData.warehouses);
      setTechnicians(techData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    {
      id: "transfer-requests",
      icon: ArrowLeftRight,
      label: "Transfer Requests",
    },
    { id: "inventory", icon: Package, label: "Inventory" },
    { id: "users", icon: Users, label: "Users" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "database", icon: Database, label: "Database" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const totalStock = warehouses.reduce((sum, wh) => {
    return (
      sum + (wh.stock?.reduce((s, stock) => s + (stock.quantity || 0), 0) || 0)
    );
  }, 0);

  const totalWarehouses = warehouses.length;
  const totalComponents = warehouses.reduce(
    (sum, wh) => sum + (wh.stock?.length || 0),
    0
  );
  const avgStockPerWarehouse =
    totalWarehouses > 0 ? totalStock / totalWarehouses : 0;

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="grid grid-cols-12 gap-6">
                {/* Main Content - 8 cols */}
                <div className="col-span-8 space-y-6">
                  {/* System Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Warehouse Overview
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Real-time inventory management
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">
                          Total Warehouses
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {totalWarehouses}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">
                          Total Components
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {totalComponents}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Warehouse List */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {warehouses.map((warehouse) => (
                        <div
                          key={warehouse.warehouseId}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {warehouse.location || "Warehouse"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {warehouse.stock?.length || 0} components
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {warehouse.stock?.reduce(
                                (sum, s) => sum + (s.quantity || 0),
                                0
                              ) || 0}
                            </p>
                            <p className="text-xs text-gray-500">units</p>
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
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">{totalStock}</span>
                    </div>
                    <p className="font-medium">Total Stock</p>
                    <p className="text-sm opacity-80 mt-1">All warehouses</p>
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
                        {avgStockPerWarehouse.toFixed(0)}
                      </span>
                    </div>
                    <p className="font-medium">Avg Stock/Warehouse</p>
                    <p className="text-sm opacity-80 mt-1">Per location</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">
                        {technicians.length}
                      </span>
                    </div>
                    <p className="font-medium">Active Technicians</p>
                    <p className="text-sm opacity-80 mt-1">System-wide</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border-2 border-yellow-200 p-6 rounded-2xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                      <p className="font-semibold text-gray-900">
                        System Status
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      All systems operational
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        );

      case "transfer-requests":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="bg-white rounded-2xl border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                    Stock Transfer Requests
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Review and manage stock transfer requests from service
                    centers
                  </p>
                </div>
                <div className="p-6">
                  <StockTransferRequestManager />
                </div>
              </div>
            </div>
          </div>
        );

      case "inventory":
        return (
          <PlaceholderContent
            icon={Package}
            title="Inventory Management"
            description="Manage warehouse inventory, track stock levels, and monitor component availability across all locations."
            action={{
              label: "Add New Component",
              onClick: () => console.log("Add component"),
            }}
          />
        );

      case "users":
        return (
          <PlaceholderContent
            icon={Users}
            title="User Management"
            description="Manage system users, roles, and permissions. Add new staff members and configure access controls."
            action={{
              label: "Add New User",
              onClick: () => console.log("Add user"),
            }}
          />
        );

      case "analytics":
        return (
          <PlaceholderContent
            icon={BarChart3}
            title="Analytics & Reports"
            description="View detailed analytics, generate reports, and gain insights into system performance and operations."
          />
        );

      case "database":
        return (
          <PlaceholderContent
            icon={Database}
            title="Database Management"
            description="Access database tools, run queries, manage backups, and monitor database health and performance."
          />
        );

      case "settings":
        return (
          <PlaceholderContent
            icon={SettingsIcon}
            title="System Settings"
            description="Configure system settings, preferences, and global parameters. Manage integrations and API keys."
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        navItems={navItems}
        brandIcon={FileText}
        brandName="EMV Staff"
        brandSubtitle="System Management"
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onSearch={(query) => setSearchQuery(query)}
          onNavigate={setActiveNav}
          searchPlaceholder="Search warehouses, users, or components..."
          showSearch={activeNav === "dashboard"}
          showNotifications={true}
          currentPage={
            activeNav === "dashboard"
              ? undefined
              : navItems.find((item) => item.id === activeNav)?.label
          }
          searchValue={searchQuery}
        />

        {renderContent()}
      </div>
    </div>
  );
}
