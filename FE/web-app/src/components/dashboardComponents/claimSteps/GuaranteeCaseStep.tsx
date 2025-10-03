"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import {
  Shield,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Wrench,
  DollarSign,
} from "lucide-react";
import type { ClaimData } from "./types";

// Mock technician data for report handler selection
const MOCK_TECHNICIANS = [
  {
    id: "tech1",
    name: "Vo Thi Mai",
    specialization: "General Diagnostics",
  },
  {
    id: "tech2",
    name: "Pham Van Nam",
    specialization: "Electronics & Software",
  },
  {
    id: "tech3",
    name: "Robert Thompson",
    specialization: "Battery Systems",
  },
  {
    id: "tech4",
    name: "Sarah Miller",
    specialization: "Motor & Drivetrain",
  },
  {
    id: "tech5",
    name: "David Chen",
    specialization: "Charging Systems",
  },
];

interface GuaranteeCaseStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

interface ReplacementPart {
  id: string;
  name: string;
  partNumber: string;
  estimatedCost: string;
  warrantyCoverage: "full" | "partial" | "none";
  priority: "high" | "medium" | "low";
}

const WARRANTY_TYPES = [
  {
    key: "manufacturer",
    label: "Manufacturer Warranty",
    description: "Original equipment manufacturer coverage",
    coverage: "Full coverage for defects in materials and workmanship",
  },
  {
    key: "extended",
    label: "Extended Warranty",
    description: "Additional coverage beyond manufacturer warranty",
    coverage: "Extended protection for major components",
  },
  {
    key: "powertrain",
    label: "Powertrain Warranty",
    description: "Coverage for engine and transmission",
    coverage: "Protection for engine, transmission, and drivetrain components",
  },
  {
    key: "goodwill",
    label: "Goodwill Warranty",
    description: "Dealer goodwill or special consideration",
    coverage: "Special cases requiring management approval",
  },
  {
    key: "recall",
    label: "Recall/Service Campaign",
    description: "Manufacturer recall or service campaign",
    coverage: "Free repairs for known issues",
  },
];

const COMMON_PARTS = [
  "Battery Pack",
  "Motor Controller",
  "Charging Port",
  "Onboard Charger",
  "DC-DC Converter",
  "High Voltage Cables",
  "Thermal Management System",
  "Brake System",
  "Suspension Components",
  "Infotainment System",
  "Sensor Array",
  "Tire Pressure Monitoring",
  "Air Conditioning Compressor",
  "Power Steering",
  "Regenerative Braking System",
];

export function GuaranteeCaseStep({
  data,
  onDataChange,
}: GuaranteeCaseStepProps) {
  const [warrantyType, setWarrantyType] = useState(data.warrantyType || "");
  const [replacementParts, setReplacementParts] = useState<ReplacementPart[]>(
    data.replacementParts || []
  );
  const [selectedPart, setSelectedPart] = useState("");
  const [customPart, setCustomPart] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [reportAssignee, setReportAssignee] = useState(
    data.reportAssignee || ""
  );
  const [odometerReading, setOdometerReading] = useState(
    data.odometerReading || ""
  );

  const handleWarrantyTypeChange = (value: string) => {
    setWarrantyType(value);
    onDataChange({ warrantyType: value });
  };

  const addReplacementPart = () => {
    const partName = selectedPart || customPart;
    if (!partName.trim()) return;

    const newPart: ReplacementPart = {
      id: Date.now().toString(),
      name: partName,
      partNumber: partNumber || "TBD",
      estimatedCost: estimatedCost || "TBD",
      warrantyCoverage: "full",
      priority: "medium",
    };

    const updatedParts = [...replacementParts, newPart];
    setReplacementParts(updatedParts);
    onDataChange({ replacementParts: updatedParts });

    // Reset form
    setSelectedPart("");
    setCustomPart("");
    setPartNumber("");
    setEstimatedCost("");
  };

  const removePart = (partId: string) => {
    const updatedParts = replacementParts.filter((part) => part.id !== partId);
    setReplacementParts(updatedParts);
    onDataChange({ replacementParts: updatedParts });
  };

  const updatePartCoverage = (
    partId: string,
    coverage: "full" | "partial" | "none"
  ) => {
    const updatedParts = replacementParts.map((part) =>
      part.id === partId ? { ...part, warrantyCoverage: coverage } : part
    );
    setReplacementParts(updatedParts);
    onDataChange({ replacementParts: updatedParts });
  };

  const handleReportAssigneeChange = (value: string) => {
    setReportAssignee(value);
    onDataChange({ reportAssignee: value });
  };

  const handleOdometerReadingChange = (value: string) => {
    setOdometerReading(value);
    onDataChange({ odometerReading: value });
  };

  const getSelectedWarrantyInfo = () => {
    return WARRANTY_TYPES.find((type) => type.key === warrantyType);
  };

  const getTotalEstimatedCost = () => {
    return replacementParts
      .reduce((total, part) => {
        const cost =
          parseFloat(part.estimatedCost.replace(/[^0-9.-]+/g, "")) || 0;
        return total + cost;
      }, 0)
      .toLocaleString();
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
            Warranty Case & Parts
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Select warranty type and specify parts requiring replacement
          </p>
        </div>
      </div>

      {/* Report Assignment */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Report Handler Assignment
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Assign a team member to handle the warranty claim report and
              documentation
            </p>
            <Select
              placeholder="Select report handler..."
              selectedKeys={reportAssignee ? [reportAssignee] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                handleReportAssigneeChange(value);
              }}
              size="lg"
              classNames={{
                trigger: [
                  "bg-gray-900",
                  "border",
                  "border-gray-700",
                  "hover:border-gray-600",
                  "focus:border-gray-600",
                  "h-14",
                  "transition-colors",
                  "duration-200",
                  "pl-4",
                  "pr-12",
                ],
                value: "text-white text-base truncate",
                selectorIcon: "text-gray-400",
                listbox: "bg-gray-900 border-gray-700",
                popoverContent:
                  "bg-gray-900 border border-gray-700 backdrop-blur-sm rounded-lg shadow-xl",
                listboxWrapper: "max-h-60",
              }}
            >
              {MOCK_TECHNICIANS.map((tech) => (
                <SelectItem key={tech.id} textValue={tech.name}>
                  <div className="py-2">
                    <div className="font-medium text-white">{tech.name}</div>
                    <div className="text-xs text-gray-400">
                      {tech.specialization}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Odometer Reading */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Current Odometer Reading
              <span className="text-red-400 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Enter the current mileage reading from the vehicle&apos;s odometer
            </p>
            <Input
              placeholder="e.g., 25000"
              value={odometerReading}
              onChange={(e) => handleOdometerReadingChange(e.target.value)}
              type="number"
              size="lg"
              endContent={
                <div className="text-sm text-gray-400 font-medium">km</div>
              }
              classNames={{
                inputWrapper: [
                  "bg-gray-900",
                  "border",
                  "border-gray-700",
                  "hover:border-gray-600",
                  "focus-within:!border-gray-300",
                  "h-14",
                  "transition-all",
                  "duration-300",
                  "shadow-lg",
                ],
                input: [
                  "text-white",
                  "placeholder:text-gray-500",
                  "text-base",
                  "font-light",
                ],
              }}
            />
            <div className="text-xs text-gray-500">
              This reading will be verified against warranty eligibility
              requirements
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Warranty Eligibility Check */}
      {odometerReading && data.vehicleInfo && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardBody className="p-4">
            <h5 className="text-sm font-medium text-blue-300 mb-3">
              Warranty Eligibility Check
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-200">Current Odometer:</span>
                <span className="text-sm font-medium text-white">
                  {parseInt(odometerReading).toLocaleString()} km
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-200">Warranty Limit:</span>
                <span className="text-sm font-medium text-white">
                  {data.vehicleInfo.maxMileage}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-200">Status:</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    parseInt(odometerReading) <=
                    parseInt(data.vehicleInfo.maxMileage.replace(/[^0-9]/g, ""))
                      ? "success"
                      : "danger"
                  }
                  className="text-xs"
                >
                  {parseInt(odometerReading) <=
                  parseInt(data.vehicleInfo.maxMileage.replace(/[^0-9]/g, ""))
                    ? "Eligible"
                    : "Not Eligible"}
                </Chip>
              </div>
              {parseInt(odometerReading) >
                parseInt(
                  data.vehicleInfo.maxMileage.replace(/[^0-9]/g, "")
                ) && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400">
                    ⚠️ Vehicle has exceeded warranty mileage limit. Claim may
                    not be covered.
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Warranty Type Selection */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Warranty Type
              <span className="text-red-400 ml-1">*</span>
            </label>
            <Select
              placeholder="Choose the applicable warranty type..."
              selectedKeys={warrantyType ? [warrantyType] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                handleWarrantyTypeChange(value);
              }}
              size="lg"
              classNames={{
                trigger: [
                  "bg-gray-900",
                  "border",
                  "border-gray-700",
                  "hover:border-gray-600",
                  "focus:border-gray-600",
                  "h-14",
                  "transition-colors",
                  "duration-200",
                  "pl-4",
                  "pr-12",
                ],
                value: "text-white text-base truncate",
                selectorIcon: "text-gray-400",
                listbox: "bg-gray-900 border-gray-700",
                popoverContent:
                  "bg-gray-900 border border-gray-700 backdrop-blur-sm rounded-lg shadow-xl",
                listboxWrapper: "max-h-60",
              }}
            >
              {WARRANTY_TYPES.map((type) => (
                <SelectItem
                  key={type.key}
                  textValue={type.label}
                  classNames={{
                    base: [
                      "hover:bg-gray-800",
                      "data-[selected=true]:bg-gray-800",
                      "rounded-md",
                      "my-1",
                      "mx-1",
                    ],
                  }}
                >
                  <div className="py-3">
                    <div className="font-medium text-white">{type.label}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      {type.description}
                    </div>
                    <div className="text-xs text-blue-400">{type.coverage}</div>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {warrantyType && getSelectedWarrantyInfo() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-white font-medium">
                      {getSelectedWarrantyInfo()!.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getSelectedWarrantyInfo()!.coverage}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Parts Replacement Section */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Parts Requiring Replacement
                </h4>
                <p className="text-xs text-gray-400">
                  Add all parts that need to be replaced for this warranty claim
                </p>
              </div>
              {replacementParts.length > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-blue-500/20 text-blue-300"
                >
                  {replacementParts.length} part
                  {replacementParts.length !== 1 ? "s" : ""}
                </Chip>
              )}
            </div>

            {/* Add Part Form */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  Part Name
                </label>
                <Select
                  placeholder="Select common part..."
                  selectedKeys={selectedPart ? [selectedPart] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setSelectedPart(value);
                    setCustomPart(""); // Clear custom if selecting from list
                  }}
                  size="sm"
                  classNames={{
                    trigger: [
                      "bg-gray-900",
                      "border",
                      "border-gray-600",
                      "hover:border-gray-500",
                      "h-10",
                    ],
                    value: "text-white text-sm",
                    selectorIcon: "text-gray-400",
                    listbox: "bg-gray-900 border-gray-700",
                    popoverContent: "bg-gray-900 border border-gray-700",
                    listboxWrapper: "max-h-48",
                  }}
                >
                  {COMMON_PARTS.map((part) => (
                    <SelectItem key={part} textValue={part}>
                      {part}
                    </SelectItem>
                  ))}
                </Select>

                <div className="text-center text-xs text-gray-500 py-1">or</div>

                <Input
                  placeholder="Enter custom part name..."
                  value={customPart}
                  onChange={(e) => {
                    setCustomPart(e.target.value);
                    setSelectedPart(""); // Clear selection if typing custom
                  }}
                  size="sm"
                  classNames={{
                    inputWrapper: [
                      "bg-gray-900",
                      "border",
                      "border-gray-600",
                      "hover:border-gray-500",
                      "h-10",
                    ],
                    input: [
                      "text-white",
                      "text-sm",
                      "placeholder:text-gray-500",
                    ],
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Part Number
                    </label>
                    <Input
                      placeholder="Optional"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      size="sm"
                      classNames={{
                        inputWrapper: [
                          "bg-gray-900",
                          "border",
                          "border-gray-600",
                          "hover:border-gray-500",
                          "h-10",
                        ],
                        input: [
                          "text-white",
                          "text-sm",
                          "placeholder:text-gray-500",
                        ],
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Est. Cost
                    </label>
                    <Input
                      placeholder="0.00"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      size="sm"
                      startContent={
                        <DollarSign className="w-3 h-3 text-gray-400" />
                      }
                      classNames={{
                        inputWrapper: [
                          "bg-gray-900",
                          "border",
                          "border-gray-600",
                          "hover:border-gray-500",
                          "h-10",
                        ],
                        input: [
                          "text-white",
                          "text-sm",
                          "placeholder:text-gray-500",
                        ],
                      }}
                    />
                  </div>
                </div>

                <Button
                  onPress={addReplacementPart}
                  size="sm"
                  className="w-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 hover:from-gray-300 hover:to-gray-400"
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Add Part
                </Button>
              </div>
            </div>

            {/* Parts List */}
            {replacementParts.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-white">
                  Selected Parts ({replacementParts.length})
                </h5>
                {replacementParts.map((part) => (
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {part.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Part #: {part.partNumber} • Est. Cost: $
                            {part.estimatedCost}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        size="sm"
                        selectedKeys={[part.warrantyCoverage]}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0] as
                            | "full"
                            | "partial"
                            | "none";
                          updatePartCoverage(part.id, value);
                        }}
                        classNames={{
                          trigger: "h-8 bg-gray-800 border-gray-600",
                          value: "text-xs",
                        }}
                      >
                        <SelectItem key="full" textValue="Full Coverage">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-xs">Full Coverage</span>
                          </div>
                        </SelectItem>
                        <SelectItem key="partial" textValue="Partial Coverage">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs">Partial Coverage</span>
                          </div>
                        </SelectItem>
                        <SelectItem key="none" textValue="No Coverage">
                          <div className="flex items-center gap-2">
                            <X className="w-3 h-3 text-red-400" />
                            <span className="text-xs">No Coverage</span>
                          </div>
                        </SelectItem>
                      </Select>

                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        className="text-red-400 hover:text-red-300"
                        onPress={() => removePart(part.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Business Rules & Guidelines */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardBody className="p-4">
          <h5 className="text-sm font-medium text-blue-300 mb-3">
            Warranty Claim Business Rules
          </h5>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-blue-200">
            <div>
              <h6 className="font-medium mb-2">Coverage Requirements:</h6>
              <ul className="space-y-1 text-gray-400">
                <li>• Vehicle must be within warranty period</li>
                <li>• Issue must be covered under selected warranty type</li>
                <li>• Parts must be genuine or approved equivalents</li>
                <li>• Labor costs included for covered repairs</li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium mb-2">Approval Process:</h6>
              <ul className="space-y-1 text-gray-400">
                <li>• Claims under $500 auto-approved</li>
                <li>• Claims $500-$2000 require supervisor approval</li>
                <li>• Claims over $2000 require manager approval</li>
                <li>• Goodwill claims always require special approval</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      {(warrantyType ||
        replacementParts.length > 0 ||
        reportAssignee ||
        odometerReading) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-green-500/5 border-green-500/20">
            <CardBody className="p-4">
              <h5 className="text-sm font-medium text-green-300 mb-3">
                Warranty Case Summary
              </h5>
              <div className="space-y-2 text-sm">
                {reportAssignee && (
                  <div>
                    <span className="text-gray-400">Report Handler:</span>
                    <span className="text-white ml-2 capitalize">
                      {reportAssignee.replace("-", " ")}
                    </span>
                  </div>
                )}
                {odometerReading && (
                  <div>
                    <span className="text-gray-400">Odometer Reading:</span>
                    <span className="text-white ml-2">
                      {odometerReading} km
                    </span>
                  </div>
                )}
                {warrantyType && (
                  <div>
                    <span className="text-gray-400">Warranty Type:</span>
                    <span className="text-white ml-2">
                      {getSelectedWarrantyInfo()?.label}
                    </span>
                  </div>
                )}
                {replacementParts.length > 0 && (
                  <div>
                    <span className="text-gray-400">Parts to Replace:</span>
                    <span className="text-white ml-2">
                      {replacementParts.length} part
                      {replacementParts.length !== 1 ? "s" : ""}
                    </span>
                    <div className="text-xs text-gray-500 ml-2">
                      Total Est. Cost: ${getTotalEstimatedCost()}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
