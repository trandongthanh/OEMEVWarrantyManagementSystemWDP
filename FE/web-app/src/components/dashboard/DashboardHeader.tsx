"use client";

import { useState } from "react";
import { Search, Bell, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  currentPage?: string;
  searchValue?: string;
  isSearching?: boolean;
  searchResults?: React.ReactNode;
}

export function DashboardHeader({
  onSearch,
  searchPlaceholder = "Search...",
  showSearch = true,
  showNotifications = true,
  currentPage = "Dashboard",
  searchValue = "",
  isSearching = false,
  searchResults,
}: DashboardHeaderProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchValue);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Page Title / Search */}
        <div className="flex-1 max-w-2xl">
          {showSearch ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-16 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
                ⌘ F
              </span>

              {/* Search Loading/Results */}
              {isSearching && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                </div>
              )}

              {/* Custom Search Results */}
              {!isSearching && searchResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {searchResults}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentPage}
              </h1>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        {showNotifications && (
          <div className="flex items-center space-x-4">
            {/* Messages */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
}
