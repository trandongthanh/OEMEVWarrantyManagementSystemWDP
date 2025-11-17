"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import caseLineService from "@/services/caseLineService";

interface ApproveCaseLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseLineIds: string[];
  action: "approve" | "reject";
  onSuccess?: () => void;
  pendingApprovalsCount?: number; // Number of remaining pending approvals
}

export function ApproveCaseLinesModal({
  isOpen,
  onClose,
  caseLineIds,
  action,
  onSuccess,
  pendingApprovalsCount = 0,
}: ApproveCaseLinesModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"confirm" | "success">("confirm");

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      setError(null);
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!caseLineIds || caseLineIds.length === 0) {
      setError("No case lines selected");
      return;
    }

    if (action === "reject" && !reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        approvedCaseLineIds:
          action === "approve" ? caseLineIds.map((id) => ({ id })) : [],
        rejectedCaseLineIds:
          action === "reject" ? caseLineIds.map((id) => ({ id })) : [],
      };

      await caseLineService.approveCaseLines(payload);

      // Show success step if there are more pending approvals
      if (pendingApprovalsCount > 0) {
        setStep("success");
      } else {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (err) {
      console.error("Error processing case lines:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process case lines. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isApprove = action === "approve";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200"
          >
            {/* Header */}
            <div
              className={`px-6 py-4 rounded-t-2xl ${
                isApprove ? "bg-green-600" : "bg-red-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  {isApprove ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                  <h3 className="text-xl font-bold">
                    {isApprove ? "Approve" : "Reject"} Case Lines
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Success Step */}
              {step === "success" && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {isApprove ? "Approved!" : "Rejected"}
                  </h4>
                  <p className="text-gray-600 mb-1">
                    {caseLineIds.length} case line
                    {caseLineIds.length !== 1 ? "s" : ""}{" "}
                    {isApprove ? "approved" : "rejected"} successfully
                  </p>
                  {pendingApprovalsCount > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                        <FileCheck className="w-4 h-4" />
                        <span className="font-medium">
                          {pendingApprovalsCount}
                        </span>{" "}
                        more approval{pendingApprovalsCount !== 1 ? "s" : ""}{" "}
                        pending
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === "confirm" && (
                <>
                  {/* Case Line IDs */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Case Line IDs to {isApprove ? "Approve" : "Reject"}:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {caseLineIds && caseLineIds.length > 0 ? (
                        caseLineIds.map((id) => (
                          <span
                            key={id || Math.random()}
                            className="inline-flex items-center px-2.5 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-mono rounded-md"
                          >
                            {id && typeof id === "string" && id.length > 12
                              ? `${id.substring(0, 12)}...`
                              : id || "N/A"}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          No case lines selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Message */}
                  <div
                    className={`flex gap-3 p-4 rounded-lg border ${
                      isApprove
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 flex-shrink-0 ${
                        isApprove ? "text-green-600" : "text-red-600"
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isApprove ? "text-green-900" : "text-red-900"
                        } mb-1`}
                      >
                        {isApprove ? "Confirm Approval" : "Confirm Rejection"}
                      </p>
                      <p
                        className={`text-sm ${
                          isApprove ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        You are about to {isApprove ? "approve" : "reject"}{" "}
                        {(caseLineIds?.length || 0) === 1
                          ? "this case line"
                          : `${caseLineIds?.length || 0} case lines`}
                        . This action will notify the technician and customer.
                      </p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {!isApprove && (
                    <div>
                      <label
                        htmlFor="rejection-reason"
                        className="block text-sm font-medium text-gray-900 mb-2"
                      >
                        Reason for Rejection{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="rejection-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please explain why these case lines are being rejected..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm"
                      />
                    </div>
                  )}

                  {/* Approval Message */}
                  {isApprove && (
                    <div>
                      <label
                        htmlFor="approval-notes"
                        className="block text-sm font-medium text-gray-900 mb-2"
                      >
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        id="approval-notes"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Add any notes or comments about this approval..."
                        rows={3}
                        className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
              {step !== "success" && (
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              )}

              {step === "confirm" && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isApprove
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isApprove ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {isApprove ? "Approve" : "Reject"}
                    </>
                  )}
                </button>
              )}

              {step === "success" && (
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onSuccess?.();
                      onClose();
                    }}
                    className="w-full px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    Continue to Next Approval
                    {pendingApprovalsCount > 0 && (
                      <span className="ml-1 text-xs bg-blue-700 px-2 py-0.5 rounded-full">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSuccess?.();
                      onClose();
                    }}
                    className="w-full px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
