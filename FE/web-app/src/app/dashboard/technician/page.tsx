"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Mail,
  Home,
  CreditCard,
  BarChart3,
  Clock,
  Send,
  TrendingUp,
  Settings as SettingsIcon,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  Menu,
  X,
  Package,
  Calendar,
} from "lucide-react";
import { authService, customerService, Customer } from "@/services";

interface User {
  userId: string;
  roleName: string;
}

interface Task {
  id: string;
  caseId: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

export default function TechnicianDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchResult, setSearchResult] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [tasks] = useState<Task[]>([
    {
      id: "TASK-001",
      caseId: "CASE-001",
      description: "Replace battery module",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date().toLocaleDateString(),
    },
    {
      id: "TASK-002",
      caseId: "CASE-002",
      description: "Diagnostic check",
      status: "PENDING",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 86400000).toLocaleDateString(),
    },
    {
      id: "TASK-003",
      caseId: "CASE-003",
      description: "Motor assembly repair",
      status: "COMPLETED",
      priority: "HIGH",
      dueDate: new Date(Date.now() - 86400000).toLocaleDateString(),
    },
  ]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalTasks = tasks.length;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResult(null);
      return;
    }

    const isEmail = query.includes("@");
    const isPhone = /^\d+$/.test(query);

    if (isEmail || isPhone) {
      setIsSearching(true);
      try {
        const result = await customerService.searchCustomer(
          isEmail ? { email: query } : { phone: query }
        );
        setSearchResult(result);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResult(null);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 240 }}
        className="bg-[#2d2d2d] text-white flex flex-col relative"
      >
        {/* Logo/Brand with Toggle */}
        <motion.div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#2d2d2d]" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-semibold whitespace-nowrap"
                >
                  Technician
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-[#3d3d3d] rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "dashboard", icon: Home, label: "Dashboard" },
            { id: "tasks", icon: ListTodo, label: "My Tasks" },
            { id: "schedule", icon: Calendar, label: "Schedule" },
            { id: "reports", icon: BarChart3, label: "Reports" },
            { id: "history", icon: Clock, label: "History" },
          ].map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center px-3" : "space-x-3 px-4"
              } py-3 rounded-lg transition-colors ${
                activeNav === item.id
                  ? "bg-[#3d3d3d] text-white"
                  : "text-gray-400 hover:bg-[#3d3d3d] hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>

        {/* Add Action Button */}
        <div className="px-4 pb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${
              sidebarCollapsed
                ? "justify-center px-3"
                : "justify-center space-x-2 px-4"
            } py-3 bg-white text-[#2d2d2d] rounded-lg hover:bg-gray-100 transition-colors font-medium`}
          >
            <Package className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm whitespace-nowrap"
                >
                  Add a section
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mx-4"></div>

        {/* Profile Section */}
        <div className="p-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : "space-x-3"
            } p-3 bg-[#3d3d3d] rounded-lg cursor-pointer`}
          >
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {currentUser?.roleName?.charAt(0).toUpperCase() || "T"}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-sm font-medium truncate">
                    {currentUser?.userId || "Tech User"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentUser?.roleName || "Technician"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && (
              <SettingsIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customer by email or phone..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  ⌘F
                </span>
                {isSearching && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                )}
                {!isSearching && searchResult && searchQuery && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {searchResult.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {searchResult.fullName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {searchResult.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {searchResult.phone}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {searchResult.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!isSearching &&
                  !searchResult &&
                  searchQuery &&
                  (searchQuery.includes("@") ||
                    (/^\d+$/.test(searchQuery) && searchQuery.length > 5)) && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">No customer found</p>
                    </div>
                  )}
              </div>
            </div>
            <div className="flex items-center space-x-4 ml-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section */}
            <div className="col-span-8 space-y-6">
              {/* My Tasks Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm text-gray-600">My Workload</h3>
                    <p className="text-gray-400 text-xs">
                      Active assigned tasks
                    </p>
                  </div>
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>

                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Total Tasks</p>
                    <p className="text-4xl font-bold">{totalTasks}</p>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span className="text-sm font-medium">Start</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Report</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Performance Stats
                  </h3>
                  <button className="text-sm text-orange-600 hover:text-orange-700">
                    View all →
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Your work efficiency
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    {
                      value: "95%",
                      label: "Completion Rate",
                      color: "from-green-400 to-emerald-500",
                    },
                    {
                      value: "4.8",
                      label: "Avg Rating",
                      color: "from-blue-400 to-cyan-500",
                    },
                    {
                      value: "2.5h",
                      label: "Avg Time",
                      color: "from-purple-400 to-pink-500",
                    },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg transition-all cursor-pointer`}
                    >
                      <span className="text-2xl font-bold mb-1">
                        {stat.value}
                      </span>
                      <span className="text-xs font-medium text-center">
                        {stat.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    <span className="text-sm">Tools</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right Section - Stats */}
            <div className="col-span-4 space-y-6">
              {/* In Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">In Progress</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Wrench className="w-4 h-4 text-orange-600" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {inProgressCount}
                </p>
                <p className="text-xs text-orange-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="bg-orange-100 px-2 py-0.5 rounded">
                    Active now
                  </span>
                </p>

                <div className="mt-4 flex items-end space-x-1 h-20">
                  {[60, 45, 70, 55, 80, 65, 75].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-1 bg-gradient-to-t from-orange-400 to-red-500 rounded-t"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Pending */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Pending</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {pendingCount}
                </p>
                <p className="text-xs text-yellow-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="bg-yellow-100 px-2 py-0.5 rounded">
                    Awaiting
                  </span>
                </p>

                <div className="mt-4 flex items-end space-x-1 h-20">
                  {[40, 55, 35, 60, 45, 65, 50].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-1 bg-yellow-300 rounded-t"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Task Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Task Status
                </h3>
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-900">In Progress</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">
                      {inProgressCount}
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-900">Pending</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">
                      {pendingCount}
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-900">Completed</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {completedCount}
                    </span>
                  </motion.div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg text-sm font-medium"
                >
                  View All Tasks
                </motion.button>
              </motion.div>
            </div>

            {/* Bottom Section - Tasks Table */}
            <div className="col-span-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      My Tasks
                    </h3>
                    <p className="text-sm text-gray-500">
                      Track and manage your assigned tasks
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Search className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 pb-3">
                          Task ID
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3">
                          Description
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3">
                          Status
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 pb-3">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <motion.tr
                          key={task.id}
                          whileHover={{ backgroundColor: "#f9fafb", x: 5 }}
                          className="border-b border-gray-100 cursor-pointer"
                        >
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                {task.id.split("-")[1]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {task.id}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {task.dueDate}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {task.description}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                task.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              • {task.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className={`text-sm font-medium ${
                                task.priority === "HIGH"
                                  ? "text-red-600"
                                  : task.priority === "MEDIUM"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button className="w-full mt-6 py-2 text-sm text-gray-600 hover:text-gray-900">
                  View all tasks
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
