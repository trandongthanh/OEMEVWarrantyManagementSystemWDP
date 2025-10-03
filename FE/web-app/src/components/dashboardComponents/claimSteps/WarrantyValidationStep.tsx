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
  Clock,
} from "lucide-react";
import type { ClaimData, VehicleInfo } from "./types";

interface WarrantyValidationStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

// Mock VIN database
const MOCK_VEHICLES: Record<string, VehicleInfo> = {
  "1HGBH41JXMN109186": {
    vin: "1HGBH41JXMN109186",
    model: "EV Model X Pro",
    year: "2023",
    purchaseDate: "2023-03-15",
    customer: "John Smith",
    phone: "0901234567",
    email: "john.smith@email.com",
    warrantyStatus: "active",
    warrantyStart: "2023-03-15",
    warrantyEnd: "2028-03-15",
    currentMileage: "15,000 km",
    maxMileage: "100,000 km",
  },
  WVWZZZ21J3W386752: {
    vin: "WVWZZZ21J3W386752",
    model: "EV Compact Plus",
    year: "2022",
    purchaseDate: "2022-01-20",
    customer: "Sarah Johnson",
    phone: "0987654321",
    email: "sarah.johnson@email.com",
    warrantyStatus: "expired",
    warrantyStart: "2022-01-20",
    warrantyEnd: "2025-01-20",
    currentMileage: "85,000 km",
    maxMileage: "100,000 km",
  },
  JF1VA1C69M9820777: {
    vin: "JF1VA1C69M9820777",
    model: "EV Urban Lite",
    year: "2024",
    purchaseDate: "2024-01-10",
    customer: "Michael Davis",
    phone: "0909876543",
    email: "michael.davis@email.com",
    warrantyStatus: "expiring_soon",
    warrantyStart: "2024-01-10",
    warrantyEnd: "2025-02-10",
    currentMileage: "25,000 km",
    maxMileage: "80,000 km",
  },
};

export function WarrantyValidationStep({
  data,
  onDataChange,
}: WarrantyValidationStepProps) {
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

    // Simulate API call
    setTimeout(() => {
      const vehicle = MOCK_VEHICLES[vinInput.toUpperCase()];

      if (vehicle) {
        setVehicleData(vehicle);
        onDataChange({ vehicleInfo: vehicle });
        setError("");
      } else {
        setVehicleData(null);
        setError("Vehicle not found. Please check the VIN and try again.");
      }

      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-12 h-12 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
        >
          <Shield className="w-6 h-6 text-gray-800" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-light text-white tracking-wide">
            Warranty Validation
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Validate vehicle warranty status with precision
          </p>
        </div>
      </div>

      {/* Demo VIN Selection */}
      <div>
        <label className="block text-xs font-medium text-white mb-2">
          Quick Demo VINs
        </label>
        <p className="text-gray-400 text-xs mb-2">
          Click on a demo VIN to automatically verify warranty status:
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(MOCK_VEHICLES).map(([vin, vehicle]) => (
            <Button
              key={vin}
              size="sm"
              variant="bordered"
              isLoading={isLoading && vinInput === vin}
              className={`border-gray-600 text-gray-300 hover:border-white hover:text-white transition-colors ${
                vehicle.warrantyStatus === "active"
                  ? "border-green-600 text-green-400 hover:border-green-400"
                  : vehicle.warrantyStatus === "expiring_soon"
                  ? "border-yellow-600 text-yellow-400 hover:border-yellow-400"
                  : "border-red-600 text-red-400 hover:border-red-400"
              }`}
              spinner={
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              }
              onPress={() => {
                setVinInput(vin);
                // Automatically verify when demo VIN is clicked
                setIsLoading(true);
                setError("");

                setTimeout(() => {
                  setVehicleData(vehicle);
                  onDataChange({ vehicleInfo: vehicle });
                  setIsLoading(false);
                }, 800); // Shorter delay for demo
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{vin.slice(0, 8)}...</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    vehicle.warrantyStatus === "active"
                      ? "success"
                      : vehicle.warrantyStatus === "expiring_soon"
                      ? "warning"
                      : "danger"
                  }
                  className="text-xs"
                >
                  {vehicle.warrantyStatus}
                </Chip>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Manual VIN Input */}
      <div>
        <label className="block text-xs font-medium text-white mb-2">
          Or Enter VIN Manually
        </label>
        <div className="flex gap-3 items-end">
          <Input
            placeholder="Enter 17-digit VIN number (e.g., 1HGBH41JXMN109186)"
            value={vinInput}
            onChange={(e) => setVinInput(e.target.value.toUpperCase())}
            className="flex-1"
            size="md"
            classNames={{
              base: "max-w-full",
              mainWrapper: "h-full",
              input: [
                "bg-gray-900",
                "border-0",
                "text-white",
                "placeholder:text-gray-500",
                "text-sm",
                "font-mono",
                "tracking-wider",
                "outline-none",
                "focus:outline-none",
                "focus:ring-0",
              ],
              inputWrapper: [
                "bg-gray-900/50",
                "border-2",
                vinInput.length === 17 ? "border-gray-300" : "border-gray-700",
                "hover:border-gray-600",
                "focus-within:border-gray-300",
                "!cursor-text",
                "h-12",
                "min-h-12",
                "px-3",
                "transition-all",
                "duration-300",
                "shadow-lg",
                "rounded-xl",
              ],
            }}
            maxLength={17}
            startContent={
              <Search className="text-gray-400 pointer-events-none flex-shrink-0 w-5 h-5 mr-3" />
            }
            endContent={
              vinInput.length > 0 && (
                <span
                  className={`text-xs font-mono font-medium ${
                    vinInput.length === 17 ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {vinInput.length}/17
                </span>
              )
            }
          />
          <Button
            onPress={handleVinLookup}
            isLoading={isLoading}
            size="md"
            className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 hover:from-gray-300 hover:to-gray-400 px-6 font-medium h-12 min-w-24 rounded-xl shadow-lg transition-all duration-300"
            spinner={
              <div className="w-3 h-3 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin" />
            }
          >
            {isLoading ? "" : "Verify"}
          </Button>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          VIN format: 17 characters (letters and numbers) • Example:
          1HGBH41JXMN109186
        </p>
      </div>

      {/* Verification Results */}
      {vehicleData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardBody className="p-4">
              {/* Warranty Status Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      vehicleData.warrantyStatus === "active"
                        ? "bg-green-500/10"
                        : vehicleData.warrantyStatus === "expired"
                        ? "bg-red-500/10"
                        : "bg-yellow-500/10"
                    }`}
                  >
                    <Shield
                      className={`w-5 h-5 ${
                        vehicleData.warrantyStatus === "active"
                          ? "text-green-500"
                          : vehicleData.warrantyStatus === "expired"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      {vehicleData.model}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {vehicleData.year} • VIN: {vehicleData.vin}
                    </p>
                  </div>
                </div>

                <Chip
                  color={
                    vehicleData.warrantyStatus === "active"
                      ? "success"
                      : vehicleData.warrantyStatus === "expired"
                      ? "danger"
                      : "warning"
                  }
                  variant="flat"
                  startContent={
                    vehicleData.warrantyStatus === "active" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : vehicleData.warrantyStatus === "expired" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )
                  }
                  className="capitalize"
                >
                  {vehicleData.warrantyStatus === "expiring_soon"
                    ? "Expiring Soon"
                    : vehicleData.warrantyStatus}
                </Chip>
              </div>

              {/* Vehicle Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-white text-sm mb-2 pb-2 border-b border-gray-800">
                    Customer Information
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">
                        Customer Name
                      </label>
                      <p className="text-white text-sm font-medium">
                        {vehicleData.customer}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-white text-sm">{vehicleData.phone}</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">
                        Email Address
                      </label>
                      <p className="text-white text-sm">{vehicleData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Warranty Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-white text-sm mb-2 pb-2 border-b border-gray-800">
                    Warranty Details
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">
                        Purchase Date
                      </label>
                      <p className="text-white text-sm">
                        {vehicleData.purchaseDate}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">
                        Warranty Period
                      </label>
                      <p className="text-white text-sm">
                        {vehicleData.warrantyStart} - {vehicleData.warrantyEnd}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">
                        Current Mileage
                      </label>
                      <p className="text-white text-sm">
                        {vehicleData.currentMileage} / {vehicleData.maxMileage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  vehicleData.warrantyStatus === "active"
                    ? "bg-green-500/5 border-green-500/20 text-green-400"
                    : vehicleData.warrantyStatus === "expired"
                    ? "bg-red-500/5 border-red-500/20 text-red-400"
                    : "bg-yellow-500/5 border-yellow-500/20 text-yellow-400"
                }`}
              >
                <p className="text-xs">
                  {vehicleData.warrantyStatus === "active" &&
                    "✓ This vehicle is eligible for warranty claims. You can proceed to the next step."}
                  {vehicleData.warrantyStatus === "expired" &&
                    "⚠ This vehicle's warranty has expired. Claims may not be covered."}
                  {vehicleData.warrantyStatus === "expiring_soon" &&
                    "⏰ This vehicle's warranty is expiring soon. Please proceed quickly."}
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-400 w-4 h-4 flex-shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
