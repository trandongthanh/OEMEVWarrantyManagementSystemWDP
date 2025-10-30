"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Shield,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import caseLineService from "@/services/caseLineService";
import { sendOtp, verifyOtp } from "@/services/mailService";

interface ApproveCaseLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseLineIds: string[];
  action: "approve" | "reject";
  onSuccess?: () => void;
  customerEmail?: string; // Customer email for OTP verification
  vin?: string; // Vehicle VIN for OTP verification
}

export function ApproveCaseLinesModal({
  isOpen,
  onClose,
  caseLineIds,
  action,
  onSuccess,
  customerEmail,
  vin,
}: ApproveCaseLinesModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"confirm" | "otp">("confirm");
  const [email, setEmail] = useState(customerEmail || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Auto-fill email when modal opens or customerEmail changes
  useEffect(() => {
    if (customerEmail && email !== customerEmail) {
      setEmail(customerEmail);
    }
  }, [customerEmail, email]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      // Don't reset email if customerEmail is available
      if (!customerEmail) {
        setEmail("");
      }
      setOtp("");
      setOtpSent(false);
      setCountdown(0);
      setError(null);
      setReason("");
    }
  }, [isOpen, customerEmail]);

  const handleSubmit = () => {
    if (!caseLineIds || caseLineIds.length === 0) {
      setError("No case lines selected");
      return;
    }

    if (action === "reject" && !reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    // Move to OTP step
    setStep("otp");
    setError(null);
  };

  const handleSendOTP = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendOtp(email, vin);
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify OTP first
      await verifyOtp(email, otp);

      // Now proceed with the actual approval/rejection
      const payload = {
        approvedCaseLineIds:
          action === "approve" ? caseLineIds.map((id) => ({ id })) : [],
        rejectedCaseLineIds:
          action === "reject" ? caseLineIds.map((id) => ({ id })) : [],
        approverEmail: email,
      };

      await caseLineService.approveCaseLines(payload);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm"
                      />
                    </div>
                  )}
                </>
              )}

              {/* OTP Verification Step */}
              {step === "otp" && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">
                        Verification Required
                      </p>
                      <p>
                        Please verify your email to{" "}
                        {isApprove ? "approve" : "reject"} the selected case
                        lines.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        disabled={otpSent || loading}
                        className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          setOtp(value);
                        }}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                      />
                      <p className="mt-2 text-sm text-gray-600">
                        {countdown > 0 ? (
                          <span>
                            Resend code in{" "}
                            <span className="font-semibold">{countdown}s</span>
                          </span>
                        ) : (
                          <button
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                          >
                            Resend code
                          </button>
                        )}
                      </p>
                    </motion.div>
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
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

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
                  Continue to Verification
                </button>
              )}

              {step === "otp" && !otpSent && (
                <button
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Verification Code
                    </>
                  )}
                </button>
              )}

              {step === "otp" && otpSent && (
                <button
                  onClick={handleVerifyAndSubmit}
                  disabled={loading || otp.length !== 6}
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
                      Verify & {isApprove ? "Approve" : "Reject"}
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
