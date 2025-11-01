"use client";

import { useState, useEffect } from "react";
import { Building2, Boxes, ArrowLeftRight, Settings } from "lucide-react";
import { authService } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import { Sidebar, DashboardHeader } from "@/components/dashboard";
import { InventoryDashboard } from "@/components/inventory";
import AllocateComponentModal from "@/components/dashboard/partscoordinatordashboard/AllocationModal";
import TransferComponentModal from "@/components/dashboard/partscoordinatordashboard/TransferModal";
import CompanyDashboardOverview from "@/components/dashboard/companydashboard/CompanyDashboardOverview";
import StockTransferRequestManager from "@/components/dashboard/companydashboard/StockTransferRequestManager";

interface CurrentUser {
  userId: string;
  username?: string;
  name?: string;
  roleName: string;
  serviceCenterId?: string;
  companyId?: string;
}

export default function CompanyDashboard() {
  // ✅ Protect route - only company coordinators
  useRoleProtection(["parts_coordinator_company"]);

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

  const navItems = [
    { id: "dashboard", icon: Building2, label: "Dashboard" },
    { id: "inventory", icon: Boxes, label: "Inventory" },
    {
      id: "transfer-requests",
      icon: ArrowLeftRight,
      label: "Transfer Requests",
    },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <CompanyDashboardOverview />;

      case "inventory":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
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
                    Manage incoming stock transfer requests from service centers
                  </p>
                </div>
                <div className="p-6">
                  <StockTransferRequestManager />
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Settings
                </h2>
                <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
              </div>
            </div>
          </div>
        );

      default:
        return <CompanyDashboardOverview />;
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
        brandIcon={Building2}
        brandName="Company"
        brandSubtitle="Coordinator"
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onSearch={setSearchQuery}
          onNavigate={setActiveNav}
          searchPlaceholder="Search..."
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
