"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  CheckCircle,
  AlertCircle,
  Car,
  User,
  Gauge,
  FileText,
  Shield,
  Loader2,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { createClaim } from "@/services/claimService";
import type { ClaimData, CreateClaimPayload } from "./types";

interface ReviewSubmitStepProps {
  data: ClaimData;
  onClose: () => void;
}

export function ReviewSubmitStep({ data, onClose }: ReviewSubmitStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [createdRecordId, setCreatedRecordId] = useState<string>("");

  const vehicleInfo = data.vehicleInfo;
  const warrantyCheck = data.warrantyCheck;
  const guaranteeCases = data.guaranteeCases || [];
  const odometer = data.odometer;

  const canSubmit =
    vehicleInfo &&
    odometer &&
    guaranteeCases.length > 0 &&
    guaranteeCases.every((c) => c.contentGuarantee.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit || !vehicleInfo || odometer === undefined) {
      setSubmitError("Missing required information");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare payload matching backend requirements
      const payload: CreateClaimPayload = {
        odometer: odometer,
        guaranteeCases: guaranteeCases.map((gc) => ({
          contentGuarantee: gc.contentGuarantee,
        })),
      };

      // Submit to backend
      const response = await createClaim(vehicleInfo.vin, payload);

      if (response.status === "success") {
        setSubmitSuccess(true);
        setCreatedRecordId(
          response.data.record.vehicleProcessingRecordId || ""
        );

        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      console.error("Claim submission error:", err);

      if (err.response?.status === 409) {
        setSubmitError(
          "Vehicle already has an active claim. Please complete or close the existing claim first."
        );
      } else if (err.response?.status === 404) {
        setSubmitError(
          "Vehicle or owner not found. Please verify vehicle information."
        );
      } else if (err.response?.status === 400) {
        setSubmitError(
          err.response.data.message ||
            "Invalid claim data. Please review all fields."
        );
      } else if (err.response?.data?.message) {
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError("Failed to submit claim. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-3">
          Claim Submitted Successfully!
        </h3>
        <p className="text-gray-400 mb-6 max-w-md">
          Your warranty claim has been created and is now being processed by our
          team.
        </p>
        {createdRecordId && (
          <Card className="bg-gray-900 border border-gray-700 mb-6">
            <CardBody className="p-4">
              <p className="text-gray-400 text-sm mb-1">Claim ID</p>
              <p className="text-white font-mono text-lg">{createdRecordId}</p>
            </CardBody>
          </Card>
        )}
        <p className="text-gray-500 text-sm">Closing automatically...</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Review & Submit</h3>
        <p className="text-gray-400">
          Please review all information before submitting the warranty claim
        </p>
      </div>

      {/* Vehicle Information */}
      {vehicleInfo && (
        <Card className="bg-gray-900 border-2 border-gray-700">
          <CardBody className="p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-gray-400" />
              Vehicle Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">VIN</p>
                  <p className="text-white font-mono text-sm">
                    {vehicleInfo.vin}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Model</p>
                  <p className="text-white">{vehicleInfo.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                  <p className="text-white">{vehicleInfo.company}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">License Plate</p>
                  <p className="text-white font-mono">
                    {vehicleInfo.licensePlate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Purchase Date</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(vehicleInfo.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Place of Manufacture
                  </p>
                  <p className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {vehicleInfo.placeOfManufacture}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Owner Information */}
      {vehicleInfo?.owner && (
        <Card className="bg-gray-900 border-2 border-gray-700">
          <CardBody className="p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Owner Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="text-white">{vehicleInfo.owner.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {vehicleInfo.owner.phone}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {vehicleInfo.owner.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-white text-sm">
                    {vehicleInfo.owner.address}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Odometer & Warranty Status */}
      {odometer !== undefined && (
        <Card className="bg-gray-900 border-2 border-gray-700">
          <CardBody className="p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-gray-400" />
              Odometer & Warranty Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Odometer</p>
                  <p className="text-white text-lg font-semibold">
                    {odometer.toLocaleString()} km
                  </p>
                </div>
                {warrantyCheck && (
                  <Chip
                    size="md"
                    variant="flat"
                    color={
                      warrantyCheck.generalWarrantyDuration.status &&
                      warrantyCheck.generalWarrantyMileage
                        ? "success"
                        : "warning"
                    }
                    startContent={<Shield className="w-4 h-4" />}
                  >
                    {warrantyCheck.generalWarrantyDuration.status &&
                    warrantyCheck.generalWarrantyMileage
                      ? "Warranty Active"
                      : "Partial Coverage"}
                  </Chip>
                )}
              </div>

              {warrantyCheck && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Time Coverage</p>
                    <p className="text-white text-sm">
                      {warrantyCheck.generalWarrantyDuration.status
                        ? `${warrantyCheck.generalWarrantyDuration.remainingDays} days remaining`
                        : "Expired"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Mileage Coverage
                    </p>
                    <p className="text-white text-sm">
                      {warrantyCheck.generalWarrantyMileage
                        ? "Within limit"
                        : "Exceeded"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Warranty Cases */}
      {guaranteeCases.length > 0 && (
        <Card className="bg-gray-900 border-2 border-gray-700">
          <CardBody className="p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Warranty Cases
              <Chip size="sm" variant="flat" color="default">
                {guaranteeCases.length}
              </Chip>
            </h4>
            <div className="space-y-3">
              {guaranteeCases.map((guaranteeCase, index) => (
                <div
                  key={index}
                  className="p-4 bg-black rounded-lg border border-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-sm text-white flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white mb-2">
                        {guaranteeCase.contentGuarantee}
                      </p>
                      {guaranteeCase.description && (
                        <p className="text-gray-400 text-sm">
                          {guaranteeCase.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-red-950/20 border-2 border-red-800">
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-red-500 font-semibold mb-1">
                    Submission Failed
                  </h4>
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Validation Warning */}
      {!canSubmit && (
        <Card className="bg-yellow-950/20 border border-yellow-800">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-500 font-semibold mb-1">
                  Incomplete Information
                </h4>
                <p className="text-yellow-400 text-sm">
                  Please go back and complete all required steps before
                  submitting.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!canSubmit || isSubmitting}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-12 py-6 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          startContent={!isSubmitting && <CheckCircle className="w-5 h-5" />}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting Claim...
            </span>
          ) : (
            "Create Warranty Claim"
          )}
        </Button>
      </div>

      {/* Info */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardBody className="p-4">
          <p className="text-gray-400 text-sm text-center">
            By submitting this claim, you confirm that all information provided
            is accurate and complete. The claim will be reviewed by our
            technical team.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
