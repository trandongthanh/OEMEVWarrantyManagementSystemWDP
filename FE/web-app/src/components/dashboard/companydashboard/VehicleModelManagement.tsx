"use client";

import { useState } from "react";
import { Car, Plus, Loader2 } from "lucide-react";
import vehicleModelService from "@/services/vehicleModelService";
import { toast } from "sonner";

/**
 * Vehicle Model Management Component
 * For parts_coordinator_company role
 *
 * NOTE: Backend currently only supports POST /oem-vehicle-models (create)
 * GET endpoint for listing models is not yet implemented in backend
 * This component only provides creation functionality until backend adds listing
 */

interface CreateVehicleModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateVehicleModelModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateVehicleModelModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleModelName: "",
    sku: "",
    vehicleCompanyId: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (
      !formData.vehicleModelName.trim() ||
      !formData.sku.trim() ||
      !formData.vehicleCompanyId.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await vehicleModelService.createVehicleModel(formData);
      toast.success("Vehicle model created successfully!");
      onSuccess();
      onClose();
      setFormData({ vehicleModelName: "", sku: "", vehicleCompanyId: "" });
    } catch (error) {
      console.error("Error creating vehicle model:", error);
      toast.error("Failed to create vehicle model");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Create Vehicle Model
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Model Name *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.vehicleModelName}
              onChange={(e) =>
                setFormData({ ...formData, vehicleModelName: e.target.value })
              }
              placeholder="e.g., Model S, Cybertruck"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">SKU *</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              placeholder="e.g., MODEL-S-2024"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Vehicle Company ID *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.vehicleCompanyId}
              onChange={(e) =>
                setFormData({ ...formData, vehicleCompanyId: e.target.value })
              }
              placeholder="Company UUID"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Model
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VehicleModelManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              Vehicle Model Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create vehicle models for your company
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Model
          </button>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Model listing is currently not available. The
          backend GET endpoint for listing vehicle models has not been
          implemented yet. You can create new models, but viewing the list
          requires backend support.
        </p>
      </div>

      {/* CREATE MODAL */}
      <CreateVehicleModelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Refresh would go here when listing is available
        }}
      />
    </div>
  );
}
