"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  LucideIcon,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import vehicleService, { VehicleComponent } from "@/services/vehicleService";
import { toast } from "sonner";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: LucideIcon }
> = {
  IN_WAREHOUSE: {
    label: "In Warehouse",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Package,
  },
  RESERVED: {
    label: "Reserved",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: AlertCircle,
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: RefreshCw,
  },
  WITH_TECHNICIAN: {
    label: "With Technician",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: Loader2,
  },
  INSTALLED: {
    label: "Installed",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  RETURNED: {
    label: "Returned",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

const categoryColors: Record<string, string> = {
  HIGH_VOLTAGE_BATTERY: "bg-red-50 text-red-700 border-red-200",
  ELECTRIC_MOTOR: "bg-blue-50 text-blue-700 border-blue-200",
  INVERTER: "bg-purple-50 text-purple-700 border-purple-200",
  CHARGER: "bg-green-50 text-green-700 border-green-200",
  COOLING_SYSTEM: "bg-cyan-50 text-cyan-700 border-cyan-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
};

export function VehicleComponents() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<VehicleComponent[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    | "ALL"
    | "IN_WAREHOUSE"
    | "RESERVED"
    | "IN_TRANSIT"
    | "WITH_TECHNICIAN"
    | "INSTALLED"
    | "RETURNED"
  >("ALL");

  const handleSearch = async () => {
    if (!vin.trim()) {
      toast.error("Please enter a VIN");
      return;
    }

    setLoading(true);
    try {
      const response = await vehicleService.getVehicleComponents(
        vin,
        statusFilter
      );
      if (response.status === "success") {
        setComponents(response.data.components);
        toast.success(`Found ${response.data.components.length} components`);
      }
    } catch (error: unknown) {
      console.error("Error fetching components:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to fetch components");
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

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
                Vehicle Components
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View all components installed on a vehicle
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
                placeholder="Enter vehicle VIN..."
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "ALL"
                    | "IN_WAREHOUSE"
                    | "RESERVED"
                    | "IN_TRANSIT"
                    | "WITH_TECHNICIAN"
                    | "INSTALLED"
                    | "RETURNED"
                )
              }
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="ALL">All Status</option>
              <option value="IN_WAREHOUSE">In Warehouse</option>
              <option value="RESERVED">Reserved</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="WITH_TECHNICIAN">With Technician</option>
              <option value="INSTALLED">Installed</option>
              <option value="RETURNED">Returned</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
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

          {/* Summary Stats */}
          {components.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Total Components
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {components.length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      In Warehouse
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {
                        components.filter((c) => c.status === "IN_WAREHOUSE")
                          .length
                      }
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">
                      Reserved
                    </p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">
                      {components.filter((c) => c.status === "RESERVED").length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      In Transit
                    </p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {
                        components.filter((c) => c.status === "IN_TRANSIT")
                          .length
                      }
                    </p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-purple-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                      With Technician
                    </p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {
                        components.filter((c) => c.status === "WITH_TECHNICIAN")
                          .length
                      }
                    </p>
                  </div>
                  <Loader2 className="w-8 h-8 text-orange-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                      Installed
                    </p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {
                        components.filter((c) => c.status === "INSTALLED")
                          .length
                      }
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600 opacity-60" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide">
                      Returned
                    </p>
                    <p className="text-2xl font-bold text-red-900 mt-1">
                      {components.filter((c) => c.status === "RETURNED").length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600 opacity-60" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Components List */}
          {components.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {components.map((component, index) => {
                const config =
                  statusConfig[component.status] || statusConfig.INSTALLED;
                const StatusIcon = config.icon;
                const categoryColor =
                  categoryColors[component.typeComponent.category] ||
                  categoryColors.default;

                return (
                  <motion.div
                    key={component.componentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                            {component.typeComponent.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${categoryColor}`}
                            >
                              {component.typeComponent.category.replace(
                                /_/g,
                                " "
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl ${config.bgColor} border border-opacity-30`}
                      >
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-sm font-bold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Serial Number
                        </p>
                        <p className="font-mono text-sm font-bold text-gray-900">
                          {component.serialNumber}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                              Installed
                            </p>
                          </div>
                          <p className="text-sm font-bold text-blue-900">
                            {new Date(component.installedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                              Price
                            </p>
                          </div>
                          <p className="text-sm font-bold text-green-900">
                            $
                            {component.typeComponent.price.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : !loading && vin ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Components Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No components have been installed on this vehicle yet. Check
                back after service appointments.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Search for Components
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Enter a vehicle VIN number above to view all installed
                components, their status, and installation history.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Track installations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>View details</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Monitor status</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
