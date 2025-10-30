"use client";

import { useState, useEffect } from "react";
import { Home, Package, RotateCcw, Clock, Settings, Boxes } from "lucide-react";
import { authService } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import {
  Sidebar,
  DashboardHeader,
  PartsCoordinatorDashboardOverview,
  ComponentPickupList,
  ComponentStatusManager,
} from "@/components/dashboard";
import Inventory from "@/components/dashboard/partscoordinatordashboard/Inventory";
import { InventoryDashboard } from "@/components/inventory";
import AllocateComponentModal from "@/components/dashboard/partscoordinatordashboard/AllocationModal";
import TransferComponentModal from "@/components/dashboard/partscoordinatordashboard/TransferModal";

interface CurrentUser {
  userId: string;
  username?: string;
  name?: string;
  roleName: string;
  serviceCenterId?: string;
  companyId?: string;
}

export default function PartsCoordinatorDashboard() {
  // ✅ Bảo vệ route — chỉ cho phép parts coordinator truy cập
  useRoleProtection([
    "parts_coordinator_service_center",
    "parts_coordinator_company",
  ]);

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

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

  // ✅ Thêm mục "Inventory" mới trong sidebar
  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "inventory", icon: Boxes, label: "Inventory" }, // 👈 mới thêm
    { id: "pickups", icon: Package, label: "Component Pickups" },
    { id: "status", icon: Settings, label: "Component Status" },
    { id: "returns", icon: RotateCcw, label: "Returns" },
    { id: "history", icon: Clock, label: "History" },
  ];

  // ✅ Xử lý hiển thị nội dung theo mục sidebar đang chọn
  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <PartsCoordinatorDashboardOverview />;

      case "inventory":
        // Role-based inventory view
        const isCompanyCoordinator =
          currentUser?.roleName === "parts_coordinator_company";

        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              {isCompanyCoordinator ? (
                // Company Coordinator: Warehouse-level summary view
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
                    <InventoryDashboard
                      onOpenAllocate={() => setShowAllocateModal(true)}
                      onOpenTransfer={() => setShowTransferModal(true)}
                    />
                  </div>

                  {/* Modals */}
                  <AllocateComponentModal
                    isOpen={showAllocateModal}
                    onClose={() => setShowAllocateModal(false)}
                  />
                  <TransferComponentModal
                    isOpen={showTransferModal}
                    onClose={() => setShowTransferModal(false)}
                  />
                </div>
              ) : (
                // Service Center Coordinator: Component-level detail view
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Boxes className="w-6 h-6 text-blue-600" />
                      Service Center Inventory
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Manage components for your service center
                    </p>
                  </div>
                  <Inventory />
                </div>
              )}
            </div>
          </div>
        );

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

      case "status":
        return <ComponentStatusManager />;

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
