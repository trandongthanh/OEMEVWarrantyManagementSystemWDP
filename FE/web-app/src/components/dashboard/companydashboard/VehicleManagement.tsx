"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Upload, Info, Loader2, Package } from "lucide-react";
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
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Info Card */}
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Bulk Vehicle Upload
                  </h3>
                  <p className="text-sm text-blue-700">
                    Create multiple vehicles at once by uploading an Excel file.
                    This feature allows you to quickly add vehicle inventory to
                    the system.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900">
                      Required Information:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>
                        <strong>VIN</strong> - Vehicle Identification Number
                        (unique)
                      </li>
                      <li>
                        <strong>Model SKU</strong> - Vehicle model identifier
                      </li>
                      <li>
                        <strong>Date of Manufacture</strong> - Manufacturing
                        date (YYYY-MM-DD)
                      </li>
                      <li>
                        <strong>Place of Manufacture</strong> - Manufacturing
                        location
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Vehicle Models List */}
              <div className="bg-white border border-gray-200 rounded-xl">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Vehicle Models ({vehicleModels.length})
                  </h3>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : vehicleModels.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No vehicle models found</p>
                      <p className="text-sm mt-1">
                        Create your first vehicle model to get started
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicleModels.map((model) => (
                        <div
                          key={model.vehicleModelId}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Car className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {model.vehicleModelName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  SKU: {model.sku}
                                </p>
                              </div>
                            </div>
                          </div>
                          {model.warrantyComponents &&
                            model.warrantyComponents.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-600">
                                  {model.warrantyComponents.length} warranty
                                  component(s)
                                </p>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Excel File
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload a prepared Excel file containing vehicle data to
                    create multiple vehicles at once.
                  </p>
                </button>

                <div className="p-6 border-2 border-gray-200 rounded-xl text-left bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-gray-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Vehicle Listing
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage all vehicles in the system.
                  </p>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Coming soon...
                  </p>
                </div>
              </div>

              {/* Statistics Placeholder */}
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vehicle Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Total Vehicles</p>
                    <p className="text-2xl font-bold text-gray-400">--</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-400">--</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Under Warranty</p>
                    <p className="text-2xl font-bold text-gray-400">--</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center italic">
                  Statistics endpoint not yet implemented
                </p>
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
