"use client";

import { useState } from "react";
import { Shield, Plus, Loader2 } from "lucide-react";
import warrantyComponentService from "@/services/warrantyComponentService";
import { toast } from "sonner";

/**
 * Warranty Component Configuration
 * For parts_coordinator_company role
 *
 * NOTE: Backend endpoints for warranty components are partially verified
 * - POST /oem-vehicle-models/:id/warranty-components confirmed
 * - GET/PUT/DELETE endpoints not yet verified in backend
 * This component provides creation functionality with limited listing
 */

interface CreateWarrantyComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateWarrantyComponentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWarrantyComponentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleModelId: "",
    componentId: "",
    coverageDurationMonths: "",
    coverageMileage: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (
      !formData.vehicleModelId.trim() ||
      !formData.componentId.trim() ||
      !formData.coverageDurationMonths ||
      !formData.coverageMileage
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await warrantyComponentService.createWarrantyComponent(
        formData.vehicleModelId,
        {
          componentId: formData.componentId,
          coverageDurationMonths: parseInt(formData.coverageDurationMonths),
          coverageMileage: parseInt(formData.coverageMileage),
        }
      );
      toast.success("Warranty component created successfully!");
      onSuccess();
      onClose();
      setFormData({
        vehicleModelId: "",
        componentId: "",
        coverageDurationMonths: "",
        coverageMileage: "",
      });
    } catch (error) {
      console.error("Error creating warranty component:", error);
      toast.error("Failed to create warranty component");
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
            Create Warranty Component
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
              Vehicle Model ID *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.vehicleModelId}
              onChange={(e) =>
                setFormData({ ...formData, vehicleModelId: e.target.value })
              }
              placeholder="Vehicle Model UUID"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Component Type ID *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.componentId}
              onChange={(e) =>
                setFormData({ ...formData, componentId: e.target.value })
              }
              placeholder="Component Type UUID"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Coverage Duration (Months) *
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.coverageDurationMonths}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coverageDurationMonths: e.target.value,
                })
              }
              placeholder="e.g., 36"
              min="1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Coverage Mileage (KM) *
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.coverageMileage}
              onChange={(e) =>
                setFormData({ ...formData, coverageMileage: e.target.value })
              }
              placeholder="e.g., 100000"
              min="1"
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
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Component
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WarrantyComponentConfig() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              Warranty Component Configuration
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure warranty terms for vehicle model components
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Configuration
          </button>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Warranty component listing and editing are
          currently limited. Backend GET, PUT, and DELETE endpoints have not
          been fully verified. You can create warranty components, but viewing
          and managing them may require additional backend support.
        </p>
      </div>

      {/* CREATE MODAL */}
      <CreateWarrantyComponentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Refresh would go here when listing is available
        }}
      />
    </div>
  );
}
