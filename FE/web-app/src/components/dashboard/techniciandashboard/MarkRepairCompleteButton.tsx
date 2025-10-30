"use client";

import { CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import caseLineService from "@/services/caseLineService";

interface MarkRepairCompleteButtonProps {
  caseLineId: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export function MarkRepairCompleteButton({
  caseLineId,
  onSuccess,
  disabled = false,
  className = "",
}: MarkRepairCompleteButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkComplete = async () => {
    if (!confirm("Mark this repair as complete?")) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await caseLineService.markRepairComplete(caseLineId);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("Failed to mark repair as complete:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Failed to mark repair as complete"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleMarkComplete}
        disabled={disabled || isSubmitting}
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <CheckCircle className="w-4 h-4" />
        {isSubmitting ? "Marking..." : "Mark Complete"}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
