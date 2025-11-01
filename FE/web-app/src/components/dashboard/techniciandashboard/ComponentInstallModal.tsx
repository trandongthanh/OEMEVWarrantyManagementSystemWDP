"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Package, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import componentReservationService from "@/services/componentReservationService";

interface ComponentInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reservationId: string;
  componentName: string;
  vehicleVin?: string;
  componentSerial?: string;
}

export function ComponentInstallModal({
  isOpen,
  onClose,
  onSuccess,
  reservationId,
  componentName,
  vehicleVin: initialVin = "",
  componentSerial: initialSerial = "",
}: ComponentInstallModalProps) {
  const [vehicleVin, setVehicleVin] = useState(initialVin);
  const [serialNumber, setSerialNumber] = useState(initialSerial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form fields when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setVehicleVin(initialVin);
      setSerialNumber(initialSerial);
      setError(null);
    }
  }, [isOpen, initialVin, initialSerial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleVin.trim()) {
      setError("Vehicle VIN is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await componentReservationService.installComponent(reservationId);

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to install component:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to install component");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Install Component
                  </h2>
                  <p className="text-sm mt-0.5">{componentName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Installing this component will link it to the vehicle and mark
                  it as INSTALLED. The case line status will remain IN_REPAIR
                  until you mark the repair as complete.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle VIN *
                  {vehicleVin && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (Auto-filled)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={vehicleVin}
                  onChange={(e) => setVehicleVin(e.target.value)}
                  placeholder="Enter vehicle VIN"
                  className={`w-full px-3 py-2 text-black border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    vehicleVin
                      ? "bg-green-50 border-green-300"
                      : "border-gray-300"
                  }`}
                  readOnly={!!vehicleVin}
                  required
                />
                {vehicleVin && (
                  <p className="text-xs text-gray-500 mt-1">
                    VIN from the associated guarantee case
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component Serial Number
                  {serialNumber && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (Auto-filled)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Serial number (optional)"
                  className={`w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    serialNumber
                      ? "bg-green-50 border-green-300"
                      : "border-gray-300"
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Component serial number for tracking
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Installing..." : "Install Component"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
