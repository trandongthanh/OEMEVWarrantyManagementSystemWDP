"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import {
  CheckCircle2,
  User,
  Calendar,
  Clock,
  FileText,
  Users,
  AlertCircle,
  Star,
  Shield,
  Wrench,
  Package,
  DollarSign,
  Gauge,
  Award,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import type { ClaimData } from "./types";

interface ReviewCreateStepProps {
  data: ClaimData;
  onClose: () => void;
}

const ISSUE_TYPE_LABELS: Record<string, string> = {
  battery: "Battery System",
  motor: "Motor & Drivetrain",
  electronics: "Electronics & Software",
  charging: "Charging System",
  hvac: "Climate Control",
  braking: "Braking System",
  suspension: "Suspension & Steering",
  body: "Body & Interior",
  lighting: "Lighting System",
  other: "Other Issues",
};

const WARRANTY_TYPE_LABELS: Record<string, string> = {
  manufacturer: "Manufacturer Warranty",
  extended: "Extended Warranty",
  powertrain: "Powertrain Warranty",
  goodwill: "Goodwill Warranty",
  recall: "Recall/Campaign Warranty",
};

// Mock technician data matching TechnicianAssignmentStep
const MOCK_TECHNICIANS = [
  {
    id: "tech1",
    name: "Vo Thi Mai",
    specialization: "Senior EV Diagnostics Specialist",
    rating: 4.9,
    experience: "10 years",
    avatar: "/avatars/tech1.jpg",
  },
  {
    id: "tech2",
    name: "Pham Van Nam",
    specialization: "Electronics & Software Engineer",
    rating: 4.6,
    experience: "5 years",
    avatar: "/avatars/tech2.jpg",
  },
  {
    id: "tech3",
    name: "Robert Thompson",
    specialization: "Battery Systems Expert",
    rating: 4.8,
    experience: "8 years",
    avatar: "/avatars/tech3.jpg",
  },
  {
    id: "tech4",
    name: "Sarah Miller",
    specialization: "Motor & Drivetrain Specialist",
    rating: 4.7,
    experience: "6 years",
    avatar: "/avatars/tech4.jpg",
  },
  {
    id: "tech5",
    name: "David Chen",
    specialization: "Charging Infrastructure Tech",
    rating: 4.5,
    experience: "4 years",
    avatar: "/avatars/tech5.jpg",
  },
  {
    id: "tech6",
    name: "Linda Nguyen",
    specialization: "Quality Assurance & Testing",
    rating: 4.8,
    experience: "7 years",
    avatar: "/avatars/tech6.jpg",
  },
  {
    id: "tech7",
    name: "Michael Rodriguez",
    specialization: "HVAC & Thermal Management",
    rating: 4.4,
    experience: "5 years",
    avatar: "/avatars/tech7.jpg",
  },
  {
    id: "tech8",
    name: "Emily Watson",
    specialization: "Body & Interior Systems",
    rating: 4.6,
    experience: "6 years",
    avatar: "/avatars/tech8.jpg",
  },
];

export function ReviewCreateStep({ data }: ReviewCreateStepProps) {
  const [isSuccess] = useState(false);

  const generateClaimId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `WC-${year}${month}${day}-${random}`;
  };

  const getSupportTechnicians = () => {
    return (
      data.supportTechnicians
        ?.map((id) => MOCK_TECHNICIANS.find((tech) => tech.id === id))
        .filter(Boolean) || []
    );
  };

  const getReportHandler = () => {
    if (!data.reportAssignee) return null;
    return MOCK_TECHNICIANS.find((tech) => tech.id === data.reportAssignee);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalFileSize = () => {
    return (
      data.documentation?.reduce((total, file) => total + file.size, 0) || 0
    );
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Warranty Claim Created Successfully!
        </h3>
        <p className="text-gray-400 mb-6">
          Your warranty claim has been submitted and assigned to the technician
          team.
        </p>
        <div className="space-y-2 text-sm">
          <p className="text-gray-300">
            Claim ID:{" "}
            <span className="font-mono text-[#7c3aed]">
              {generateClaimId()}
            </span>
          </p>
          <p className="text-gray-300">
            Status: <span className="text-yellow-400">Pending Validation</span>
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-12 h-12 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
        >
          <CheckCircle2 className="w-6 h-6 text-gray-800" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-light text-white tracking-wide">
            Review & Create Claim
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Review all information before creating the warranty claim
          </p>
        </div>
      </div>

      {/* Vehicle Information Review */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[#7c3aed]" />
            <h4 className="text-base font-semibold text-white">
              Vehicle & Customer Information
            </h4>
          </div>

          {data.vehicleInfo ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">VIN:</span>
                  <p className="text-white font-mono">{data.vehicleInfo.vin}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Model:</span>
                  <p className="text-white">
                    {data.vehicleInfo.model} ({data.vehicleInfo.year})
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">
                    Warranty Status:
                  </span>
                  <Chip
                    size="sm"
                    color={
                      data.vehicleInfo.warrantyStatus === "active"
                        ? "success"
                        : "danger"
                    }
                    variant="flat"
                    className="ml-2"
                  >
                    {data.vehicleInfo.warrantyStatus}
                  </Chip>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Customer:</span>
                  <p className="text-white">{data.vehicleInfo.customer}</p>
                </div>
                {data.vehicleInfo.phone && (
                  <div>
                    <span className="text-sm text-gray-400">Phone:</span>
                    <p className="text-white">{data.vehicleInfo.phone}</p>
                  </div>
                )}
                {data.vehicleInfo.email && (
                  <div>
                    <span className="text-sm text-gray-400">Email:</span>
                    <p className="text-white">{data.vehicleInfo.email}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Vehicle information missing</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Issue Information Review */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#7c3aed]" />
            <h4 className="text-base font-semibold text-white">
              Issue Information
            </h4>
          </div>

          {data.issueType && data.description ? (
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-400">Issue Category:</span>
                <Chip
                  size="md"
                  className="bg-blue-500/20 text-blue-300 border border-blue-500/30 ml-2"
                >
                  {ISSUE_TYPE_LABELS[data.issueType] || data.issueType}
                </Chip>
              </div>
              <div>
                <span className="text-sm text-gray-400">Description:</span>
                <div className="mt-2 p-4 bg-[#0a0a0a] border border-[#27272a] rounded-lg">
                  <p className="text-white text-sm leading-relaxed">
                    {data.description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Issue information missing</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Warranty Case Information */}
      {(data.warrantyType ||
        data.odometerReading ||
        data.reportAssignee ||
        data.replacementParts) && (
        <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 border-purple-500/30">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Shield className="w-5 h-5 text-purple-400" />
              <h4 className="text-base font-semibold text-white">
                Warranty Case Details
              </h4>
            </div>

            <div className="space-y-5">
              {/* Warranty Type & Odometer */}
              <div className="grid md:grid-cols-2 gap-4">
                {data.warrantyType && (
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">
                        Warranty Type:
                      </span>
                    </div>
                    <p className="text-white font-medium">
                      {WARRANTY_TYPE_LABELS[data.warrantyType] ||
                        data.warrantyType}
                    </p>
                  </div>
                )}

                {data.odometerReading && (
                  <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">
                        Odometer Reading:
                      </span>
                    </div>
                    <p className="text-white font-medium">
                      {data.odometerReading.toLocaleString()} km
                    </p>
                    {data.vehicleInfo?.maxMileage && (
                      <p className="text-xs text-gray-500 mt-1">
                        Warranty limit:{" "}
                        {data.vehicleInfo.maxMileage.toLocaleString()} km
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Report Handler */}
              {data.reportAssignee && getReportHandler() && (
                <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">
                      Report Handler:
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={getReportHandler()?.avatar}
                      name={getReportHandler()?.name}
                      className="w-10 h-10 ring-2 ring-gray-700"
                      fallback={
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-300" />
                        </div>
                      }
                    />
                    <div>
                      <p className="text-white font-medium">
                        {getReportHandler()?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getReportHandler()?.specialization}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-white">
                        {getReportHandler()?.rating}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Replacement Parts */}
              {data.replacementParts && data.replacementParts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-400">
                      Replacement Parts:
                    </span>
                    <Chip
                      size="sm"
                      className="bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    >
                      {data.replacementParts.length} part
                      {data.replacementParts.length > 1 ? "s" : ""}
                    </Chip>
                  </div>
                  <div className="space-y-2">
                    {data.replacementParts.map((part) => (
                      <div
                        key={part.id}
                        className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="text-white font-medium">
                              {part.name}
                            </h5>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Part # {part.partNumber}
                            </p>
                          </div>
                          {part.priority && (
                            <Chip
                              size="sm"
                              className={`${
                                part.priority === "high"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : part.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                  : "bg-green-500/20 text-green-300 border border-green-500/30"
                              }`}
                            >
                              {part.priority}
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-gray-400">Est. Cost:</span>
                            <span className="text-white font-medium">
                              ${part.estimatedCost.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-gray-400">Coverage:</span>
                            <span
                              className={`font-medium ${
                                part.warrantyCoverage === "full"
                                  ? "text-green-400"
                                  : part.warrantyCoverage === "partial"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {part.warrantyCoverage}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Total Cost */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">
                        Total Estimated Cost:
                      </span>
                      <span className="text-xl font-bold text-white">
                        $
                        {data.replacementParts
                          .reduce((sum, part) => sum + part.estimatedCost, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Technician Assignment Review */}
      <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 border-purple-500/30">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h4 className="text-base font-semibold text-white">
                Technician Team Assignment
              </h4>
            </div>
            <Chip
              size="lg"
              className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50"
            >
              {1 + (getSupportTechnicians().length || 0)} Technician
              {1 + (getSupportTechnicians().length || 0) > 1 ? "s" : ""}
            </Chip>
          </div>

          {data.technician ? (
            <div className="space-y-4">
              {/* Primary Technician */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 rounded-xl border-2 bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-purple-500/30"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Avatar
                    src={
                      MOCK_TECHNICIANS.find((t) => t.id === data.technician?.id)
                        ?.avatar
                    }
                    name={data.technician.name}
                    className="w-14 h-14 ring-2 ring-purple-500/50"
                    fallback={
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-700 to-purple-800 rounded-full flex items-center justify-center">
                        <User className="w-7 h-7 text-purple-300" />
                      </div>
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-base font-bold text-white">
                        {data.technician.name}
                      </h5>
                      <Chip
                        size="sm"
                        className="bg-gradient-to-r from-purple-600/30 to-purple-500/30 text-purple-300 border border-purple-500/50"
                      >
                        Primary Technician
                      </Chip>
                    </div>
                    <p className="text-sm text-gray-400">
                      {data.technician.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-1">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-300">
                      {data.technician.rating} rating
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">
                      {data.technician.experience}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Support Technicians */}
              {getSupportTechnicians().length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-400">
                      Support Team Members:
                    </span>
                  </div>
                  {getSupportTechnicians().map((tech, index) => (
                    <motion.div
                      key={tech?.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 1) * 0.1 }}
                      className="p-4 rounded-xl border-2 bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-500/30"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={tech?.avatar}
                          name={tech?.name}
                          className="w-12 h-12 ring-2 ring-blue-500/50"
                          fallback={
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-300" />
                            </div>
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h5 className="text-sm font-semibold text-white">
                              {tech?.name}
                            </h5>
                            <Chip
                              size="sm"
                              className="bg-gradient-to-r from-blue-600/30 to-blue-500/30 text-blue-300 border border-blue-500/50"
                            >
                              Support {index + 1}
                            </Chip>
                          </div>
                          <p className="text-xs text-gray-400">
                            {tech?.specialization}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-white">
                            {tech?.rating}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {(() => {
                      const allTechs = [
                        data.technician,
                        ...getSupportTechnicians(),
                      ].filter(Boolean);
                      const avgRating =
                        allTechs.reduce((sum, t) => sum + (t?.rating || 0), 0) /
                        allTechs.length;
                      return avgRating.toFixed(1);
                    })()}
                  </p>
                  <p className="text-xs text-gray-400">Avg Rating</p>
                </div>
                <div className="text-center p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {1 + getSupportTechnicians().length}
                  </p>
                  <p className="text-xs text-gray-400">Team Size</p>
                </div>
                <div className="text-center p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {(() => {
                      const allTechs = [
                        data.technician,
                        ...getSupportTechnicians(),
                      ].filter(Boolean);
                      const totalExp = allTechs.reduce((sum, t) => {
                        const years = parseInt(t?.experience || "0");
                        return sum + years;
                      }, 0);
                      return totalExp;
                    })()}{" "}
                    yrs
                  </p>
                  <p className="text-xs text-gray-400">Combined Exp</p>
                </div>
              </div>

              {/* Additional Details */}
              {(data.estimatedTime || data.instructions) && (
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  {data.estimatedTime && (
                    <div className="flex items-center gap-2 p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">
                        Estimated Completion:
                      </span>
                      <span className="text-white font-medium">
                        {data.estimatedTime}
                      </span>
                    </div>
                  )}

                  {data.instructions && (
                    <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-400">
                          Special Instructions:
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        {data.instructions}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Technician assignment missing</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Documentation Review */}
      <Card className="bg-[#18181b] border-[#27272a]">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#7c3aed]" />
            <h4 className="text-lg font-semibold text-white">Documentation</h4>
          </div>

          <div className="space-y-4">
            {data.documentation && data.documentation.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Attached Files:</span>
                  <span className="text-xs text-gray-500">
                    {data.documentation.length} files •{" "}
                    {formatFileSize(getTotalFileSize())}
                  </span>
                </div>
                <div className="space-y-2">
                  {data.documentation.slice(0, 3).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-[#0a0a0a] rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white truncate flex-1">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                  {data.documentation.length > 3 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      and {data.documentation.length - 3} more files...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No files attached</p>
            )}

            {data.notes && (
              <div>
                <span className="text-sm text-gray-400">Initial Notes:</span>
                <div className="mt-2 p-4 bg-[#0a0a0a] border border-[#27272a] rounded-lg">
                  <p className="text-white text-sm leading-relaxed">
                    {data.notes}
                  </p>
                </div>
              </div>
            )}

            {!data.documentation?.length && !data.notes && (
              <p className="text-sm text-gray-400 text-center py-4">
                No documentation added
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Final Summary Card */}
      <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
            </div>
            <h4 className="text-lg font-bold text-white">
              Ready to Create Claim
            </h4>
          </div>

          <div className="space-y-4">
            {/* Claim Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Creation Date:</span>
                </div>
                <p className="text-white font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">Initial Status:</span>
                </div>
                <Chip
                  size="lg"
                  className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-medium"
                >
                  Pending Validation
                </Chip>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
              <div className="text-center p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                <FileText className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {data.documentation?.length || 0}
                </p>
                <p className="text-xs text-gray-400">Documents</p>
              </div>
              <div className="text-center p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                <Package className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {data.replacementParts?.length || 0}
                </p>
                <p className="text-xs text-gray-400">Parts</p>
              </div>
              <div className="text-center p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  {1 + (getSupportTechnicians().length || 0)}
                </p>
                <p className="text-xs text-gray-400">Technicians</p>
              </div>
              <div className="text-center p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">
                  $
                  {data.replacementParts
                    ?.reduce((sum, part) => sum + part.estimatedCost, 0)
                    .toLocaleString() || "0"}
                </p>
                <p className="text-xs text-gray-400">Est. Cost</p>
              </div>
            </div>

            {/* Workflow Preview */}
            <div className="pt-4 border-t border-gray-700">
              <h5 className="text-sm font-medium text-gray-400 mb-3">
                Next Steps:
              </h5>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-300 text-xs font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      Warranty Validation
                    </p>
                    <p className="text-xs text-gray-400">
                      System will verify warranty coverage and eligibility
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-300 text-xs font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      Team Assignment
                    </p>
                    <p className="text-xs text-gray-400">
                      Primary and support technicians will be notified
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-300 text-xs font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      Diagnostic & Repair
                    </p>
                    <p className="text-xs text-gray-400">
                      Team will begin diagnostics and repair work
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Legal Notice */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-blue-200 font-medium">
                Terms & Confirmation
              </p>
              <p className="text-xs text-blue-300/80 leading-relaxed">
                By creating this warranty claim, you confirm that all
                information provided is accurate and complete. This claim will
                be processed according to the vehicle&apos;s warranty terms and
                conditions. False claims may result in warranty termination and
                legal action.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
