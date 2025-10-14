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
      const records = await processingRecordService.getAllRecords();

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
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              <div className="grid grid-cols-12 gap-6">
                {/* Main Content - 8 cols */}
                <div className="col-span-8 space-y-6">
                  {/* Task Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Today's Overview
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Your current workload and progress
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-900 mb-1">
                          Active Tasks
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {taskSummary.activeTasks}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm text-green-900 mb-1">
                          Completed Today
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {taskSummary.completedToday}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Task History */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Recent Tasks
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recentTasks.map((task, index) => (
                        <div
                          key={task.vehicleProcessingRecordId || index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <ClipboardList className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {task.vehicle?.vin || "Unknown Vehicle"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Status: {task.status || "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(task.checkInDate).toLocaleDateString()}
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
                    className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <ClipboardList className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">
                        {taskSummary.activeTasks}
                      </span>
                    </div>
                    <p className="font-medium">Active Tasks</p>
                    <p className="text-sm opacity-80 mt-1">Currently assigned</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircle className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">
                        {taskSummary.completedToday}
                      </span>
                    </div>
                    <p className="font-medium">Completed Today</p>
                    <p className="text-sm opacity-80 mt-1">Tasks finished</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Package className="w-8 h-8 opacity-80" />
                      <span className="text-3xl font-bold">
                        {taskSummary.partsUsed}
                      </span>
                    </div>
                    <p className="font-medium">Parts Used</p>
                    <p className="text-sm opacity-80 mt-1">This week</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border-2 border-blue-200 p-6 rounded-2xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      <p className="font-semibold text-gray-900">Efficiency</p>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {taskSummary.efficiency}%
                      </span>
                      <span className="text-sm text-gray-500 mb-1">
                        performance
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${taskSummary.efficiency}%` }}
                      ></div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        );

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
