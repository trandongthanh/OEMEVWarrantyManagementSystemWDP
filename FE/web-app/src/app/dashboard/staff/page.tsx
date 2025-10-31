"use client";

import { useState, useEffect } from "react";
import {
  Home,
  CreditCard,
  Users,
  BarChart3,
  Clock,
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
  PlaceholderContent,
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
  const [warehouseId, setWarehouseId] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = () => {
    authService.logout();
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchWarehouse(user);
  }, []);

  const fetchWarehouse = async (user: User | null) => {
    try {
      if (user?.serviceCenterId) {
        const { warehouseService } = await import(
          "@/services/warehouseService"
        );
        const { warehouses } = await warehouseService.getWarehouseInfo();
        const warehouse = warehouses.find(
          (w) => w.serviceCenterId === user.serviceCenterId
        );
        if (warehouse) {
          setWarehouseId(warehouse.warehouseId);
        }
      }
    } catch (error) {
      console.error("Error fetching warehouse:", error);
    }
  };

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
    { id: "receipts", icon: CreditCard, label: "Receipts" },
    { id: "manage", icon: BarChart3, label: "Manage" },
    { id: "history", icon: Clock, label: "History" },
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

      case "receipts":
        return (
          <PlaceholderContent
            icon={CreditCard}
            title="Receipts & Transactions"
            description="View all payment receipts, invoices, and financial transactions related to warranty claims and services."
          />
        );

      case "manage":
        return (
          <PlaceholderContent
            icon={BarChart3}
            title="Management Dashboard"
            description="Access advanced management tools, analytics, and reports. Monitor service center performance and efficiency."
          />
        );

      case "history":
        return (
          <PlaceholderContent
            icon={Clock}
            title="Service History"
            description="Browse complete history of all services, repairs, and warranty claims. Filter and export data as needed."
          />
        );

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
