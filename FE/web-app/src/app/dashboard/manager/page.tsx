"use client";

import { useState, useEffect } from "react";
import {
  Home,
  ClipboardList,
  FileText,
  UserCog,
  CheckSquare,
  Calendar,
  Package,
  Layers,
  Warehouse,
} from "lucide-react";
import { authService, userService, Technician } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import {
  Sidebar,
  DashboardHeader,
  ManagerDashboardOverview,
  ManagerCasesList,
  CustomerManagement,
  CaseLineOperations,
  ScheduleManagement,
  StockTransferRequestList,
  AllCaseLinesList,
  WarehouseOverview,
} from "@/components/dashboard";

interface CurrentUser {
  userId: string;
  roleName: string;
}

export default function ManagerDashboard() {
  // Protect this route - only allow managers
  useRoleProtection(["service_center_manager"]);

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const techData = await userService.getTechnicians();
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
    { id: "customers", icon: UserCog, label: "Customers" },
    { id: "caselines", icon: CheckSquare, label: "Case Lines" },
    { id: "all-caselines", icon: Layers, label: "All Case Lines" },
    { id: "tasks", icon: ClipboardList, label: "Task Assignment" },
    { id: "schedules", icon: Calendar, label: "Schedules" },
    { id: "warehouse", icon: Warehouse, label: "Warehouse Stock" },
    { id: "transfers", icon: Package, label: "Stock Transfers" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <ManagerDashboardOverview technicians={technicians} />;

      case "customers":
        return <CustomerManagement />;

      case "caselines":
        return <CaseLineOperations />;

      case "all-caselines":
        return <AllCaseLinesList />;

      case "tasks":
        return <ManagerCasesList />;

      case "schedules":
        return <ScheduleManagement />;

      case "warehouse":
        return <WarehouseOverview />;

      case "transfers":
        return (
          <StockTransferRequestList
            userRole="service_center_manager"
            onRequestCreated={() => {
              // Refresh transfers list
            }}
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
        brandName="Manager"
        brandSubtitle="Team Management"
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onSearch={(query) => setSearchQuery(query)}
          searchPlaceholder={
            activeNav === "customers"
              ? "Search customers by name, email, or phone..."
              : "Search..."
          }
          showSearch={activeNav === "customers"}
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
