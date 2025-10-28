"use client";

import { CheckCircle, AlertCircle } from "lucide-react";
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

  const handleCompleteDiagnosis = async () => {
    if (
      !confirm(
        "Mark diagnosis as complete? This will move all case lines to PENDING_APPROVAL status."
      )
    ) {
      return;
    }

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
    </div>
  );
}
