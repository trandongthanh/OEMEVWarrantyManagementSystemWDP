"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Upload,
  Info,
  Loader2,
  Package,
  Search,
  Grid,
  List,
  TrendingUp,
  Plus,
} from "lucide-react";
import VehicleBulkUpload from "./VehicleBulkUpload";
import vehicleModelService, {
  VehicleModel,
} from "@/services/vehicleModelService";
import { toast } from "sonner";

/**
 * Vehicle Management Component
 * For parts_coordinator_company role
 *
 * Provides bulk vehicle creation via Excel upload
 */
export default function VehicleManagement() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchVehicleModels();
  }, []);

  const fetchVehicleModels = async () => {
    try {
      setLoading(true);
      const models = await vehicleModelService.getVehicleModels();
      setVehicleModels(models);
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      toast.error("Failed to load vehicle models");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchVehicleModels();
  };

  // Filter models based on search query
  const filteredModels = vehicleModels.filter(
    (model) =>
      model.vehicleModelName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      model.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Vehicle Management
                  </h1>
                </div>
                <p className="text-gray-600">
                  Manage vehicle inventory and bulk operations
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Upload className="w-5 h-5" />
                Bulk Upload Vehicles
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-blue-600" />
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Total Models
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {(vehicleModels || []).length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Car className="w-8 h-8 text-green-600" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-green-900 mb-1">
                    With Warranty
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {
                      (vehicleModels || []).filter(
                        (m) =>
                          m.warrantyComponents &&
                          m.warrantyComponents.length > 0
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-purple-600" />
                    <Info className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-purple-900 mb-1">
                    Total Components
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {(vehicleModels || []).reduce(
                      (sum, m) => sum + (m.warrantyComponents?.length || 0),
                      0
                    )}
                  </p>
                </div>
              </div>

              {/* Vehicle Models List */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Vehicle Models
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "grid"
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "list"
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by model name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : filteredModels.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">
                        {searchQuery
                          ? "No models match your search"
                          : "No vehicle models found"}
                      </p>
                      <p className="text-sm mt-1">
                        {searchQuery
                          ? "Try a different search term"
                          : "Create your first vehicle model to get started"}
                      </p>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(filteredModels || []).map((model) => (
                        <motion.div
                          key={model.vehicleModelId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Car className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {model.vehicleModelName}
                                </h4>
                                <p className="text-xs text-gray-500 font-mono">
                                  {model.sku}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {model.warrantyComponents &&
                              model.warrantyComponents.length > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                  <Package className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-medium text-green-700">
                                    {model.warrantyComponents.length} warranty
                                    component
                                    {model.warrantyComponents.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                </div>
                              )}
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-500 font-mono truncate">
                                ID: {model.vehicleModelId.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(filteredModels || []).map((model) => (
                        <motion.div
                          key={model.vehicleModelId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Car className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900">
                                  {model.vehicleModelName}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-xs text-gray-500">
                                    SKU:{" "}
                                    <span className="font-mono">
                                      {model.sku}
                                    </span>
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono">
                                    ID: {model.vehicleModelId.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {model.warrantyComponents &&
                                model.warrantyComponents.length > 0 && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                    <Package className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">
                                      {model.warrantyComponents.length}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bulk Upload Vehicles
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload a prepared Excel file containing vehicle data to
                    create multiple vehicles at once.
                  </p>
                </button>

                <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Requirements
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>VIN:</strong> Vehicle Identification Number
                        (unique)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>Model SKU:</strong> Vehicle model identifier
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>Date:</strong> Manufacturing date (YYYY-MM-DD)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>Place:</strong> Manufacturing location
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <VehicleBulkUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export { VehicleManagement };
