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
  Database,
  Shield,
  Activity,
  Package,
  Menu,
  X,
} from "lucide-react";
import {
  authService,
  warehouseService,
  customerService,
  Warehouse,
  Customer,
} from "@/services";

interface User {
  userId: string;
  roleName: string;
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
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
      const warehouseData = await warehouseService.getWarehouseInfo();
      setWarehouses(warehouseData.warehouses);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const totalStockValue = warehouses.reduce(
    (total, warehouse) =>
      total +
      warehouse.stock.reduce(
        (sum, item) => sum + item.quantity * item.component.price,
        0
      ),
    0
  );

  const totalStockItems = warehouses.reduce(
    (total, warehouse) =>
      total + warehouse.stock.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const lowStockCount = warehouses.reduce(
    (count, warehouse) =>
      count + warehouse.stock.filter((item) => item.quantity < 10).length,
    0
  );

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
              <Shield className="w-5 h-5 text-[#2d2d2d]" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-semibold whitespace-nowrap"
                >
                  Admin
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
            { id: "inventory", icon: Database, label: "Inventory" },
            { id: "users", icon: Users, label: "Users" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
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
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {currentUser?.roleName?.charAt(0).toUpperCase() || "A"}
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
                    {currentUser?.userId || "Admin User"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentUser?.roleName || "System Administrator"}
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
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
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
            {/* Left Section - Available Funds & Recent Contacts */}
            <div className="col-span-8 space-y-6">
              {/* Available Funds Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-2xl p-6 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm text-gray-600">System Value</h3>
                    <p className="text-gray-400 text-xs">
                      Total inventory worth
                    </p>
                  </div>
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>VND</option>
                  </select>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 text-white">
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">
                      Available Funds
                    </p>
                    <p className="text-4xl font-bold">
                      $
                      {totalStockValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                      <Send className="w-4 h-4" />
                      <span className="text-sm font-medium">Send</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Request</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Recent Contacts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Warehouse Locations
                  </h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View all →
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Manage inventory across locations
                </p>

                <div className="flex space-x-3 mb-4">
                  {warehouses.slice(0, 5).map((warehouse) => (
                    <div
                      key={warehouse.warehouseId}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {warehouse.name.charAt(0)}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <Database className="w-4 h-4" />
                    <span className="text-sm">Add new</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <SettingsIcon className="w-4 h-4" />
                    <span className="text-sm">Manage</span>
                  </button>
                </div>

                <button className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center">
                  <span>Add or Manage widgets</span>
                </button>
              </motion.div>
            </div>

            {/* Right Section - Stats */}
            <div className="col-span-4 space-y-6">
              {/* Total Stock */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Total Stock</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Activity className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {totalStockItems.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="bg-green-100 px-2 py-0.5 rounded">
                    +8% vs prev year
                  </span>
                </p>

                <div className="mt-4 flex items-end space-x-1 h-20">
                  {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-yellow-400 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </motion.div>

              {/* Total Warehouses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Warehouses</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Database className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {warehouses.length}
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="bg-green-100 px-2 py-0.5 rounded">
                    +14% vs prev year
                  </span>
                </p>

                <div className="mt-4 flex items-end space-x-1 h-20">
                  {[50, 45, 60, 55, 70, 65, 75].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-300 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </motion.div>

              {/* Low Stock Alert */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Low Stock Alert
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-900">
                        Critical Items
                      </span>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {lowStockCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">🇺🇸</span>
                      </div>
                      <span className="text-sm text-gray-600">USD</span>
                    </div>
                    <span className="text-sm font-medium">
                      ${totalStockValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                  Generate Report
                </button>
              </motion.div>
            </div>

            {/* Bottom Section - Transactions Table */}
            <div className="col-span-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Inventory Transactions
                    </h3>
                    <p className="text-sm text-gray-500">
                      You can view your inventory history
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Search className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </button>
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
                      {warehouses.slice(0, 8).map((warehouse) => (
                        <tr
                          key={warehouse.warehouseId}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {warehouse.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {warehouse.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {warehouse.location}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                warehouse.stock.length > 5
                                  ? "bg-green-100 text-green-700"
                                  : warehouse.stock.length > 2
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              •{" "}
                              {warehouse.stock.length > 5
                                ? "Stocked"
                                : warehouse.stock.length > 2
                                ? "Medium"
                                : "Low"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              +$
                              {warehouse.stock
                                .reduce(
                                  (sum, item) =>
                                    sum + item.quantity * item.component.price,
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </td>
                        </tr>
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
