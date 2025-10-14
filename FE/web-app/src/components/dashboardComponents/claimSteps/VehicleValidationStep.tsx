"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Shield,
  Search,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  Loader2,
} from "lucide-react";
import { findVehicleByVin } from "@/services/vehicleService";
import type { ClaimData, VehicleInfo } from "./types";

interface VehicleValidationStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

export function VehicleValidationStep({
  data,
  onDataChange,
}: VehicleValidationStepProps) {
  const [vinInput, setVinInput] = useState(data.vehicleInfo?.vin || "");
  const [vehicleData, setVehicleData] = useState<VehicleInfo | null>(
    data.vehicleInfo || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleVinLookup = async () => {
    if (!vinInput.trim()) {
      setError("Please enter a VIN number");
      return;
    }

    if (vinInput.length !== 17) {
      setError("VIN must be exactly 17 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await findVehicleByVin(vinInput.toUpperCase());

      if (response.status === "success" && response.data.vehicle) {
        const vehicle = response.data.vehicle;

        // Check if vehicle has an owner
        if (!vehicle.owner) {
          setError(
            "Vehicle found but has no registered owner. Please register the owner first."
          );
          setVehicleData(null);
          onDataChange({ vehicleInfo: undefined });
          return;
        }

        const vehicleInfo: VehicleInfo = {
          vin: vehicle.vin,
          dateOfManufacture: vehicle.dateOfManufacture,
          placeOfManufacture: vehicle.placeOfManufacture,
          licensePlate: vehicle.licensePlate || "",
          purchaseDate: vehicle.purchaseDate || "",
          model: vehicle.model,
          company: vehicle.company,
          owner: vehicle.owner,
        };

        setVehicleData(vehicleInfo);
        onDataChange({ vehicleInfo });
      } else if (response.message) {
        setError(response.message);
        setVehicleData(null);
        onDataChange({ vehicleInfo: undefined });
      }
    } catch (err: any) {
      console.error("VIN lookup error:", err);

      if (err.response?.status === 404) {
        setError("Vehicle not found in the system");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this vehicle");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to lookup vehicle. Please try again.");
      }

      setVehicleData(null);
      onDataChange({ vehicleInfo: undefined });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVinLookup();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Vehicle Verification
        </h3>
        <p className="text-gray-400">
          Enter the 17-character VIN to verify warranty eligibility
        </p>
      </div>

      {/* VIN Input Section */}
      <Card className="bg-gray-900 border-2 border-gray-700">
        <CardBody className="p-6">
          <div className="space-y-4">
            {/* Label */}
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle Identification Number (VIN) *
            </label>
            
            {/* Input and Button Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="e.g., 1HGBH41JXMN109186"
                  value={vinInput}
                  onChange={(e) => {
                    setVinInput(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyPress={handleKeyPress}
                  maxLength={17}
                  classNames={{
                    input: "text-white uppercase placeholder:text-gray-500",
                    inputWrapper:
                      "bg-black border-2 border-gray-700 data-[hover=true]:border-gray-600 group-data-[focus=true]:border-gray-500 h-12",
                    base: "w-full",
                  }}
                  isDisabled={isLoading}
                  isInvalid={!!error && !vehicleData}
                  startContent={
                    <Car className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  }
                />
              </div>
              <Button
                color="default"
                onPress={handleVinLookup}
                isLoading={isLoading}
                isDisabled={vinInput.length !== 17 || isLoading}
                className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 font-semibold w-full sm:w-auto min-w-[140px] h-12 shadow-md hover:shadow-lg transition-shadow"
                startContent={!isLoading && <Search className="w-4 h-4" />}
              >
                {isLoading ? "Searching..." : "Verify VIN"}
              </Button>
            </div>

            {/* Character Counter & Hint */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs">
              <span className="text-gray-500 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                VIN must be exactly 17 characters
              </span>
              <span
                className={`font-medium ${
                  vinInput.length === 17 
                    ? "text-green-500" 
                    : vinInput.length > 0
                    ? "text-yellow-500"
                    : "text-gray-500"
                }`}
              >
                {vinInput.length}/17 characters
              </span>
            </div>

            {/* Error Message */}
            {error && !vehicleData && (
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
          <p className="text-gray-400">Searching for vehicle...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && !vehicleData && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-red-950/20 border-2 border-red-800">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-red-500 font-semibold mb-1">
                    Verification Failed
                  </h4>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Vehicle Data Display */}
      {vehicleData && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Success Header */}
          <Card className="bg-green-950/20 border-2 border-green-800">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <h4 className="text-green-500 font-semibold">
                    Vehicle Verified Successfully
                  </h4>
                  <p className="text-green-400 text-sm">
                    Vehicle found with registered owner
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Vehicle Information */}
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
                      {vehicleData.vin}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Model</p>
                    <p className="text-white font-medium">
                      {vehicleData.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                    <p className="text-white">{vehicleData.company}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License Plate</p>
                    <p className="text-white font-mono">
                      {vehicleData.licensePlate || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Manufacture Date
                    </p>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {new Date(
                        vehicleData.dateOfManufacture
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Purchase Date</p>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {vehicleData.purchaseDate
                        ? new Date(
                            vehicleData.purchaseDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Place of Manufacture
                    </p>
                    <p className="text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {vehicleData.placeOfManufacture}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Owner Information */}
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
                    <p className="text-white font-medium">
                      {vehicleData.owner.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {vehicleData.owner.phone}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {vehicleData.owner.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-white flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="flex-1">
                        {vehicleData.owner.address}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Next Step Info */}
          <Card className="bg-gray-800/50 border border-gray-700">
            <CardBody className="p-4">
              <p className="text-gray-400 text-sm flex items-start gap-2">
                <Shield className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>
                  Vehicle verified successfully. Click{" "}
                  <span className="text-gray-300 font-medium">
                    Continue to Next Step
                  </span>{" "}
                  to proceed with odometer reading and warranty validation.
                </span>
              </p>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
