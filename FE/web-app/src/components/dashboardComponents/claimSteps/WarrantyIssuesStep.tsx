"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  CheckCircle,
} from "lucide-react";
import type { ClaimData, GuaranteeCaseInput } from "./types";

interface WarrantyIssuesStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

export function WarrantyIssuesStep({
  data,
  onDataChange,
}: WarrantyIssuesStepProps) {
  const [guaranteeCases, setGuaranteeCases] = useState<GuaranteeCaseInput[]>(
    data.guaranteeCases && data.guaranteeCases.length > 0
      ? data.guaranteeCases
      : [{ contentGuarantee: "", description: "" }]
  );

  const vehicleInfo = data.vehicleInfo;
  const warrantyCheck = data.warrantyCheck;

  const handleCaseChange = (
    index: number,
    field: keyof GuaranteeCaseInput,
    value: string
  ) => {
    const updated = [...guaranteeCases];
    updated[index] = { ...updated[index], [field]: value };
    setGuaranteeCases(updated);
    onDataChange({ guaranteeCases: updated });
  };

  const handleAddCase = () => {
    const updated = [
      ...guaranteeCases,
      { contentGuarantee: "", description: "" },
    ];
    setGuaranteeCases(updated);
    onDataChange({ guaranteeCases: updated });
  };

  const handleRemoveCase = (index: number) => {
    if (guaranteeCases.length > 1) {
      const updated = guaranteeCases.filter((_, i) => i !== index);
      setGuaranteeCases(updated);
      onDataChange({ guaranteeCases: updated });
    }
  };

  const isValid = guaranteeCases.every(
    (c) => c.contentGuarantee.trim().length > 0
  );
  const hasMultipleCases = guaranteeCases.length > 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Warranty Issues</h3>
        <p className="text-gray-400">
          Describe the issues covered under warranty
        </p>
      </div>

      {/* Vehicle & Warranty Summary */}
      {vehicleInfo && (
        <Card className="bg-gray-900 border border-gray-700">
          <CardBody className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-gray-400 text-xs mb-1">Vehicle</p>
                <p className="text-white font-semibold">
                  {vehicleInfo.model} ({vehicleInfo.vin})
                </p>
              </div>
              {data.odometer && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Odometer</p>
                  <p className="text-white font-mono">
                    {data.odometer.toLocaleString()} km
                  </p>
                </div>
              )}
              {warrantyCheck && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    warrantyCheck.generalWarrantyDuration.status &&
                    warrantyCheck.generalWarrantyMileage
                      ? "success"
                      : "warning"
                  }
                  startContent={<Shield className="w-3 h-3" />}
                >
                  {warrantyCheck.generalWarrantyDuration.status &&
                  warrantyCheck.generalWarrantyMileage
                    ? "Warranty Active"
                    : "Partial Coverage"}
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-950/20 border border-blue-800">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-blue-500 font-semibold mb-1">
                Multiple Issues Supported
              </h4>
              <p className="text-blue-400 text-sm">
                You can add multiple warranty cases if the vehicle has several
                issues. Each issue will be tracked separately for diagnosis and
                repair.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Guarantee Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Warranty Cases
            <Chip size="sm" variant="flat" color="default">
              {guaranteeCases.length}
            </Chip>
          </h4>
          <Button
            size="sm"
            variant="flat"
            color="default"
            onPress={handleAddCase}
            startContent={<Plus className="w-4 h-4" />}
            className="text-gray-300 hover:text-white"
          >
            Add Another Issue
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {guaranteeCases.map((guaranteeCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-900 border-2 border-gray-700">
                <CardBody className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h5 className="text-white font-medium flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        Warranty Case #{index + 1}
                      </h5>
                      {guaranteeCases.length > 1 && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => handleRemoveCase(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Issue Description (Required) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Issue Description *
                      </label>
                      <Textarea
                        placeholder="Describe the issue: What's wrong? When did it start? How often does it happen? Include any error messages or unusual behaviors."
                        value={guaranteeCase.contentGuarantee}
                        onChange={(e) =>
                          handleCaseChange(
                            index,
                            "contentGuarantee",
                            e.target.value
                          )
                        }
                        minRows={4}
                        maxRows={10}
                        isRequired
                        classNames={{
                          input: "text-white placeholder:text-gray-500",
                          inputWrapper:
                            "bg-black border-2 border-gray-700 data-[hover=true]:border-gray-600 group-data-[focus=true]:border-gray-500",
                        }}
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Required field - Be as detailed as possible</span>
                        <span className={`font-medium ${
                          guaranteeCase.contentGuarantee.length > 900 
                            ? "text-yellow-500" 
                            : guaranteeCase.contentGuarantee.length > 0
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}>
                          {guaranteeCase.contentGuarantee.length}/1000 characters
                        </span>
                      </div>
                    </div>

                    {/* Additional Notes (Optional) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <Textarea
                        placeholder="Any other details, symptoms, or observations that might be helpful"
                        value={guaranteeCase.description || ""}
                        onChange={(e) =>
                          handleCaseChange(index, "description", e.target.value)
                        }
                        minRows={3}
                        maxRows={6}
                        classNames={{
                          input: "text-white placeholder:text-gray-500",
                          inputWrapper:
                            "bg-black border border-gray-700 data-[hover=true]:border-gray-600 group-data-[focus=true]:border-gray-500",
                        }}
                        maxLength={500}
                      />
                      <div className="flex justify-end text-xs">
                        <span className="text-gray-500">
                          {guaranteeCase.description?.length || 0}/500 characters
                        </span>
                      </div>
                    </div>

                    {/* Validation Indicator */}
                    {guaranteeCase.contentGuarantee.trim().length > 0 && (
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Case description provided</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Validation Summary */}
      {!isValid && (
        <Card className="bg-yellow-950/20 border border-yellow-800">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-500 font-semibold mb-1">
                  Incomplete Information
                </h4>
                <p className="text-yellow-400 text-sm">
                  Please provide a description for all warranty cases before
                  continuing.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Success State */}
      {isValid && (
        <Card className="bg-green-950/20 border border-green-800">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-green-500 font-semibold mb-1">
                  Ready to Submit
                </h4>
                <p className="text-green-400 text-sm">
                  {hasMultipleCases
                    ? `${guaranteeCases.length} warranty cases prepared.`
                    : "Warranty case prepared."}{" "}
                  Click{" "}
                  <span className="text-green-300 font-medium">
                    Continue to Next Step
                  </span>{" "}
                  to review and submit your claim.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Guidelines */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardBody className="p-4">
          <h5 className="text-gray-300 font-semibold mb-3 text-sm">
            💡 Guidelines for Issue Description
          </h5>
          <ul className="space-y-2 text-gray-400 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-gray-500 mt-1">•</span>
              <span>
                <strong className="text-gray-300">Be specific:</strong> Include
                details about when the issue started and how it manifests
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500 mt-1">•</span>
              <span>
                <strong className="text-gray-300">Component names:</strong>{" "}
                Mention affected parts (battery, motor, charging port, etc.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500 mt-1">•</span>
              <span>
                <strong className="text-gray-300">Symptoms:</strong> Describe
                any unusual sounds, behaviors, or warning messages
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500 mt-1">•</span>
              <span>
                <strong className="text-gray-300">Frequency:</strong> How often
                does the issue occur (always, intermittent, specific conditions)
              </span>
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
