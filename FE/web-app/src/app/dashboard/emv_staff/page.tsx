"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Package,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Database,
  FileText,
  ArrowLeftRight,
} from "lucide-react";
import { authService, warehouseService, Warehouse } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  PlaceholderContent,
} from "@/components/dashboard";
import StockTransferRequestManager from "@/components/dashboard/companydashboard/StockTransferRequestManager";
import CompanyDashboardOverview from "@/components/dashboard/companydashboard/CompanyDashboardOverview";
import { useRoleProtection } from "@/hooks/useRoleProtection";

interface CurrentUser {
  userId: string;
  roleName: string;
}

export default function EMVStaffDashboard() {
  // ✅ Protect route - only EMV Staff can access
  useRoleProtection(["emv_staff"]);

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const warehouseData = await warehouseService.getWarehouseInfo();
      setWarehouses(warehouseData.warehouses);
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
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <CompanyDashboardOverview />
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
