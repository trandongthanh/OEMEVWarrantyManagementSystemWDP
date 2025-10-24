"use client";

import { useState, useEffect } from "react";
import {
  Home,
  ClipboardList,
  FileText,
  UserCog,
  CheckSquare,
} from "lucide-react";
import { authService, userService, Technician } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import {
  Sidebar,
  DashboardHeader,
  ManagerDashboardOverview,
  ManagerCasesList,
  CustomerManagement,
  CaseLineManagement,
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
    { id: "tasks", icon: ClipboardList, label: "Task Assignment" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <ManagerDashboardOverview technicians={technicians} />;

      case "customers":
        return <CustomerManagement />;

      case "caselines":
        return <CaseLineManagement />;

      case "tasks":
        return <ManagerCasesList />;

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
            activeNav === "dashboard"
              ? "Search team members, tasks, or schedules..."
              : activeNav === "customers"
              ? "Search customers by name, email, or phone..."
              : activeNav === "caselines"
              ? "Search case lines by case number or status..."
              : "Search..."
          }
          showSearch={
            activeNav === "dashboard" ||
            activeNav === "customers" ||
            activeNav === "caselines"
          }
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
