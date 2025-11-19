"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import processingRecordService from "@/services/processingRecordService";

interface CancelRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recordId: string;
  vehicleVin?: string;
}

export function CancelRecordModal({
  isOpen,
  onClose,
  onSuccess,
  recordId,
  vehicleVin,
}: CancelRecordModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate reason length
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Cancellation reason must be at least 10 characters long");
      return;
    }

    if (reason.trim().length > 500) {
      setError("Cancellation reason must not exceed 500 characters");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await processingRecordService.cancelRecord(recordId, reason.trim());
      onSuccess?.();
      onClose();
      setReason("");
    } catch (err: unknown) {
      console.error("Failed to cancel record:", err);
      const error = err as {
        response?: {
          data?: { message?: string };
          status?: number;
        };
        message?: string;
      };

      // Handle specific error cases with helpful messages
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      if (statusCode === 404) {
        setError("Processing record not found. It may have been deleted.");
      } else if (statusCode === 409) {
        // Conflict - status not allowed or case lines blocking
        if (errorMessage?.includes("already been cancelled")) {
          setError("This record has already been cancelled.");
        } else if (errorMessage?.includes("cannot be cancelled once repair")) {
          setError(
            "Cannot cancel: Record is already completed or ready for pickup."
          );
        } else if (errorMessage?.includes("caseline")) {
          // Extract case line status from error message
          setError(
            errorMessage ||
              "Cannot cancel: Some case lines are already in repair or completed stages."
          );
        } else {
          setError(
            errorMessage ||
              "Cannot cancel: Record status does not allow cancellation."
          );
        }
      } else if (statusCode === 403) {
        setError(
          "You don't have permission to cancel this record. Only the staff who created it or a manager can cancel it."
        );
      } else if (statusCode === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(
          errorMessage ||
            "Failed to cancel processing record. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cancel Processing Record
                  </h2>
                  {vehicleVin && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Vehicle: {vehicleVin}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will mark the processing record
                  as <strong>CANCELLED</strong> and cancel all associated case
                  lines, guarantee cases, and diagnosis tasks. This action
                  cannot be undone.
                </p>
              </div>

              <div>
                <label
                  htmlFor="cancelReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cancelReason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Please provide a detailed reason for cancellation (minimum 10 characters, e.g., customer request, duplicate entry, vehicle sold, etc.)"
                  disabled={isSubmitting}
                  required
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {reason.trim().length < 10 ? (
                      <span className="text-orange-600">
                        Minimum 10 characters required
                      </span>
                    ) : (
                      <span className="text-green-600">✓ Valid</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reason.trim().length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Keep Record
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !reason.trim() || reason.trim().length < 10
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !reason.trim()
                      ? "Please provide a cancellation reason"
                      : reason.trim().length < 10
                      ? "Reason must be at least 10 characters"
                      : "Cancel this processing record"
                  }
                >
                  {isSubmitting ? "Cancelling..." : "Cancel Record"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
