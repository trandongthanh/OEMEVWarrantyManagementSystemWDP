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
} from "lucide-react";
import vehicleService, { VehicleComponent } from "@/services/vehicleService";
import { toast } from "sonner";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: LucideIcon }
> = {
  INSTALLED: {
    label: "Installed",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  RETURNED: {
    label: "Returned",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: RefreshCw,
  },
  DEFECTIVE: {
    label: "Defective",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

export function VehicleComponents() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<VehicleComponent[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "INSTALLED" | "RETURNED" | "DEFECTIVE"
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
                    | "INSTALLED"
                    | "RETURNED"
                    | "DEFECTIVE"
                )
              }
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="ALL">All Status</option>
              <option value="INSTALLED">Installed</option>
              <option value="RETURNED">Returned</option>
              <option value="DEFECTIVE">Defective</option>
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

          {/* Components List */}
          {components.length > 0 ? (
            <div className="space-y-3">
              {components.map((component) => {
                const config =
                  statusConfig[component.status] || statusConfig.INSTALLED;
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={component.componentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {component.typeComponent.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Serial: {component.serialNumber}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                component.installedAt
                              ).toLocaleDateString()}
                            </span>
                            <span>
                              Category: {component.typeComponent.category}
                            </span>
                            <span>
                              Price: $
                              {component.typeComponent.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor}`}
                      >
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-sm font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : !loading && vin ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Components Found
              </h3>
              <p className="text-gray-500">
                No components found for this vehicle
              </p>
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Search for a Vehicle
              </h3>
              <p className="text-gray-500">
                Enter a VIN above to view installed components
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
