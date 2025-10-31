"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Loader2, AlertCircle, X } from "lucide-react";
import componentReservationService from "@/services/componentReservationService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ComponentPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ComponentPickupModal({
  isOpen,
  onClose,
  onSuccess,
}: ComponentPickupModalProps) {
  const { user } = useAuth();
  const [reservationId, setReservationId] = useState("");
  const [pickingUp, setPickingUp] = useState(false);

  const handlePickup = async () => {
    if (!reservationId.trim()) {
      toast.error("Please enter a reservation ID");
      return;
    }

    if (!user?.userId) {
      toast.error("User ID not available");
      return;
    }

    setPickingUp(true);
    try {
      await componentReservationService.pickupComponent(
        reservationId.trim(),
        user.userId
      );
      toast.success("Component picked up successfully!");
      setReservationId("");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error picking up component:", error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to pickup component";
      toast.error(errorMessage);
    } finally {
      setPickingUp(false);
    }
  };

  const handleClose = () => {
    if (!pickingUp) {
      setReservationId("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Component Pickup
                  </h2>
                  <p className="text-sm text-gray-500">
                    Mark component as picked up
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={pickingUp}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">How to use:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                    <li>Get the reservation ID from the technician or staff</li>
                    <li>Enter the reservation ID below</li>
                    <li>
                      Status will change from RESERVED → PICKED_UP (ready for
                      installation)
                    </li>
                  </ol>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reservation ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reservationId}
                  onChange={(e) => setReservationId(e.target.value)}
                  placeholder="Enter reservation ID (e.g., RES-001)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  disabled={pickingUp}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && reservationId.trim()) {
                      handlePickup();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={pickingUp}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePickup}
                disabled={pickingUp || !reservationId.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pickingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Picking up...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Pickup Component
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
