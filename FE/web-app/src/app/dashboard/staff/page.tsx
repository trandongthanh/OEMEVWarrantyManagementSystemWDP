"use client";

import { useState, useEffect } from "react";
import {
  Home,
  CreditCard,
  Users,
  BarChart3,
  Clock,
  FileText,
  Car,
} from "lucide-react";
import { authService, customerService, Customer } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  NewClaimModal,
  PlaceholderContent,
  RegisterVehicleModal,
  DashboardOverview,
  VehicleManagement,
  CustomerSearchResults,
  CasesList,
} from "@/components/dashboard";
import { FloatingChatWidget } from "@/components/chat";

interface User {
  userId: string;
  roleName: string;
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

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = () => {
    authService.logout();
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResult(null);
      return;
    }

    const isEmail = query.includes("@");
    const isPhone = /^\d+$/.test(query);

    if (isEmail || isPhone) {
      setIsSearching(true);
      try {
        const result = await customerService.searchCustomer(
          isEmail ? { email: query } : { phone: query }
        );
        setSearchResult(result);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResult(null);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const staffNavItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "vehicles", icon: Car, label: "Vehicle Management" },
    { id: "cases", icon: Users, label: "Cases" },
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
          />
        );

      case "vehicles":
        return (
          <VehicleManagement
            onRegisterVehicleClick={() => setShowRegisterVehicleModal(true)}
          />
        );

      case "cases":
        return <CasesList onViewDetails={(record) => console.log(record)} />;

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
          // Refresh data by reloading the dashboard
          setActiveNav("dashboard");
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
          // Switch to vehicles tab to show the registered vehicle
          setActiveNav("vehicles");
          // Reset VIN after successful registration
          setRegisterVehicleVin(undefined);
        }}
        initialVin={registerVehicleVin}
      />

      {/* Floating Chat Widget */}
      <FloatingChatWidget customerName="Customer Support" vin="Active Chat" />
    </>
  );
}
