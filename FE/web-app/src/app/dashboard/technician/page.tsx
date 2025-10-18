"use client";

import { useState, useEffect } from "react";
import { Home, ClipboardList, Package, Clock, FileText } from "lucide-react";
import { authService } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  TechnicianDashboardOverview,
  MyTasks,
  PartsInventory,
  WorkHistory,
} from "@/components/dashboard";

interface CurrentUser {
  userId: string;
  roleName: string;
}

export default function TechnicianDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "tasks", icon: ClipboardList, label: "My Tasks" },
    { id: "parts", icon: Package, label: "Parts" },
    { id: "history", icon: Clock, label: "Work History" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <TechnicianDashboardOverview />;

      case "tasks":
        return <MyTasks />;

      case "parts":
        return <PartsInventory />;

      case "history":
        return <WorkHistory />;

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
        brandName="Technician"
        brandSubtitle="Workspace"
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onSearch={(query) => setSearchQuery(query)}
          searchPlaceholder="Search tasks, vehicles, or parts..."
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
