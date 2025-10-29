"use client";

import { CheckCircle, AlertCircle, X } from "lucide-react";
import { useState } from "react";
import processingRecordService from "@/services/processingRecordService";

interface CompleteDiagnosisButtonProps {
  recordId: string;
  onSuccess?: () => void;
  disabled?: boolean;
  userRole?: string;
}

export function CompleteDiagnosisButton({
  recordId,
  onSuccess,
  disabled = false,
  userRole,
}: CompleteDiagnosisButtonProps) {
  // Backend only allows service_center_manager and service_center_staff
  const canCompleteDiagnosis = userRole
    ? ["service_center_manager", "service_center_staff"].includes(userRole)
    : true; // Default to true if role not provided for backward compatibility
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCompleteDiagnosis = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmComplete = async () => {
    setShowConfirmModal(false);
    setError(null);
    setIsSubmitting(true);

    try {
      await processingRecordService.completeDiagnosis(recordId);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("Failed to complete diagnosis:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to complete diagnosis");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <div>
      <button
        onClick={handleCompleteDiagnosis}
        disabled={disabled || isSubmitting || !canCompleteDiagnosis}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-4 h-4" />
        {isSubmitting ? "Completing..." : "Complete Diagnosis"}
      </button>

      {!canCompleteDiagnosis && userRole && (
        <p className="mt-2 text-sm text-gray-600">
          Only managers and staff can complete diagnosis.
        </p>
      )}

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Complete Diagnosis
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Confirm Action
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    This will mark the diagnosis as complete and move all case
                    lines to PENDING_APPROVAL status. This action cannot be
                    undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Completing..." : "Complete Diagnosis"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
