"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  ClipboardList,
  BarChart3,
  Calendar,
  Settings as SettingsIcon,
  FileText,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import { authService, userService, Technician } from "@/services";
import {
  Sidebar,
  DashboardHeader,
  PlaceholderContent,
} from "@/components/dashboard";
import { ManagerDashboard as ManagerDashboardContent } from "@/components/managerdashboard";

interface CurrentUser {
  userId: string;
  roleName: string;
}

export default function ManagerDashboard() {
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

  const workingCount = technicians.filter(
    (t) => t.workSchedule?.[0]?.status === "WORKING"
  ).length;
  const dayOffCount = technicians.filter(
    (t) => t.workSchedule?.[0]?.status === "DAY_OFF"
  ).length;
  const onLeaveCount = technicians.filter(
    (t) =>
      t.workSchedule?.[0]?.status === "LEAVE_APPROVED" ||
      t.workSchedule?.[0]?.status === "LEAVE_REQUESTED"
  ).length;

  const totalWorkload = technicians.reduce(
    (sum, t) => sum + (t.activeTaskCount || 0),
    0
  );
  const avgWorkload =
    technicians.length > 0 ? totalWorkload / technicians.length : 0;

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="grid grid-cols-12 gap-6">
                {/* Main Content - 8 cols */}
                <div className="col-span-8 space-y-6">
                  {/* Team Performance */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Team Performance
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Current workforce status
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-green-900">
                            Working
                          </p>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                          {workingCount}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-5 h-5 text-gray-600" />
                          <p className="text-sm font-medium text-gray-900">
                            Day Off
                          </p>
                        </div>
                        <p className="text-3xl font-bold text-gray-600">
                          {dayOffCount}
                        </p>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <p className="text-sm font-medium text-yellow-900">
                            On Leave
                          </p>
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">
                          {onLeaveCount}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Technician Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Technician Overview
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {technicians.map((tech) => (
                        <div
                          key={tech.userId}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {tech.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {tech.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {tech.workSchedule[0]?.status
                                  ?.replace(/_/g, " ")
                                  .toLowerCase() || "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {tech.activeTaskCount || 0}
                            </p>
                            <p className="text-xs text-gray-500">
                              active tasks
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Stats Sidebar - 4 cols */}
                <div className="col-span-4 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">
                        {technicians.length}
                      </span>
                    </div>
                    <p className="font-medium">Total Team</p>
                    <p className="text-sm opacity-80 mt-1">All technicians</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">
                        {avgWorkload.toFixed(1)}
                      </span>
                    </div>
                    <p className="font-medium">Avg Workload</p>
                    <p className="text-sm opacity-80 mt-1">Tasks per tech</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">
                        {totalWorkload}
                      </span>
                    </div>
                    <p className="font-medium">Active Tasks</p>
                    <p className="text-sm opacity-80 mt-1">
                      Currently assigned
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border-2 border-green-200 p-6 rounded-2xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <p className="font-semibold text-gray-900">Team Status</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {workingCount} technicians actively working
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        );

      case "assignments":
        return (
          <div className="flex-1 overflow-auto">
            <ManagerDashboardContent />
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

      case "tasks":
        return (
          <PlaceholderContent
            icon={ClipboardList}
            title="Task Management"
            description="Assign tasks, monitor progress, and track completion status across all team members and projects."
            action={{
              label: "Create New Task",
              onClick: () => console.log("Create task"),
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
