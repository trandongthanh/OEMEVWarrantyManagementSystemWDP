"use client";

import { useState, useEffect } from "react";
import {
  Home,
  ClipboardList,
  Package,
  Clock,
  FileText,
  Calendar,
} from "lucide-react";
import { authService } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import {
  Sidebar,
  DashboardHeader,
  TechnicianDashboardOverview,
  MyTasks,
  PartsInventory,
  WorkHistory,
} from "@/components/dashboard";
import { MySchedule } from "@/components/dashboard/techniciandashboard";

interface CurrentUser {
  userId: string;
  username?: string;
  name?: string;
  roleName: string;
  serviceCenterId?: string;
  companyId?: string;
}

export default function TechnicianDashboard() {
  // Protect this route - only allow technicians
  useRoleProtection(["service_center_technician"]);

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = authService.getUserInfo();
    console.log("📋 User Info from localStorage:", userInfo);

    if (userInfo) {
      setCurrentUser(userInfo);
      console.log("✅ Using stored user info:", {
        name: userInfo.name,
        username: userInfo.username,
        role: userInfo.roleName,
        userId: userInfo.userId,
      });
    } else {
      // Fallback to token-based user if userInfo not available
      const user = authService.getCurrentUser();
      console.log("⚠️ No stored user info, using token data:", user);
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "tasks", icon: ClipboardList, label: "My Tasks" },
    { id: "schedule", icon: Calendar, label: "My Schedule" },
    { id: "parts", icon: Package, label: "Parts" },
    { id: "history", icon: Clock, label: "Work History" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <TechnicianDashboardOverview />;

      case "tasks":
        return <MyTasks />;

      case "schedule":
        return <MySchedule />;

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
