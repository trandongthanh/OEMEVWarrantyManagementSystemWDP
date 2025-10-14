"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Car,
  AlertCircle,
  CheckCircle,
  Loader,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Gauge,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { vehicleService, claimService, customerService } from "@/services";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface GuaranteeCase {
  id: string;
  contentGuarantee: string;
}

export function NewClaimModal({
  isOpen,
  onClose,
  onSuccess,
}: NewClaimModalProps) {
  const [step, setStep] = useState<"search" | "verify" | "claim" | "success">(
    "search"
  );
  const [vinOrPlate, setVinOrPlate] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [odometer, setOdometer] = useState("");
  const [guaranteeCases, setGuaranteeCases] = useState<GuaranteeCase[]>([
    { id: crypto.randomUUID(), contentGuarantee: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [warrantyInfo, setWarrantyInfo] = useState<any>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("search");
        setVinOrPlate("");
        setVehicleData(null);
        setCustomerData(null);
        setOdometer("");
        setGuaranteeCases([{ id: crypto.randomUUID(), contentGuarantee: "" }]);
        setError("");
        setWarrantyInfo(null);
      }, 300);
    }
  }, [isOpen]);

  const handleSearchVehicle = async () => {
    if (!vinOrPlate.trim()) {
      setError("Please enter VIN or License Plate");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Search by VIN
      const vehicle = await vehicleService.findVehicleByVin(vinOrPlate.trim());

      if (vehicle.data) {
        setVehicleData(vehicle.data);

        // Fetch customer info if ownerId exists
        if (vehicle.data.ownerId) {
          try {
            const customer = await customerService.searchCustomer({
              email: vehicle.data.owner?.email || "",
            });
            setCustomerData(customer);
          } catch (err) {
            console.warn("Customer not found");
          }
        }

        setStep("verify");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Vehicle not found. Please check the VIN or License Plate."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyAndNext = async () => {
    if (!odometer || parseInt(odometer) < 0) {
      setError("Please enter a valid odometer reading");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Check warranty status
      const warranty = await vehicleService.checkVehicleWarranty(
        vehicleData.vin,
        parseInt(odometer)
      );
      setWarrantyInfo(warranty.data);
      setStep("claim");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to check warranty status"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCase = () => {
    setGuaranteeCases([
      ...guaranteeCases,
      { id: crypto.randomUUID(), contentGuarantee: "" },
    ]);
  };

  const handleRemoveCase = (id: string) => {
    if (guaranteeCases.length > 1) {
      setGuaranteeCases(guaranteeCases.filter((c) => c.id !== id));
    }
  };

  const handleCaseChange = (id: string, value: string) => {
    setGuaranteeCases(
      guaranteeCases.map((c) =>
        c.id === id ? { ...c, contentGuarantee: value } : c
      )
    );
  };

  const handleSubmitClaim = async () => {
    // Validate
    const validCases = guaranteeCases.filter(
      (c) => c.contentGuarantee.trim() !== ""
    );

    if (validCases.length === 0) {
      setError("Please add at least one guarantee case description");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await claimService.createClaim(vehicleData.vin, {
        odometer: parseInt(odometer),
        guaranteeCases: validCases.map((c) => ({
          contentGuarantee: c.contentGuarantee,
        })),
      });

      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create claim. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    New Warranty Claim
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {step === "search" && "Step 1: Find Vehicle"}
                    {step === "verify" && "Step 2: Verify Information"}
                    {step === "claim" && "Step 3: Claim Details"}
                    {step === "success" && "Claim Created Successfully!"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Step 1: Search */}
                {step === "search" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Identification Number (VIN)
                      </label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={vinOrPlate}
                          onChange={(e) =>
                            setVinOrPlate(e.target.value.toUpperCase())
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSearchVehicle()
                          }
                          placeholder="Enter VIN (e.g., VIN-NEW-0)"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Verify */}
                {step === "verify" && vehicleData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Vehicle Info */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        Vehicle Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">VIN</p>
                          <p className="font-medium">{vehicleData.vin}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">License Plate</p>
                          <p className="font-medium">
                            {vehicleData.licensePlate || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Model</p>
                          <p className="font-medium">
                            {vehicleData.vehicleModel?.modelName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Manufacture Date
                          </p>
                          <p className="font-medium">
                            {vehicleData.dateOfManufacture
                              ? new Date(
                                  vehicleData.dateOfManufacture
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    {vehicleData.owner && (
                      <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Owner Information
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="font-medium">
                              {vehicleData.owner.fullName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> Phone
                            </p>
                            <p className="font-medium">
                              {vehicleData.owner.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> Email
                            </p>
                            <p className="font-medium">
                              {vehicleData.owner.email}
                            </p>
                          </div>
                          {vehicleData.owner.address && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Address
                              </p>
                              <p className="font-medium">
                                {vehicleData.owner.address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Odometer Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Odometer Reading (km) *
                      </label>
                      <div className="relative">
                        <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={odometer}
                          onChange={(e) => setOdometer(e.target.value)}
                          placeholder="e.g., 52340"
                          min="0"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Claim Details */}
                {step === "claim" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Warranty Status */}
                    {warrantyInfo && (
                      <div
                        className={`rounded-xl p-6 ${
                          warrantyInfo.isUnderWarranty
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {warrantyInfo.isUnderWarranty ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <h3 className="font-semibold">
                            {warrantyInfo.isUnderWarranty
                              ? "Vehicle Under Warranty"
                              : "Warranty Expired"}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {warrantyInfo.message}
                        </p>
                      </div>
                    )}

                    {/* Guarantee Cases */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Guarantee Cases
                        </h3>
                        <button
                          onClick={handleAddCase}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Case
                        </button>
                      </div>

                      {guaranteeCases.map((gCase, index) => (
                        <div key={gCase.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                              Case {index + 1}
                            </label>
                            {guaranteeCases.length > 1 && (
                              <button
                                onClick={() => handleRemoveCase(gCase.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <textarea
                            value={gCase.contentGuarantee}
                            onChange={(e) =>
                              handleCaseChange(gCase.id, e.target.value)
                            }
                            placeholder="Describe the issue or problem with the vehicle..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white resize-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Claim Created Successfully!
                    </h3>
                    <p className="text-gray-600">
                      The warranty claim has been submitted and is now pending
                      diagnosis.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              {step !== "success" && (
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={
                      step === "search"
                        ? onClose
                        : () => setStep(step === "claim" ? "verify" : "search")
                    }
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    {step === "search" ? "Cancel" : "Back"}
                  </button>

                  <button
                    onClick={
                      step === "search"
                        ? handleSearchVehicle
                        : step === "verify"
                        ? handleVerifyAndNext
                        : handleSubmitClaim
                    }
                    disabled={isSearching || isSubmitting}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {(isSearching || isSubmitting) && (
                      <Loader className="w-4 h-4 animate-spin" />
                    )}
                    {step === "search" && "Search Vehicle"}
                    {step === "verify" && "Continue"}
                    {step === "claim" && "Submit Claim"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
