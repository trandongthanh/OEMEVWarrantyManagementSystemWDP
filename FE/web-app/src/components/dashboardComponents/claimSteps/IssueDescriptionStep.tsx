"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { FileText } from "lucide-react";
import type { ClaimData } from "./types";

interface IssueDescriptionStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

const ISSUE_TYPES = [
  {
    key: "battery",
    label: "Battery System",
    description: "Battery charging issues, capacity problems",
  },
  {
    key: "motor",
    label: "Motor & Drivetrain",
    description: "Motor performance, drivetrain issues",
  },
  {
    key: "electronics",
    label: "Electronics & Software",
    description: "Infotainment, sensors, software bugs",
  },
  {
    key: "charging",
    label: "Charging System",
    description: "Charging port, cable, connector issues",
  },
  {
    key: "hvac",
    label: "Climate Control",
    description: "Air conditioning, heating system",
  },
  {
    key: "braking",
    label: "Braking System",
    description: "Regenerative braking, brake pads",
  },
  {
    key: "suspension",
    label: "Suspension & Steering",
    description: "Suspension components, steering issues",
  },
  {
    key: "body",
    label: "Body & Interior",
    description: "Doors, windows, interior components",
  },
  {
    key: "lighting",
    label: "Lighting System",
    description: "Headlights, taillights, indicators",
  },
  {
    key: "other",
    label: "Other Issues",
    description: "Issues not covered in other categories",
  },
];

export function IssueDescriptionStep({
  data,
  onDataChange,
}: IssueDescriptionStepProps) {
  const [selectedIssueType, setSelectedIssueType] = useState(
    data.issueType || ""
  );
  const [description, setDescription] = useState(data.description || "");

  const handleIssueTypeChange = (value: string) => {
    setSelectedIssueType(value);
    onDataChange({ issueType: value });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onDataChange({ description: value });
  };

  const getSelectedIssueInfo = () => {
    return ISSUE_TYPES.find((type) => type.key === selectedIssueType);
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
          <FileText className="w-6 h-6 text-gray-800" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-light text-white tracking-wide">
            Issue Description
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Describe the problem with precise detail
          </p>
        </div>
      </div>

      {/* Vehicle Info Summary */}
      {data.vehicleInfo && (
        <Card className="bg-gray-900 border-gray-800">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">
                  {data.vehicleInfo.model} ({data.vehicleInfo.year})
                </h4>
                <p className="text-xs text-gray-400">
                  VIN: {data.vehicleInfo.vin}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">
                  {data.vehicleInfo.customer}
                </p>
                <p className="text-xs text-green-400">
                  {data.vehicleInfo.warrantyStatus}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Issue Type Selection */}
      <Card className="bg-gray-900 border-gray-800">
        <CardBody className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Issue Category
            </label>
            <Select
              placeholder="Choose the category that best describes your issue..."
              selectedKeys={selectedIssueType ? [selectedIssueType] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                handleIssueTypeChange(value);
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
              {ISSUE_TYPES.map((type) => (
                <SelectItem
                  key={type.key}
                  textValue={type.label}
                  classNames={{
                    base: [
                      "hover:bg-gray-800",
                      "data-[selected=true]:bg-gray-800",
                      "data-[focus=true]:bg-gray-800",
                      "rounded-md",
                      "my-1",
                      "mx-1",
                    ],
                  }}
                >
                  <div className="py-1">
                    <div className="font-medium text-white">{type.label}</div>
                    <div className="text-xs text-gray-400">
                      {type.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {selectedIssueType && getSelectedIssueInfo() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-lg"
              >
                <div className="text-sm text-white font-medium">
                  {getSelectedIssueInfo()!.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {getSelectedIssueInfo()!.description}
                </div>
              </motion.div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Detailed Description */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Detailed Description
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              placeholder="Please provide a detailed description of the issue you're experiencing. Include:

• When did you first notice the problem?
• What symptoms are you experiencing?
• Have you tried any troubleshooting steps?
• Are there any specific conditions when the issue occurs?
• Any error messages or warning lights?

The more details you provide, the better our technicians can assist you."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={8}
              maxLength={2000}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-white focus:outline-none resize-none transition-colors duration-200 text-base leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-gray-400">
                💡 Tip: The more details you provide, the faster we can resolve
                your issue
              </span>
              <span
                className={`font-mono ${
                  description.length > 1800
                    ? "text-yellow-400"
                    : description.length > 1950
                    ? "text-red-400"
                    : "text-gray-500"
                }`}
              >
                {description.length}/2000
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Issue Guidelines */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardBody className="p-4">
          <h5 className="text-sm font-medium text-blue-300 mb-3">
            Guidelines for Better Descriptions
          </h5>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-blue-200">
            <div>
              <h6 className="font-medium mb-2">Include:</h6>
              <ul className="space-y-1 text-gray-400">
                <li>• When the issue first occurred</li>
                <li>• Frequency and conditions</li>
                <li>• Error messages or codes</li>
                <li>• Steps to reproduce</li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium mb-2">Avoid:</h6>
              <ul className="space-y-1 text-gray-400">
                <li>• Vague descriptions</li>
                <li>• Personal opinions</li>
                <li>• Unrelated information</li>
                <li>• Technical assumptions</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Preview */}
      {selectedIssueType && description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-green-500/5 border-green-500/20">
            <CardBody className="p-4">
              <h5 className="text-sm font-medium text-green-300 mb-3">
                Issue Summary
              </h5>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-400">Category:</span>
                  <span className="text-sm text-white ml-2">
                    {getSelectedIssueInfo()?.label}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Description:</span>
                  <p className="text-sm text-white mt-1 line-clamp-3">
                    {description}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
