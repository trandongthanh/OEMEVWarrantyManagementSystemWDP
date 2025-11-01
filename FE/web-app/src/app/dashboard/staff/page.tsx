"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Users,
  FileText,
  MessageCircle,
  Package,
  History as HistoryIcon,
  Truck,
} from "lucide-react";
import { authService, customerService, Customer } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  NewClaimModal,
  RegisterVehicleModal,
  DashboardOverview,
  CustomerSearchResults,
  CasesList,
  VehicleComponents,
  VehicleHistory,
} from "@/components/dashboard";
import { StaffChatDashboard } from "@/components/chat";
import { StockTransferRequestList } from "@/components/dashboard/managerdashboard";

interface User {
  userId: string;
  roleName: string;
  serviceCenterId?: string;
}

export default function StaffDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchResult, setSearchResult] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showRegisterVehicleModal, setShowRegisterVehicleModal] =
    useState(false);
  const [registerVehicleVin, setRegisterVehicleVin] = useState<
    string | undefined
  >(undefined);
  // Note: Staff role doesn't have warehouse access, so we don't fetch it
  const warehouseId = null;

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = () => {
    authService.logout();
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    // Note: service_center_staff role doesn't have warehouse access
    // Only managers and parts coordinators can access warehouse API
    // Stock transfers don't require warehouseId for staff role
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }

    // Basic validation - must be email or phone-like
    const isEmail = query.includes("@");
    const isPhone = /^\d+$/.test(query.replace(/[\s\-\+\(\)]/g, "")); // Allow spaces, dashes, plus, parentheses

    if (!isEmail && !isPhone) {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log(
        "🔍 Searching for customer:",
        isEmail ? { email: query } : { phone: query }
      );
      const result = await customerService.searchCustomer(
        isEmail ? { email: query } : { phone: query }
      );
      console.log("✅ Search result:", result);
      setSearchResult(result);
    } catch (error: unknown) {
      console.error("❌ Search error:", error);
      setSearchResult(null);
      // You could show a toast notification here for API errors
    } finally {
      setIsSearching(false);
    }
  };

  const staffNavItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "cases", icon: Users, label: "Cases" },
    { id: "chat-support", icon: MessageCircle, label: "Chat Support" },
    { id: "stock-transfers", icon: Truck, label: "Stock Transfers" },
    { id: "vehicle-components", icon: Package, label: "Vehicle Components" },
    { id: "vehicle-history", icon: HistoryIcon, label: "Vehicle History" },
  ];

  const renderSearchResults = () => {
    return (
      <CustomerSearchResults
        searchResult={searchResult}
        onNewClaimClick={() => setShowNewClaimModal(true)}
      />
    );
  };

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <DashboardOverview
            onNewClaimClick={() => setShowNewClaimModal(true)}
            onNavigate={setActiveNav}
            onRegisterVehicleClick={() => setShowRegisterVehicleModal(true)}
          />
        );

      case "cases":
        return <CasesList onViewDetails={(record) => console.log(record)} />;

      case "chat-support":
        return (
          <div className="flex-1 overflow-hidden p-6">
            <StaffChatDashboard serviceCenterId="default-service-center" />
          </div>
        );

      case "stock-transfers":
        return (
          <StockTransferRequestList
            userRole="service_center_staff"
            warehouseId={warehouseId || undefined}
            onRequestCreated={() => {}}
          />
        );

      case "vehicle-components":
        return <VehicleComponents />;

      case "vehicle-history":
        return <VehicleHistory />;

      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          navItems={staffNavItems}
          brandIcon={FileText}
          brandName="Staff"
          brandSubtitle="Dashboard"
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader
            onSearch={handleSearch}
            onNavigate={setActiveNav}
            searchPlaceholder="Search customer by email or phone..."
            showSearch={activeNav === "dashboard"}
            showNotifications={true}
            currentPage={
              activeNav === "dashboard"
                ? undefined
                : staffNavItems.find((item) => item.id === activeNav)?.label
            }
            searchValue={searchQuery}
            isSearching={isSearching}
            searchResults={renderSearchResults()}
          />

          {/* Content Area */}
          {renderContent()}
        </div>
      </div>

      {/* New Claim Modal */}
      <NewClaimModal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        onSuccess={() => {
          // Data refresh not needed for staff dashboard
        }}
        onRegisterOwner={(vin) => {
          setRegisterVehicleVin(vin);
          setShowRegisterVehicleModal(true);
        }}
      />

      {/* Register Vehicle Modal */}
      <RegisterVehicleModal
        isOpen={showRegisterVehicleModal}
        onClose={() => {
          setShowRegisterVehicleModal(false);
          setRegisterVehicleVin(undefined);
        }}
        onSuccess={() => {
          // Data refresh not needed for staff dashboard
          // Reset VIN after successful registration
          setRegisterVehicleVin(undefined);
        }}
        onCreateClaim={() => {
          setShowNewClaimModal(true);
        }}
        initialVin={registerVehicleVin}
      />
    </>
  );
}
