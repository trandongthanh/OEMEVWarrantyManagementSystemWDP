"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Gauge,
  CheckCircle,
  AlertTriangle,
  Shield,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { checkVehicleWarranty } from "@/services/vehicleService";
import type { ClaimData, WarrantyCheckResult } from "./types";

interface OdometerStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

export function OdometerStep({ data, onDataChange }: OdometerStepProps) {
  const [odometerInput, setOdometerInput] = useState(
    data.odometer?.toString() || ""
  );
  const [warrantyData, setWarrantyData] = useState<WarrantyCheckResult | null>(
    data.warrantyCheck || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasChecked, setHasChecked] = useState(false);

  const vehicleInfo = data.vehicleInfo;

  useEffect(() => {
    // Auto-validate if odometer already exists
    if (data.odometer && data.warrantyCheck && vehicleInfo) {
      setHasChecked(true);
    }
  }, [data.odometer, data.warrantyCheck, vehicleInfo]);

  const handleCheckWarranty = async () => {
    if (!vehicleInfo) {
      setError("Vehicle information is missing. Please go back to step 1.");
      return;
    }

    const odometer = parseInt(odometerInput);

    if (!odometerInput.trim() || isNaN(odometer)) {
      setError("Please enter a valid odometer reading");
      return;
    }

    if (odometer < 0) {
      setError("Odometer reading cannot be negative");
      return;
    }

    if (odometer > 999999) {
      setError("Odometer reading seems unusually high");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await checkVehicleWarranty(vehicleInfo.vin, odometer);

      if (response.status === "success" && response.data.result) {
        const result = response.data.result;
        setWarrantyData(result);
        setHasChecked(true);

        // Update parent state
        onDataChange({
          odometer: odometer,
          warrantyCheck: result,
        });
      } else if (response.message) {
        setError(response.message);
        setWarrantyData(null);
        onDataChange({
          odometer: undefined,
          warrantyCheck: undefined,
        });
      }
    } catch (err: any) {
      console.error("Warranty check error:", err);

      if (err.response?.status === 404) {
        setError("Vehicle not found or warranty information unavailable");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to check warranty. Please try again.");
      }

      setWarrantyData(null);
      onDataChange({
        odometer: undefined,
        warrantyCheck: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheckWarranty();
    }
  };

  const hasActiveWarranty = warrantyData
    ? warrantyData.generalWarrantyDuration.status &&
      warrantyData.generalWarrantyMileage
    : false;

  const warrantyIssues =
    warrantyData &&
    (!warrantyData.generalWarrantyDuration.status ||
      !warrantyData.generalWarrantyMileage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
            <Gauge className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Odometer Reading</h3>
        <p className="text-gray-400">
          Enter the current odometer reading to verify warranty eligibility
        </p>
      </div>

      {/* Vehicle Summary */}
      {vehicleInfo && (
        <Card className="bg-gray-900 border border-gray-700">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Current Vehicle</p>
                <p className="text-white font-semibold">
                  {vehicleInfo.model} ({vehicleInfo.vin})
                </p>
              </div>
              <Chip size="sm" variant="flat" color="default">
                {vehicleInfo.company}
              </Chip>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Odometer Input */}
      <Card className="bg-gray-900 border-2 border-gray-700">
        <CardBody className="p-6">
          <div className="space-y-4">
            {/* Label */}
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Odometer Reading (km) *
            </label>
            
            {/* Input and Button Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full">
                <Input
                  type="number"
                  placeholder="e.g., 15000"
                  value={odometerInput}
                  onChange={(e) => {
                    setOdometerInput(e.target.value);
                    setError("");
                    setHasChecked(false);
                  }}
                  onKeyPress={handleKeyPress}
                  min="0"
                  max="999999"
                  classNames={{
                    input: "text-white placeholder:text-gray-500",
                    inputWrapper:
                      "bg-black border-2 border-gray-700 data-[hover=true]:border-gray-600 group-data-[focus=true]:border-gray-500 h-12",
                    base: "w-full",
                  }}
                  isDisabled={isLoading}
                  isInvalid={!!error}
                  startContent={
                    <Gauge className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  }
                  endContent={<span className="text-gray-500 text-sm font-medium">km</span>}
                />
              </div>
              <Button
                color="default"
                onPress={handleCheckWarranty}
                isLoading={isLoading}
                isDisabled={!odometerInput || isLoading}
                className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 font-semibold w-full sm:w-auto min-w-[160px] h-12 shadow-md hover:shadow-lg transition-shadow"
                startContent={!isLoading && <Shield className="w-4 h-4" />}
              >
                {isLoading ? "Checking..." : "Check Warranty"}
              </Button>
            </div>

            {/* Helper Text */}
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1 flex-shrink-0"></span>
              <p>
                Odometer reading determines warranty coverage based on mileage limits
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-400">Checking warranty eligibility...</p>
        </motion.div>
      )}

      {/* Warranty Check Results */}
      {warrantyData && !isLoading && hasChecked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Status Header */}
          <Card
            className={`${
              hasActiveWarranty
                ? "bg-green-950/20 border-2 border-green-800"
                : warrantyIssues
                ? "bg-yellow-950/20 border-2 border-yellow-800"
                : "bg-red-950/20 border-2 border-red-800"
            }`}
          >
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                {hasActiveWarranty ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : warrantyIssues ? (
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <h4
                    className={`font-semibold ${
                      hasActiveWarranty
                        ? "text-green-500"
                        : warrantyIssues
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {hasActiveWarranty
                      ? "Warranty Active"
                      : warrantyIssues
                      ? "Partial Warranty Coverage"
                      : "Warranty Expired"}
                  </h4>
                  <p
                    className={`text-sm ${
                      hasActiveWarranty
                        ? "text-green-400"
                        : warrantyIssues
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {hasActiveWarranty
                      ? "Vehicle is eligible for warranty claims"
                      : warrantyIssues
                      ? "Some warranty limitations apply"
                      : "Vehicle warranty has expired"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* General Warranty Info */}
          <Card className="bg-gray-900 border-2 border-gray-700">
            <CardBody className="p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                General Warranty Coverage
              </h4>

              <div className="space-y-4">
                {/* Time-based Warranty */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-1">Time Coverage</p>
                    <p className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {warrantyData.generalWarrantyDuration.status
                        ? `${warrantyData.generalWarrantyDuration.remainingDays} days remaining`
                        : `Expired ${warrantyData.generalWarrantyDuration.remainingDays} days ago`}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      warrantyData.generalWarrantyDuration.status
                        ? "success"
                        : "danger"
                    }
                  >
                    {warrantyData.generalWarrantyDuration.status
                      ? "Active"
                      : "Expired"}
                  </Chip>
                </div>

                {/* Mileage-based Warranty */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-1">
                      Mileage Coverage
                    </p>
                    <p className="text-white flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-gray-500" />
                      Current: {parseInt(odometerInput).toLocaleString()} km
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      warrantyData.generalWarrantyMileage ? "success" : "danger"
                    }
                  >
                    {warrantyData.generalWarrantyMileage
                      ? "Within Limit"
                      : "Exceeded"}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Component Warranties */}
          {warrantyData.componetWarranty &&
            warrantyData.componetWarranty.length > 0 && (
              <Card className="bg-gray-900 border-2 border-gray-700">
                <CardBody className="p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    Component-Specific Warranties
                  </h4>

                  <div className="space-y-3">
                    {warrantyData.componetWarranty.map((component, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">
                            {component.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {component.status
                              ? `${component.remainingDays} days remaining`
                              : `Expired ${component.remainingDays} days ago`}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={component.status ? "success" : "danger"}
                        >
                          {component.status ? "Covered" : "Expired"}
                        </Chip>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

          {/* Next Step Info */}
          <Card className="bg-gray-800/50 border border-gray-700">
            <CardBody className="p-4">
              <p className="text-gray-400 text-sm flex items-start gap-2">
                <Shield className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>
                  Warranty status verified. Click{" "}
                  <span className="text-gray-300 font-medium">
                    Continue to Next Step
                  </span>{" "}
                  to describe the warranty issues.
                </span>
              </p>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
