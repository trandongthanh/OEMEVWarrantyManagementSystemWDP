"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  LucideIcon,
} from "lucide-react";
import componentService, { Component } from "@/services/componentService";
import { toast } from "sonner";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: LucideIcon }
> = {
  IN_STOCK: {
    label: "In Stock",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Package,
  },
  RESERVED: {
    label: "Reserved",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  INSTALLED: {
    label: "Installed",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  DEFECTIVE: {
    label: "Defective",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
  RETURNED: {
    label: "Returned",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: RefreshCw,
  },
};

export function ComponentStatusManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [component, setComponent] = useState<Component | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a serial number");
      return;
    }

    setSearching(true);
    try {
      const result = await componentService.searchBySerialNumber(searchQuery);
      if (
        result &&
        result.status === "success" &&
        result.data.components.length > 0
      ) {
        setComponent(result.data.components[0]);
        toast.success("Component found");
      } else {
        setComponent(null);
        toast.error("Component not found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setComponent(null);
      toast.error("Failed to search component");
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!component || !selectedStatus) return;

    setUpdating(true);
    try {
      await componentService.updateComponentStatus(component.componentId, {
        status: selectedStatus as
          | "IN_STOCK"
          | "RESERVED"
          | "INSTALLED"
          | "DEFECTIVE"
          | "RETURNED",
      });
      toast.success("Component status updated successfully");
      setShowStatusModal(false);
      // Refresh component data
      const refreshed = await componentService.getComponentById(
        component.componentId
      );
      if (refreshed.status === "success" && refreshed.data.component) {
        setComponent(refreshed.data.component);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update component status");
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = () => {
    if (component) {
      setSelectedStatus(component.status);
      setShowStatusModal(true);
    }
  };

  const currentStatusConfig = component
    ? statusConfig[component.status] || statusConfig.IN_WAREHOUSE
    : null;
  const StatusIcon = currentStatusConfig?.icon;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Component Status Manager
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Search and update component status by serial number
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter component serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Component Details */}
          {component && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {component.typeComponent?.name || "Component"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Serial: {component.serialNumber}
                    </p>
                  </div>
                </div>
                {StatusIcon && currentStatusConfig && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStatusConfig.bgColor}`}
                  >
                    <StatusIcon
                      className={`w-5 h-5 ${currentStatusConfig.color}`}
                    />
                    <span
                      className={`font-medium ${currentStatusConfig.color}`}
                    >
                      {currentStatusConfig.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Component Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900">
                    {component.typeComponent?.category|| "N/A"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Warehouse</p>
                  <p className="font-medium text-gray-900">
                    {component.warehouse?.name || "N/A"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="font-medium text-gray-900">
                    ${component.typeComponent?.price?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Component ID</p>
                  <p className="font-medium text-gray-900 text-xs truncate">
                    {component.componentId}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Type ID</p>
                  <p className="font-medium text-gray-900 text-xs truncate">
                    {component.typeComponentId}
                  </p>
                </div>
              </div>

              {/* Update Status Button */}
              <button
                onClick={openStatusModal}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Update Status
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!component && !searching && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Search for a Component
              </h3>
              <p className="text-gray-500">
                Enter a serial number above to view component details
              </p>
            </div>
          )}
        </motion.div>

        {/* Status Update Modal */}
        <AnimatePresence>
          {showStatusModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => !updating && setShowStatusModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Update Component Status
                </h2>

                <div className="space-y-3 mb-6">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}
                          >
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">
                              {config.label}
                            </p>
                            <p className="text-xs text-gray-500">{status}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    disabled={updating}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating || !selectedStatus}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
