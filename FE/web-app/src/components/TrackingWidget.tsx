"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Car,
  Calendar,
  Gauge,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  Package,
  XCircle,
  Info,
} from "lucide-react";
import publicService, { TrackingInfo } from "@/services/publicService";

export function TrackingWidget() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill token from URL and auto-track
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      // If on /track path, redirect to homepage with token
      if (window.location.pathname === "/track" && tokenFromUrl) {
        window.history.replaceState(null, "", `/?token=${tokenFromUrl}`);
      }

      if (tokenFromUrl) {
        setToken(tokenFromUrl);
        // Auto-track immediately
        handleTrackWithToken(tokenFromUrl);
      }
    }
  }, []);

  const handleTrackWithToken = async (trackingToken: string) => {
    if (!trackingToken.trim()) {
      setError("Please enter a tracking token");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTrackingInfo(null);

      const response = await publicService.getTrackingInfo(
        trackingToken.trim()
      );
      setTrackingInfo(response.data);
    } catch (err: unknown) {
      console.error("Error fetching tracking info:", err);
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (error.response?.status === 404) {
        setError(
          "No service record found for this tracking token. Please check the token and try again."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to fetch tracking information. Please try again later."
        );
      }
      setTrackingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async () => {
    await handleTrackWithToken(token);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CHECKED_IN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      IN_DIAGNOSIS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      WAITING_CUSTOMER_APPROVAL:
        "bg-orange-500/20 text-orange-400 border-orange-500/30",
      PROCESSING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      READY_FOR_PICKUP: "bg-green-500/20 text-green-400 border-green-500/30",
      COMPLETED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return <Clock className="w-5 h-5" />;
      case "IN_DIAGNOSIS":
        return <Search className="w-5 h-5" />;
      case "WAITING_CUSTOMER_APPROVAL":
        return <AlertCircle className="w-5 h-5" />;
      case "PROCESSING":
        return <Wrench className="w-5 h-5" />;
      case "READY_FOR_PICKUP":
        return <Package className="w-5 h-5" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-300 font-medium tracking-wider">
              SERVICE TRACKING
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Track Your Vehicle Service
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enter your tracking token to check the real-time status of your
            vehicle service
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your tracking token"
                className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTrack}
              disabled={!token.trim() || loading}
              className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Track Now</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {trackingInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/* Header with Status */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">
                        Service Record Found
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {trackingInfo.vehicle?.model?.name || "Vehicle"} •{" "}
                        {trackingInfo.vehicle?.model?.company?.name || ""}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-5 py-3 rounded-full border ${getStatusColor(
                        trackingInfo.status
                      )}`}
                    >
                      {getStatusIcon(trackingInfo.status)}
                      <span className="font-semibold text-sm">
                        {trackingInfo.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-5 h-5 text-blue-400" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        VIN
                      </span>
                    </div>
                    <p className="text-white font-semibold text-lg">
                      {trackingInfo.vin}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        Check-in
                      </span>
                    </div>
                    <p className="text-white font-semibold">
                      {new Date(trackingInfo.checkInDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(trackingInfo.checkInDate).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Gauge className="w-5 h-5 text-green-400" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        Odometer
                      </span>
                    </div>
                    <p className="text-white font-semibold">
                      {trackingInfo.odometer.toLocaleString()} km
                    </p>
                  </div>

                  {trackingInfo.mainTechnician && (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Wrench className="w-5 h-5 text-orange-400" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                          Technician
                        </span>
                      </div>
                      <p className="text-white font-semibold">
                        {trackingInfo.mainTechnician.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Service Cases with Details */}
                {trackingInfo.guaranteeCases &&
                  trackingInfo.guaranteeCases.length > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-400" />
                        Service Cases ({trackingInfo.guaranteeCases.length})
                      </h3>
                      <div className="space-y-4">
                        {trackingInfo.guaranteeCases.map((gCase, index) => (
                          <div
                            key={gCase.guaranteeCaseId}
                            className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/30"
                          >
                            {/* Case Header */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-white font-semibold">
                                    Case #{index + 1}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                                      gCase.status
                                    )}`}
                                  >
                                    {gCase.status.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  {gCase.contentGuarantee}
                                </p>
                              </div>
                            </div>

                            {/* Case Lines (Parts/Components) */}
                            {gCase.caseLines && gCase.caseLines.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                                  Components ({gCase.caseLines.length})
                                </p>
                                <div className="space-y-2">
                                  {gCase.caseLines.map((line) => (
                                    <div
                                      key={line.id}
                                      className="bg-gray-800/50 rounded-md p-3 border border-gray-700/30"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          {line.typeComponent && (
                                            <div className="flex items-center gap-2 mb-1">
                                              <Package className="w-4 h-4 text-blue-400" />
                                              <span className="text-white font-medium text-sm">
                                                {line.typeComponent.name}
                                              </span>
                                              {line.quantity && (
                                                <span className="text-gray-400 text-xs">
                                                  × {line.quantity}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          {line.diagnosisText && (
                                            <p className="text-gray-400 text-xs mt-1">
                                              <span className="text-gray-500">
                                                Diagnosis:
                                              </span>{" "}
                                              {line.diagnosisText}
                                            </p>
                                          )}
                                          {line.correctionText && (
                                            <p className="text-gray-400 text-xs mt-1">
                                              <span className="text-gray-500">
                                                Correction:
                                              </span>{" "}
                                              {line.correctionText}
                                            </p>
                                          )}
                                          {line.warrantyStatus && (
                                            <div className="mt-2">
                                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {line.warrantyStatus}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${getStatusColor(
                                            line.status
                                          )}`}
                                        >
                                          {line.status.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                      {line.rejectionReason && (
                                        <div className="mt-2 pt-2 border-t border-red-500/20">
                                          <p className="text-red-400 text-xs">
                                            <span className="font-medium">
                                              Rejection Reason:
                                            </span>{" "}
                                            {line.rejectionReason}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Additional Info */}
                {trackingInfo.checkOutDate && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-semibold">
                          Service Completed
                        </p>
                        <p className="text-green-300 text-sm">
                          Checked out on{" "}
                          {new Date(
                            trackingInfo.checkOutDate
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!trackingInfo && !error && !loading && (
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>No Login Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>24/7 Access</span>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-gray-500">
            Your tracking token was sent to your email when your vehicle was
            checked in
          </p>
        </motion.div>
      </div>
    </section>
  );
}
