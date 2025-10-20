"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Users,
  ClipboardList,
  BarChart3,
  Calendar,
  Settings as SettingsIcon,
  FileText,
  UserCheck,
} from "lucide-react";
import { authService, userService, Technician } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import {
  DashboardOverview,
  ManagerCasesList,
} from "@/components/dashboard/managerdashboard";
import { Sidebar, DashboardHeader } from "@/components/dashboard";
import { PlaceholderContent } from "@/components/dashboard/PlaceholderContent";

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
    { id: "assignments", icon: UserCheck, label: "Assignments" },
    { id: "team", icon: Users, label: "Team" },
    { id: "tasks", icon: ClipboardList, label: "Tasks" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "schedule", icon: Calendar, label: "Schedule" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <DashboardOverview technicians={technicians} />;

      case "assignments":
        return (
          <PlaceholderContent
            icon={ClipboardList}
            title="Assign Technicians"
            description="Assign technicians to various tasks and monitor their workload effectively."
          />
        );

      case "team":
        return (
          <PlaceholderContent
            icon={Users}
            title="Team Management"
            description="Manage your team members, view detailed profiles, track performance metrics, and assign responsibilities."
            action={{
              label: "Add Team Member",
              onClick: () => console.log("Add team member"),
            }}
          />
        );

      case "tasks":
        return <ManagerCasesList />;

      case "analytics":
        return (
          <PlaceholderContent
            icon={BarChart3}
            title="Analytics & Insights"
            description="View team performance metrics, analyze trends, and generate comprehensive reports for better decision making."
          />
        );

      case "schedule":
        return (
          <PlaceholderContent
            icon={Calendar}
            title="Schedule Management"
            description="Manage team schedules, approve leave requests, and coordinate work shifts for optimal coverage."
          />
        );

      case "settings":
        return (
          <PlaceholderContent
            icon={SettingsIcon}
            title="Manager Settings"
            description="Configure team preferences, notification settings, and customize your management dashboard."
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
          searchPlaceholder="Search team members, tasks, or schedules..."
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