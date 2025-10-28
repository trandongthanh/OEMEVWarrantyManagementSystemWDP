"use client";

import { useState, useEffect } from "react";
import { Home, Package, RotateCcw, Clock } from "lucide-react";
import { authService } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import {
  Sidebar,
  DashboardHeader,
  PartsCoordinatorDashboardOverview,
  ComponentPickupList,
} from "@/components/dashboard";

interface CurrentUser {
  userId: string;
  username?: string;
  name?: string;
  roleName: string;
  serviceCenterId?: string;
  companyId?: string;
}

export default function PartsCoordinatorDashboard() {
  // Protect this route - only allow parts coordinators
  useRoleProtection([
    "parts_coordinator_service_center",
    "parts_coordinator_company",
  ]);

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const userInfo = authService.getUserInfo();
    if (userInfo) {
      setCurrentUser(userInfo);
    } else {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "pickups", icon: Package, label: "Component Pickups" },
    { id: "returns", icon: RotateCcw, label: "Returns" },
    { id: "history", icon: Clock, label: "History" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <PartsCoordinatorDashboardOverview />;
      case "pickups":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="bg-white rounded-2xl border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Reserved Components Ready for Pickup
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Components waiting to be picked up from warehouse
                  </p>
                </div>
                <div className="p-6">
                  <ComponentPickupList />
                </div>
              </div>
            </div>
          </div>
        );
      case "returns":
      case "history":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeNav === "returns" ? "Returns" : "History"}
                </h2>
                <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
              </div>
            </div>
          </div>
        );
      default:
        return <PartsCoordinatorDashboardOverview />;
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
        brandIcon={Package}
        brandName="Parts"
        brandSubtitle="Coordinator"
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onSearch={setSearchQuery}
          searchPlaceholder="Search components..."
          showSearch={false}
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
