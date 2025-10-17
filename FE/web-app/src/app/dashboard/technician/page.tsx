"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  ClipboardList,
  Package,
  Clock,
  CheckCircle,
  Settings as SettingsIcon,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { authService, processingRecordService } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  PlaceholderContent,
} from "@/components/dashboard";
import { TechnicianDashboard } from "@/components/techniciandashboard";

interface CurrentUser {
  userId: string;
  roleName: string;
}

interface TaskSummary {
  activeTasks: number;
  completedToday: number;
  partsUsed: number;
  efficiency: number;
}

export default function TechnicianDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({
    activeTasks: 0,
    completedToday: 0,
    partsUsed: 0,
    efficiency: 0,
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await processingRecordService.getAllRecords({});

      const records = response.data?.records || [];

      // Mock data for demonstration
      setTaskSummary({
        activeTasks: records.length,
        completedToday: Math.floor(records.length * 0.3),
        partsUsed: records.length * 2,
        efficiency: 85,
      });
      setRecentTasks(records.slice(0, 10));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "tasks", icon: ClipboardList, label: "My Tasks" },
    { id: "parts", icon: Package, label: "Parts" },
    { id: "history", icon: Clock, label: "History" },
    { id: "completed", icon: CheckCircle, label: "Completed" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <TechnicianDashboard />;

      case "tasks":
        return (
          <PlaceholderContent
            icon={ClipboardList}
            title="My Tasks"
            description="View and manage all your assigned tasks. Update progress, add notes, and mark tasks as complete."
          />
        );

      case "parts":
        return (
          <PlaceholderContent
            icon={Package}
            title="Parts Inventory"
            description="Browse available parts, check stock levels, and request components needed for repairs."
            action={{
              label: "Request Parts",
              onClick: () => console.log("Request parts"),
            }}
          />
        );

      case "history":
        return (
          <PlaceholderContent
            icon={Clock}
            title="Work History"
            description="Review your complete work history, past repairs, and service records for reference and learning."
          />
        );

      case "completed":
        return (
          <PlaceholderContent
            icon={CheckCircle}
            title="Completed Tasks"
            description="View all your completed tasks, success metrics, and customer feedback for quality assurance."
          />
        );

      case "settings":
        return (
          <PlaceholderContent
            icon={SettingsIcon}
            title="Technician Settings"
            description="Manage your profile, notification preferences, and customize your workspace settings."
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
        brandName="Technician"
        brandSubtitle="Workspace"
        currentUser={currentUser}
        showAddButton={true}
        addButtonLabel="New Task"
        onAddClick={() => console.log("New task")}
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
