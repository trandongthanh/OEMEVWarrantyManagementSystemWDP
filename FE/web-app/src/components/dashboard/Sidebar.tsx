"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, Settings as SettingsIcon, LogOut } from "lucide-react";

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: string;
  onNavChange: (navId: string) => void;
  navItems: NavItem[];
  brandIcon: LucideIcon;
  brandName: string;
  brandSubtitle: string;
  currentUser: {
    userId: string;
    username?: string;
    name?: string;
    roleName: string;
  } | null;
  onLogout?: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  activeNav,
  onNavChange,
  navItems,
  brandIcon: BrandIcon,
  brandName,
  brandSubtitle,
  currentUser,
  onLogout,
}: SidebarProps) {
  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="bg-[#2d2d2d] text-white flex flex-col h-screen relative overflow-hidden"
      >
        {/* Logo/Brand Section - Fixed height */}
        <div className="h-20 flex items-center justify-center px-4 flex-shrink-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              // Collapsed State - Only icon
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"
              >
                <BrandIcon className="w-6 h-6 text-[#2d2d2d]" />
              </motion.div>
            ) : (
              // Expanded State - Icon and text
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 w-full overflow-hidden"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <BrandIcon className="w-6 h-6 text-[#2d2d2d]" />
                </motion.div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="text-base font-semibold truncate">
                    {brandName}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {brandSubtitle}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: collapsed ? 0 : 5, scale: collapsed ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center py-3 rounded-lg transition-all duration-200 overflow-hidden ${
                collapsed ? "justify-center px-3" : "px-4 gap-3"
              } ${
                activeNav === item.id
                  ? "bg-[#3d3d3d] text-white shadow-lg"
                  : "text-gray-400 hover:bg-[#3d3d3d] hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>

        {/* Logout Button */}
        {onLogout && (
          <div className="px-4 pb-4 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className={`w-full flex items-center py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium overflow-hidden ${
                collapsed ? "justify-center px-3" : "gap-3 px-4"
              }`}
              title={collapsed ? "Log Out" : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm whitespace-nowrap overflow-hidden"
                  >
                    Log Out
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-700 mx-4 flex-shrink-0"></div>

        {/* Profile Section */}
        <div className="p-4 flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`flex items-center p-3 bg-[#3d3d3d] rounded-lg cursor-pointer overflow-hidden ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {currentUser?.roleName?.charAt(0).toUpperCase() || "U"}
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <div className="text-sm font-medium truncate">
                    {currentUser?.name || currentUser?.username || "User"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentUser?.roleName?.replace(/_/g, " ") || "User"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SettingsIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Toggle Button - Perfectly synced with sidebar */}
      <motion.button
        onClick={onToggleCollapse}
        initial={false}
        animate={{
          left: collapsed ? 64 : 224,
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          left: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.25)",
        }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-6 z-[60] w-10 h-10 bg-gradient-to-br from-white to-gray-50 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-700 border-2 border-gray-200 hover:border-gray-400 cursor-pointer group"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow:
            "0 6px 16px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <svg
            className="w-4 h-4 group-hover:text-gray-900 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.div>
      </motion.button>
    </div>
  );
}
