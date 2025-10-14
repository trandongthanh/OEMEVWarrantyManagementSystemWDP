"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Mail,
  Home,
  CreditCard,
  Users,
  BarChart3,
  Clock,
  Send,
  TrendingUp,
  Settings as SettingsIcon,
  FileText,
  Menu,
  X,
} from "lucide-react";
import {
  authService,
  userService,
  customerService,
  Technician,
  Customer,
} from "@/services";

interface User {
  userId: string;
  roleName: string;
}

export default function StaffDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchResult, setSearchResult] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const workingCount = technicians.filter(
    (t) => t.workSchedule?.status === "WORKING"
  ).length;
  const dayOffCount = technicians.filter(
    (t) => t.workSchedule?.status === "DAY_OFF"
  ).length;
  const onLeaveCount = technicians.filter(
    (t) =>
      t.workSchedule?.status === "LEAVE_APPROVED" ||
      t.workSchedule?.status === "LEAVE_REQUESTED"
  ).length;

  const totalWorkload = technicians.reduce(
    (sum, t) => sum + (t.activeTaskCount || 0),
    0
  );
  const avgWorkload =
    technicians.length > 0 ? totalWorkload / technicians.length : 0;

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
              <FileText className="w-5 h-5 text-[#2d2d2d]" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-semibold whitespace-nowrap"
                >
                  Staff
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
            { id: "cases", icon: Users, label: "cases" },
            { id: "receipts", icon: CreditCard, label: "Receipts" },
            { id: "manage", icon: BarChart3, label: "Manage" },
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
                    className="text-sm whitespace-nowrap"
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
            <Users className="w-5 h-5 flex-shrink-0" />
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
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {currentUser?.roleName?.charAt(0).toUpperCase() || "M"}
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
                    {currentUser?.userId || "Staff"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentUser?.roleName?.replace(/_/g, " ") || "Staff"}
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
                  className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
                  ⌘ F
                </span>
                {isSearching && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                )}
                {!isSearching && searchResult && searchQuery && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
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
            <div className="flex items-center space-x-2 ml-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              {/* Team Performance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Team Performance
                    </h3>
                    <p className="text-xs text-gray-500">
                      Average workload efficiency
                    </p>
                  </div>
                  <select className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>VND</option>
                  </select>
                </div>

                <div className="bg-[#2d2d2d] rounded-xl p-6 text-white">
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">
                      Average Workload
                    </p>
                    <p className="text-4xl font-bold">
                      {avgWorkload.toFixed(1)}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-[#2d2d2d] rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span className="text-sm font-medium">Send</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#3d3d3d] text-white rounded-lg hover:bg-[#4d4d4d] transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Request</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Team Members */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Recent Contacts
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Send or Request from your contact list
                    </p>
                  </div>
                  <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    <span>→</span>
                  </button>
                </div>

                <div className="flex gap-3 mb-4">
                  {technicians.slice(0, 5).map((tech) => (
                    <motion.div
                      key={tech.userId}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
                      title={tech.userId}
                    >
                      {tech.userId.charAt(0).toUpperCase()}
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2d2d2d] text-white rounded-lg hover:bg-[#3d3d3d] transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Add new</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Manage</span>
                  </motion.button>
                </div>

                <button className="w-full mt-4 text-xs text-gray-500 hover:text-gray-700">
                  Add or Manage widgets
                </button>
              </motion.div>
            </div>

            {/* Right Section - Stats */}
            <div className="col-span-4 space-y-6">
              {/* Working Now */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs text-gray-600">Total Expenses</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  ${workingCount * 1000}
                </p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="bg-red-50 px-2 py-0.5 rounded">
                    -{workingCount}% vs prev year
                  </span>
                </p>

                <div className="mt-4 flex items-end gap-1 h-16">
                  {[60, 75, 50, 80, 65, 90, 70].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-yellow-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Income */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs text-gray-600">Total Income</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  ${(workingCount + onLeaveCount) * 1500}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="bg-green-50 px-2 py-0.5 rounded">
                    +{dayOffCount}% vs prev year
                  </span>
                </p>

                <div className="mt-4 flex items-end gap-1 h-16">
                  {[30, 40, 25, 35, 45, 30, 40].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-300 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Exchange */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Exchange
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                        🇺🇸
                      </div>
                      <span className="text-sm text-gray-600">USD</span>
                    </div>
                    <span className="text-sm font-medium">
                      {workingCount}00
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                        🇪🇺
                      </div>
                      <span className="text-sm text-gray-600">EUR</span>
                    </div>
                    <span className="text-sm font-medium">
                      {onLeaveCount}6.48
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  1 USD = {avgWorkload.toFixed(2)} Euro
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-[#2d2d2d] text-white rounded-lg hover:bg-[#3d3d3d] transition-colors text-sm font-medium"
                >
                  Exchange
                </motion.button>
              </motion.div>
            </div>

            {/* Bottom Section - Transactions Table */}
            <div className="col-span-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Transactions
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      You can view your transaction history
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Search className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                          Name
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3">
                          Date
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3">
                          Status
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 pb-3">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {technicians.slice(0, 8).map((tech) => (
                        <motion.tr
                          key={tech.userId}
                          whileHover={{ backgroundColor: "#fafafa" }}
                          className="border-b border-gray-100 cursor-pointer"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                {tech.userId.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {tech.userId}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {tech.userId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {tech.workSchedule?.workDate
                              ? new Date(
                                  tech.workSchedule.workDate
                                ).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                tech.workSchedule?.status === "WORKING"
                                  ? "bg-green-50 text-green-700"
                                  : tech.workSchedule?.status === "DAY_OFF"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-orange-50 text-orange-700"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {tech.workSchedule?.status === "WORKING"
                                ? "Received"
                                : tech.workSchedule?.status === "DAY_OFF"
                                ? "Sent"
                                : "Payment"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className={`text-sm font-medium ${
                                tech.workSchedule?.status === "WORKING"
                                  ? "text-green-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {tech.workSchedule?.status === "WORKING"
                                ? "+"
                                : "-"}
                              ${(tech.activeTaskCount || 1) * 200}.00
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button className="w-full mt-6 py-2 text-sm text-gray-600 hover:text-gray-900">
                  View all transactions
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
