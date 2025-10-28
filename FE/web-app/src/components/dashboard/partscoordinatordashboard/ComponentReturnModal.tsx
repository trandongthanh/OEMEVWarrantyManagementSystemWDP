"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Loader2, AlertCircle, X } from "lucide-react";
import componentReservationService from "@/services/componentReservationService";
import { toast } from "sonner";

interface ComponentReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ComponentReturnModal({
  isOpen,
  onClose,
  onSuccess,
}: ComponentReturnModalProps) {
  const [reservationId, setReservationId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [returning, setReturning] = useState(false);

  const handleReturn = async () => {
    if (!reservationId.trim()) {
      toast.error("Please enter a reservation ID");
      return;
    }
    if (!serialNumber.trim()) {
      toast.error("Please enter a serial number");
      return;
    }

    setReturning(true);
    try {
      await componentReservationService.returnComponent(reservationId.trim(), {
        serialNumber: serialNumber.trim(),
      });
      toast.success("Component returned successfully!");
      setReservationId("");
      setSerialNumber("");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error("Error returning component:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to return component";
      toast.error(errorMessage);
    } finally {
      setReturning(false);
    }
  };

  const handleClose = () => {
    if (!returning) {
      setReservationId("");
      setSerialNumber("");
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
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Component Return
                  </h2>
                  <p className="text-sm text-gray-500">
                    Return component after installation
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={returning}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-700">
                  <p className="font-medium">How to use:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                    <li>Get the reservation ID from the technician</li>
                    <li>
                      Verify component has been installed (status: INSTALLED)
                    </li>
                    <li>Enter reservation ID and component serial number</li>
                    <li>Status will change from INSTALLED → RETURNED</li>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  disabled={returning}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter component serial number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  disabled={returning}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      reservationId.trim() &&
                      serialNumber.trim()
                    ) {
                      handleReturn();
                    }
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={returning}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={
                  returning || !reservationId.trim() || !serialNumber.trim()
                }
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {returning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Returning...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Return Component
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
