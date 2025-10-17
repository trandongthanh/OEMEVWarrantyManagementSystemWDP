"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  BarChart3,
  Calendar,
  Settings as SettingsIcon,
  UserCheck,
  ListTodo,
  Briefcase,
} from "lucide-react";
import { authService, userService, Technician } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  PlaceholderContent,
  ManagerDashboardOverview,
  ManagerCasesList,
  AssignmentsManagement,
  TasksView,
} from "@/components/dashboard";

interface CurrentUser {
  userId: string;
  roleName: string;
}

export default function ManagerDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("cases"); // For assignments section
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedRecordVin, setSelectedRecordVin] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData();

    // Handle deep linking
    const tab = searchParams.get("tab");
    const recordVin = searchParams.get("record");

    if (tab === "assignments") {
      setActiveNav("assignments");
      setActiveTab("assignments");
      if (recordVin) {
        setSelectedRecordVin(recordVin);
      }
    } else if (tab === "tasks") {
      setActiveNav("assignments");
      setActiveTab("tasks");
    }
  }, [searchParams]);

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

  const handleNavigateToAssignments = (recordVin: string) => {
    setSelectedRecordVin(recordVin);
    setActiveNav("assignments");
    setActiveTab("assignments");
    router.push(`/dashboard/manager?tab=assignments&record=${recordVin}`);
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "assignments", icon: UserCheck, label: "Assignments" },
    { id: "team", icon: Users, label: "Team" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "schedule", icon: Calendar, label: "Schedule" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <ManagerDashboardOverview technicians={technicians} />;

      case "assignments":
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-8 pt-6">
              <div className="flex gap-6">
                <button
                  onClick={() => {
                    setActiveTab("cases");
                    setSelectedRecordVin(undefined);
                    router.push("/dashboard/manager");
                  }}
                  className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === "cases"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  Cases
                </button>
                <button
                  onClick={() => {
                    setActiveTab("assignments");
                    router.push("/dashboard/manager?tab=assignments");
                  }}
                  className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === "assignments"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  Assignments
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tasks");
                    setSelectedRecordVin(undefined);
                    router.push("/dashboard/manager?tab=tasks");
                  }}
                  className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === "tasks"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <ListTodo className="w-5 h-5" />
                  Tasks
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === "cases" && (
                <ManagerCasesList
                  onNavigateToAssignments={handleNavigateToAssignments}
                />
              )}
              {activeTab === "assignments" && (
                <AssignmentsManagement selectedRecordId={selectedRecordVin} />
              )}
              {activeTab === "tasks" && <TasksView />}
            </div>
          </div>
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
        brandIcon={Briefcase}
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
