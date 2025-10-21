"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Car,
  AlertCircle,
  CheckCircle,
  Loader,
  User,
  Phone,
  Mail,
  MapPin,
  Gauge,
  Plus,
  Trash2,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { vehicleService, claimService, customerService } from "@/services";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onRegisterOwner?: (vin: string) => void;
}

interface GuaranteeCase {
  id: string;
  contentGuarantee: string;
}

export function NewClaimModal({
  isOpen,
  onClose,
  onSuccess,
  onRegisterOwner,
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
  const [noOwnerWarning, setNoOwnerWarning] = useState(false);

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
        setNoOwnerWarning(false);
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
      const response = await vehicleService.findVehicleByVin(vinOrPlate.trim());

      // API returns {status, data: {vehicle: {...}}}
      if (response.data?.vehicle) {
        setVehicleData(response.data.vehicle);

        // Check if vehicle has no owner
        if (!response.data.vehicle.owner) {
          setNoOwnerWarning(true);
        } else {
          setNoOwnerWarning(false);

          // Fetch customer info if owner email exists
          if (response.data.vehicle.owner.email) {
            try {
              const customer = await customerService.searchCustomer({
                email: response.data.vehicle.owner.email,
              });
              setCustomerData(customer);
            } catch (error) {
              console.warn("Customer not found:", error);
            }
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
    // Check if vehicle has no owner
    if (noOwnerWarning || !vehicleData.owner) {
      setError(
        "Cannot proceed: Vehicle must have a registered owner before creating a warranty claim"
      );
      return;
    }

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

      // Transform the response to include warranty status check
      const warrantyData = warranty.data.vehicle;
      const isGeneralWarrantyActive =
        warrantyData.generalWarranty.duration.status === true ||
        warrantyData.generalWarranty.duration.status === "ACTIVE";
      const isGeneralMileageValid =
        warrantyData.generalWarranty.mileage.status === "ACTIVE";

      setWarrantyInfo({
        ...warrantyData,
        isUnderWarranty: isGeneralWarrantyActive && isGeneralMileageValid,
        message:
          isGeneralWarrantyActive && isGeneralMileageValid
            ? `Vehicle is covered under warranty. General warranty expires on ${new Date(
                warrantyData.generalWarranty.duration.endDate
              ).toLocaleDateString()} with ${warrantyData.generalWarranty.mileage.remainingMileage.toLocaleString()} km remaining.`
            : "Vehicle is no longer covered under the general warranty policy.",
      });

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
            className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
                          <p className="font-medium text-gray-900">
                            {vehicleData.vin}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">License Plate</p>
                          <p className="font-medium text-gray-900">
                            {vehicleData.licensePlate || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Model</p>
                          <p className="font-medium text-gray-900">
                            {vehicleData.model ||
                              vehicleData.vehicleModel?.modelName ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Manufacture Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {vehicleData.dateOfManufacture
                              ? new Date(
                                  vehicleData.dateOfManufacture
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* No Owner Warning */}
                    {noOwnerWarning && (
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Owner Registration Required
                            </h3>
                            <p className="text-sm text-gray-700 mb-4">
                              This vehicle does not have a registered owner. You
                              must register an owner before creating a warranty
                              claim.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => {
                                  if (onRegisterOwner && vehicleData?.vin) {
                                    onRegisterOwner(vehicleData.vin);
                                    onClose(); // Close the claim modal
                                  }
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                              >
                                <UserPlus className="w-4 h-4" />
                                Register Owner
                              </button>
                              <button
                                onClick={() => {
                                  setStep("search");
                                  setVinOrPlate("");
                                  setVehicleData(null);
                                  setNoOwnerWarning(false);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                              >
                                <ArrowRight className="w-4 h-4" />
                                Search Another Vehicle
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                            <p className="font-medium text-gray-900">
                              {vehicleData.owner.fullName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> Phone
                            </p>
                            <p className="font-medium text-gray-900">
                              {vehicleData.owner.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> Email
                            </p>
                            <p className="font-medium text-gray-900">
                              {vehicleData.owner.email}
                            </p>
                          </div>
                          {vehicleData.owner.address && (
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Address
                              </p>
                              <p className="font-medium text-gray-900">
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
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
                      <>
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
                            <h3 className="font-semibold text-gray-900">
                              {warrantyInfo.isUnderWarranty
                                ? "Vehicle Under Warranty"
                                : "Warranty Expired"}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-900">
                            {warrantyInfo.message}
                          </p>
                        </div>

                        {/* Warranty Details */}
                        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                          <h3 className="font-semibold text-gray-900">
                            Warranty Coverage Details
                          </h3>

                          {/* General Warranty */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">
                              General Warranty
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Duration</p>
                                <p className="font-medium text-gray-900">
                                  {
                                    warrantyInfo.generalWarranty.policy
                                      .durationMonths
                                  }{" "}
                                  months
                                  <span
                                    className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                      warrantyInfo.generalWarranty.duration
                                        .status === "ACTIVE" ||
                                      warrantyInfo.generalWarranty.duration
                                        .status === true
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {
                                      warrantyInfo.generalWarranty.duration
                                        .remainingDays
                                    }{" "}
                                    days left
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Mileage Limit</p>
                                <p className="font-medium text-gray-900">
                                  {warrantyInfo.generalWarranty.policy.mileageLimit.toLocaleString()}{" "}
                                  km
                                  <span
                                    className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                      warrantyInfo.generalWarranty.mileage
                                        .status === "ACTIVE"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {warrantyInfo.generalWarranty.mileage.remainingMileage.toLocaleString()}{" "}
                                    km left
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Component Warranties */}
                          {warrantyInfo.componentWarranties &&
                            warrantyInfo.componentWarranties.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">
                                  Component Warranties
                                </h4>
                                {warrantyInfo.componentWarranties.map(
                                  (component: any, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-white rounded-lg p-4 space-y-2"
                                    >
                                      <h5 className="font-medium text-gray-900">
                                        {component.componentName}
                                      </h5>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-gray-500">
                                            Duration
                                          </p>
                                          <p className="text-gray-900">
                                            {component.policy.durationMonths}{" "}
                                            months
                                            <span
                                              className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                component.duration.status ===
                                                  "ACTIVE" ||
                                                component.duration.status ===
                                                  true
                                                  ? "bg-green-100 text-green-700"
                                                  : "bg-red-100 text-red-700"
                                              }`}
                                            >
                                              {component.duration.remainingDays}{" "}
                                              days
                                            </span>
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500">
                                            Mileage
                                          </p>
                                          <p className="text-gray-900">
                                            {component.policy.mileageLimit.toLocaleString()}{" "}
                                            km
                                            <span
                                              className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                component.mileage.status ===
                                                "ACTIVE"
                                                  ? "bg-green-100 text-green-700"
                                                  : "bg-red-100 text-red-700"
                                              }`}
                                            >
                                              {component.mileage.remainingMileage.toLocaleString()}{" "}
                                              km
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </>
                    )}

                    {/* Guarantee Cases */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          Guarantee Cases
                        </h3>
                        <button
                          onClick={handleAddCase}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                    disabled={
                      isSearching ||
                      isSubmitting ||
                      (step === "verify" && noOwnerWarning)
                    }
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {(isSearching || isSubmitting) && (
                      <Loader className="w-4 h-4 animate-spin" />
                    )}
                    {step === "search" && "Search Vehicle"}
                    {step === "verify" &&
                      (noOwnerWarning ? "Owner Required" : "Continue")}
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
