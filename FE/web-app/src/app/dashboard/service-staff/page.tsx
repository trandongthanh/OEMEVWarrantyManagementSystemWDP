"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/dashboardComponents/DashboardHeader";
import StatsCards from "@/components/dashboardComponents/StatsCards";
import ActiveRepairs from "@/components/dashboardComponents/ActiveRepairs";
import ServiceCampaigns from "@/components/dashboardComponents/ServiceCampaigns";
import DashboardSwitch from "@/components/dashboardComponents/DashboardSwitch";
import WarrantyClaims from "@/components/dashboardComponents/WarrantyClaim";
import VehicalManagement from "@/components/dashboardComponents/VehicalManagement";
import NewClaimModal from "@/components/dashboardComponents/NewClaimModal";
import Beams from "@/components/Beams";
import FloatingActionButton from "@/components/dashboardComponents/FloatingActionButton";
import {
  RefreshCw,
  Bell,
  Search,
  Filter,
  FileText,
  Wrench,
  BarChart3,
  CheckCircle,
  Car,
  Calendar,
} from "lucide-react";

export default function Page() {
  const [tab, setTab] = useState<
    "warranty" | "vehicles" | "repairs" | "campaigns"
  >("warranty");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);

  // Simulate loading when changing tabs
  const handleTabChange = (newTab: typeof tab) => {
    if (newTab !== tab) {
      setIsLoading(true);
      setTimeout(() => {
        setTab(newTab);
        setIsLoading(false);
      }, 300);
    }
  };

  // Handle refresh action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Content component mapping for animations
  const getTabContent = () => {
    switch (tab) {
      case "warranty":
        return <WarrantyClaims />;
      case "vehicles":
        return <VehicalManagement />;
      case "repairs":
        return <ActiveRepairs />;
      case "campaigns":
        return <ServiceCampaigns />;
      default:
        return <WarrantyClaims />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-gray-100 overflow-hidden">
      {/* Original Beams Background - Full Screen */}
      <div className="absolute inset-0 z-0">
        <Beams
          beamWidth={2}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      {/* Enhanced overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/20 pointer-events-none z-10" />

      {/* Enhanced Top Navigation Bar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl"
      >
        <div className="max-w-8xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.h1
                className="text-xl font-bold text-white"
                whileHover={{ scale: 1.02 }}
              >
                EV Warranty Dashboard
              </motion.h1>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">System Active</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200 w-64"
                />
              </div>

              {/* Refresh Button */}
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-300 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 relative"
                >
                  <Bell className="w-4 h-4 text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </motion.button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 z-50"
                    >
                      <h3 className="text-sm font-semibold text-white mb-3">
                        Recent Notifications
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="text-sm text-white">
                            New warranty claim submitted
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            2 minutes ago
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="text-sm text-white">
                            Service reminder due
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            1 hour ago
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="text-sm text-white">
                            System maintenance scheduled
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            3 hours ago
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <Filter className="w-4 h-4 text-gray-300" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-20 max-w-8xl mx-auto w-full">
        <div className="grid grid-cols-12 gap-4 lg:gap-6 h-full">
          {/* Left Column - Main Content */}
          <div className="col-span-12 lg:col-span-9 space-y-4 lg:space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <DashboardHeader
                onNewClaimClick={() => setShowNewClaimModal(true)}
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <StatsCards />
            </motion.div>

            {/* Content Area with enhanced loading states */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white/5 to-black/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 min-h-[400px] relative overflow-hidden"
            >
              {/* Loading Overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white">Loading...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab Content with Animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {getTabContent()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column - Enhanced Quick Actions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:block col-span-3 space-y-4"
          >
            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-white/8 to-black/15 backdrop-blur-xl border border-white/15 rounded-2xl p-5 hover:border-white/25 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Quick Actions
                </h3>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 rounded-xl text-left transition-all duration-200 hover:shadow-lg border border-blue-400/30 hover:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-blue-200">
                        Process Claims
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-blue-300">
                        24 pending
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 rounded-xl text-left transition-all duration-200 hover:shadow-lg border border-purple-400/30 hover:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-purple-200">
                        Schedule Service
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-purple-300">
                        Quick booking
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <Wrench className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 rounded-xl text-left transition-all duration-200 hover:shadow-lg border border-emerald-400/30 hover:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-emerald-200">
                        Generate Report
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-emerald-300">
                        Analytics ready
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-gradient-to-br from-white/8 to-black/15 backdrop-blur-xl border border-white/15 rounded-2xl p-5 hover:border-white/25 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Recent Activity
                </h3>
                <motion.button
                  whileHover={{ rotate: 180 }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white group-hover:text-green-200">
                      Claim #4856 approved
                    </div>
                    <div className="text-xs text-gray-400">2 min ago</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white group-hover:text-blue-200">
                      New vehicle registered
                    </div>
                    <div className="text-xs text-gray-400">5 min ago</div>
                  </div>
                  <Car className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white group-hover:text-amber-200">
                      Service completed
                    </div>
                    <div className="text-xs text-gray-400">12 min ago</div>
                  </div>
                  <Wrench className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white group-hover:text-purple-200">
                      Maintenance scheduled
                    </div>
                    <div className="text-xs text-gray-400">1 hour ago</div>
                  </div>
                  <Calendar className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>

              {/* View All Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white border-t border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none"
              >
                View all activity →
              </motion.button>
            </div>

            {/* System Status Mini Panel */}
            <div className="bg-gradient-to-br from-white/8 to-black/15 backdrop-blur-xl border border-white/15 rounded-2xl p-5 hover:border-white/25 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">Database</span>
                  </div>
                  <span className="text-xs text-green-400 font-medium">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">API Services</span>
                  </div>
                  <span className="text-xs text-green-400 font-medium">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">Background Jobs</span>
                  </div>
                  <span className="text-xs text-amber-400 font-medium">
                    Running
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Enhanced Mobile-First Bottom Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <DashboardSwitch tab={tab} setTab={handleTabChange} />
      </motion.div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Click outside to close notifications */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20"
            onClick={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>

      {/* New Claim Modal */}
      <NewClaimModal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
      />
    </div>
  );
}
