"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, Settings as SettingsIcon } from "lucide-react";

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
    roleName: string;
  } | null;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
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
  showAddButton = true,
  addButtonLabel = "Add a section",
  onAddClick,
}: SidebarProps) {
  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="bg-[#2d2d2d] text-white flex flex-col h-screen relative"
      >
        {/* Logo/Brand Section - Fixed height */}
        <motion.div
          className="h-20 flex items-center justify-center px-4 flex-shrink-0"
          initial={false}
          animate={{
            paddingLeft: collapsed ? 16 : 16,
            paddingRight: collapsed ? 16 : 16,
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {collapsed ? (
            // Collapsed State - Only icon
            <motion.div
              initial={false}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"
            >
              <BrandIcon className="w-6 h-6 text-[#2d2d2d]" />
            </motion.div>
          ) : (
            // Expanded State - Icon and text
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-3 w-full"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <BrandIcon className="w-6 h-6 text-[#2d2d2d]" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex-1 min-w-0"
              >
                <div className="text-base font-semibold truncate">
                  {brandName}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {brandSubtitle}
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: collapsed ? 0 : 5, scale: collapsed ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center py-3 rounded-lg transition-all duration-200 ${
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
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
        {showAddButton && (
          <div className="px-4 pb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddClick}
              className={`w-full flex items-center py-3 bg-white text-[#2d2d2d] rounded-lg hover:bg-gray-100 transition-colors font-medium ${
                collapsed ? "justify-center px-3" : "justify-center gap-2 px-4"
              }`}
              title={collapsed ? addButtonLabel : undefined}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {!collapsed && (
                <AnimatePresence mode="wait">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm whitespace-nowrap"
                  >
                    {addButtonLabel}
                  </motion.span>
                </AnimatePresence>
              )}
            </motion.button>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-700 mx-4"></div>

        {/* Profile Section */}
        <div className="p-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`flex items-center p-3 bg-[#3d3d3d] rounded-lg cursor-pointer ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {currentUser?.roleName?.charAt(0).toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-sm font-medium truncate">
                    {currentUser?.userId || "User"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentUser?.roleName?.replace(/_/g, " ") || "User"}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            {!collapsed && (
              <SettingsIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Toggle Button - Outside sidebar with improved styling */}
      <motion.button
        onClick={onToggleCollapse}
        initial={false}
        animate={{
          left: collapsed ? 72 : 232,
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{
          scale: 1.15,
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.2)",
        }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 z-50 w-9 h-9 bg-gradient-to-br from-white to-gray-50 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow:
            "0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
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
