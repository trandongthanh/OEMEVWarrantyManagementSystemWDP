"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Package,
  Clock,
  CheckCircle,
  Settings as SettingsIcon,
  Wrench,
  ListTodo,
} from "lucide-react";
import { authService } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  PlaceholderContent,
  TechnicianDashboardOverview,
  MyTasks,
  ReportSubmission,
} from "@/components/dashboard";

interface CurrentUser {
  userId: string;
  roleName: string;
}

// Task type definition (matches MyTasks component)
interface Task {
  taskId: string;
  guaranteeCaseId: string;
  taskType: "DIAGNOSIS" | "REPAIR";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  technicianId: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  guaranteeCase?: {
    guaranteeCaseId: string;
    contentGuarantee: string;
    status: string;
    vin: string;
    vehicle?: {
      licensePlate: string;
      model?: string | { name: string };
    };
  };
}

export default function TechnicianDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const handleSubmitReport = (task: Task) => {
    setSelectedTask(task);
    setShowReportModal(true);
  };

  const handleOpenReportModal = () => {
    setSelectedTask(null); // No specific task for UI testing
    setShowReportModal(true);
  };

  const handleReportSuccess = () => {
    setShowReportModal(false);
    setSelectedTask(null);
    // Could trigger a refresh of tasks here
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "tasks", icon: ListTodo, label: "My Tasks" },
    { id: "parts", icon: Package, label: "Parts" },
    { id: "history", icon: Clock, label: "History" },
    { id: "completed", icon: CheckCircle, label: "Completed" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <TechnicianDashboardOverview
            onOpenReportModal={handleOpenReportModal}
          />
        );

      case "tasks":
        return <MyTasks onSubmitReport={handleSubmitReport} />;

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
        brandIcon={Wrench}
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

      {/* Report Submission Modal */}
      {showReportModal && (
        <ReportSubmission
          task={selectedTask}
          onClose={() => {
            setShowReportModal(false);
            setSelectedTask(null);
          }}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}
