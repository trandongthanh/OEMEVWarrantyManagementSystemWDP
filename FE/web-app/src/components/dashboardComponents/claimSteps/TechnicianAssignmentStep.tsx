"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
  Users,
  Star,
  CheckCircle2,
  User,
  Clock,
  AlertCircle,
  Award,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import type { ClaimData } from "./types";

interface TechnicianAssignmentStepProps {
  data: ClaimData;
  onDataChange: (data: Partial<ClaimData>) => void;
}

interface Technician {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  status: "available" | "busy" | "offline";
  avatar: string;
  completedCases: number;
  expertise: string[];
  currentWorkload: number; // Number of active cases
  maxWorkload: number; // Maximum concurrent cases
  avgResponseTime: string; // Average response time
  certifications: string[]; // Professional certifications
}

// Mock technician data with real-world business details
const MOCK_TECHNICIANS: Technician[] = [
  {
    id: "tech1",
    name: "Vo Thi Mai",
    specialization: "Senior EV Diagnostics Specialist",
    rating: 4.9,
    experience: "10 years",
    status: "available",
    avatar: "/avatars/tech1.jpg",
    completedCases: 1250,
    expertise: [
      "Battery Systems",
      "Electronics",
      "Diagnostics",
      "Power Management",
    ],
    currentWorkload: 2,
    maxWorkload: 5,
    avgResponseTime: "15 mins",
    certifications: ["ASE Master Certified", "Tesla Certified", "ISO 9001"],
  },
  {
    id: "tech2",
    name: "Pham Van Nam",
    specialization: "Electronics & Software Engineer",
    rating: 4.6,
    experience: "5 years",
    status: "available",
    avatar: "/avatars/tech2.jpg",
    completedCases: 780,
    expertise: ["Software", "Infotainment", "Sensors", "Electronics"],
    currentWorkload: 1,
    maxWorkload: 4,
    avgResponseTime: "20 mins",
    certifications: ["BMW Certified", "Automotive Software Dev"],
  },
  {
    id: "tech3",
    name: "Robert Thompson",
    specialization: "Battery Systems Expert",
    rating: 4.8,
    experience: "8 years",
    status: "available",
    avatar: "/avatars/tech3.jpg",
    completedCases: 950,
    expertise: ["Battery", "Charging", "Power Management", "High Voltage"],
    currentWorkload: 3,
    maxWorkload: 5,
    avgResponseTime: "18 mins",
    certifications: ["High Voltage Certified", "CATL Battery Systems"],
  },
  {
    id: "tech4",
    name: "Sarah Miller",
    specialization: "Motor & Drivetrain Specialist",
    rating: 4.7,
    experience: "6 years",
    status: "busy",
    avatar: "/avatars/tech4.jpg",
    completedCases: 680,
    expertise: ["Motors", "Drivetrain", "Mechanical", "Regenerative Braking"],
    currentWorkload: 4,
    maxWorkload: 4,
    avgResponseTime: "35 mins",
    certifications: ["Mechanical Engineering", "EV Powertrain"],
  },
  {
    id: "tech5",
    name: "David Chen",
    specialization: "Charging Infrastructure Tech",
    rating: 4.5,
    experience: "4 years",
    status: "busy",
    avatar: "/avatars/tech5.jpg",
    completedCases: 420,
    expertise: ["Charging", "Electrical", "Infrastructure", "DC Fast Charging"],
    currentWorkload: 3,
    maxWorkload: 4,
    avgResponseTime: "40 mins",
    certifications: ["Electrical Safety", "ChargePoint Certified"],
  },
  {
    id: "tech6",
    name: "Linda Nguyen",
    specialization: "Quality Assurance & Testing",
    rating: 4.8,
    experience: "7 years",
    status: "available",
    avatar: "/avatars/tech6.jpg",
    completedCases: 890,
    expertise: ["Quality Control", "Testing", "Diagnostics", "Documentation"],
    currentWorkload: 2,
    maxWorkload: 6,
    avgResponseTime: "22 mins",
    certifications: ["ISO Auditor", "Six Sigma Black Belt"],
  },
  {
    id: "tech7",
    name: "Michael Rodriguez",
    specialization: "HVAC & Thermal Management",
    rating: 4.4,
    experience: "5 years",
    status: "offline",
    avatar: "/avatars/tech7.jpg",
    completedCases: 540,
    expertise: ["HVAC", "Thermal Systems", "Climate Control", "Refrigerant"],
    currentWorkload: 0,
    maxWorkload: 4,
    avgResponseTime: "N/A",
    certifications: ["EPA 609 Certified", "HVAC Specialist"],
  },
  {
    id: "tech8",
    name: "Emily Watson",
    specialization: "Body & Interior Systems",
    rating: 4.6,
    experience: "6 years",
    status: "available",
    avatar: "/avatars/tech8.jpg",
    completedCases: 720,
    expertise: ["Body Work", "Interior", "Safety Systems", "Sensors"],
    currentWorkload: 1,
    maxWorkload: 5,
    avgResponseTime: "25 mins",
    certifications: ["I-CAR Certified", "Safety Systems"],
  },
];

export function TechnicianAssignmentStep({
  data,
  onDataChange,
}: TechnicianAssignmentStepProps) {
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>(
    data.technician ? [data.technician.id] : []
  );

  const getRecommendedTechnicianIds = () => {
    if (!data.issueType) return [];

    const issueTypeMap: Record<string, string[]> = {
      battery: [
        "Battery",
        "Battery Systems",
        "Charging",
        "Power Management",
        "High Voltage",
      ],
      electronics: ["Software", "Infotainment", "Sensors", "Electronics"],
      motor: ["Motors", "Drivetrain", "Mechanical", "Regenerative Braking"],
      charging: [
        "Charging",
        "Electrical",
        "Infrastructure",
        "DC Fast Charging",
      ],
      hvac: ["HVAC", "Thermal Systems", "Climate Control"],
      body: ["Body Work", "Interior", "Safety Systems"],
    };

    const relevantSkills = issueTypeMap[data.issueType] || [];

    return MOCK_TECHNICIANS.filter((tech) =>
      tech.expertise.some((skill) => relevantSkills.includes(skill))
    ).map((tech) => tech.id);
  };

  const recommendedIds = getRecommendedTechnicianIds();

  // Calculate workload percentage
  const getWorkloadPercentage = (tech: Technician) => {
    return Math.round((tech.currentWorkload / tech.maxWorkload) * 100);
  };

  // Get workload status color
  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-400";
    if (percentage >= 75) return "text-yellow-400";
    return "text-green-400";
  };

  // Can technician be assigned (available or busy but not at max capacity)
  const canAssignTechnician = (tech: Technician) => {
    return tech.status !== "offline" && tech.currentWorkload < tech.maxWorkload;
  };

  const handleTechnicianToggle = (technicianId: string) => {
    const technician = MOCK_TECHNICIANS.find((t) => t.id === technicianId);

    // Prevent selection if technician cannot be assigned
    if (!technician || !canAssignTechnician(technician)) {
      return;
    }

    const isSelected = selectedTechnicians.includes(technicianId);
    let newSelection: string[];

    if (isSelected) {
      // If deselecting, remove from selection
      newSelection = selectedTechnicians.filter((id) => id !== technicianId);
    } else {
      // If selecting, add to selection
      newSelection = [...selectedTechnicians, technicianId];
    }

    setSelectedTechnicians(newSelection);

    // Update parent with primary technician (first in list) and support technicians
    const primaryTech = MOCK_TECHNICIANS.find((t) => t.id === newSelection[0]);
    if (primaryTech) {
      onDataChange({
        technician: {
          id: primaryTech.id,
          name: primaryTech.name,
          specialization: primaryTech.specialization,
          rating: primaryTech.rating,
          experience: primaryTech.experience,
          status: primaryTech.status,
        },
        supportTechnicians: newSelection.slice(1), // Rest are support
      });
    } else {
      onDataChange({ technician: undefined, supportTechnicians: [] });
    }
  };

  // Sort technicians: recommended & available first, then by workload
  const sortedTechnicians = [...MOCK_TECHNICIANS].sort((a, b) => {
    const aRecommended = recommendedIds.includes(a.id);
    const bRecommended = recommendedIds.includes(b.id);
    const aCanAssign = canAssignTechnician(a);
    const bCanAssign = canAssignTechnician(b);

    // First: Recommended & can assign
    if (aRecommended && aCanAssign && (!bRecommended || !bCanAssign)) return -1;
    if (bRecommended && bCanAssign && (!aRecommended || !aCanAssign)) return 1;

    // Second: Can assign
    if (aCanAssign && !bCanAssign) return -1;
    if (bCanAssign && !aCanAssign) return 1;

    // Third: By workload percentage (lower is better)
    return getWorkloadPercentage(a) - getWorkloadPercentage(b);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-12 h-12 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
        >
          <Users className="w-6 h-6 text-gray-800" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-light text-white tracking-wide">
            Technician Assignment
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Select primary technician and optional support team members based on
            availability and workload
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardBody className="p-5">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-300" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-semibold text-white">
                  Assignment Rules
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      <strong className="text-white">First selection</strong>{" "}
                      becomes the{" "}
                      <Chip
                        size="sm"
                        className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0"
                      >
                        Primary Technician
                      </Chip>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      Additional selections become{" "}
                      <Chip
                        size="sm"
                        className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0"
                      >
                        Support Team
                      </Chip>{" "}
                      members
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>
                      <Chip
                        size="sm"
                        className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0"
                      >
                        Recommended
                      </Chip>{" "}
                      technicians have expertise matching this issue type
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span>
                      <strong className="text-white">Busy</strong> technicians
                      can still be assigned if below max workload
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>
                      <strong className="text-white">Offline</strong> or at{" "}
                      <strong className="text-white">max capacity</strong>{" "}
                      technicians cannot be assigned
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Technician Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTechnicians.map((technician, index) => {
          const isSelected = selectedTechnicians.includes(technician.id);
          const isRecommended = recommendedIds.includes(technician.id);
          const selectionIndex = selectedTechnicians.indexOf(technician.id);
          const workloadPercentage = getWorkloadPercentage(technician);
          const canAssign = canAssignTechnician(technician);
          const workloadColor = getWorkloadColor(workloadPercentage);

          return (
            <motion.div
              key={technician.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Card
                isPressable={canAssign}
                onPress={() => handleTechnicianToggle(technician.id)}
                className={`transition-all duration-300 h-full ${
                  !canAssign
                    ? "opacity-40 cursor-not-allowed border-2 border-[#27272a] bg-[#18181b]"
                    : isSelected
                    ? "border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 shadow-lg shadow-purple-500/10 cursor-pointer"
                    : "border-2 border-[#27272a] bg-[#18181b] hover:border-gray-600 hover:shadow-lg cursor-pointer"
                }`}
              >
                <CardBody className="p-5">
                  <div className="space-y-4">
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={technician.avatar}
                          name={technician.name}
                          className="w-14 h-14 ring-2 ring-gray-700"
                          fallback={
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                              <User className="w-7 h-7 text-gray-300" />
                            </div>
                          }
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#18181b] flex items-center justify-center ${
                            technician.status === "available"
                              ? "bg-green-500"
                              : technician.status === "busy"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {technician.status === "busy" && (
                            <Clock className="w-3 h-3 text-gray-900" />
                          )}
                          {technician.status === "offline" && (
                            <AlertCircle className="w-3 h-3 text-gray-900" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white leading-tight">
                            {technician.name}
                          </h3>
                          {isSelected && (
                            <Chip
                              size="sm"
                              className={`${
                                selectionIndex === 0
                                  ? "bg-gradient-to-r from-purple-600/30 to-purple-500/30 text-purple-300 border border-purple-500/50"
                                  : "bg-gradient-to-r from-blue-600/30 to-blue-500/30 text-blue-300 border border-blue-500/50"
                              } px-2 py-0`}
                            >
                              {selectionIndex === 0
                                ? "Primary"
                                : `Support ${selectionIndex}`}
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-tight">
                          {technician.specialization}
                        </p>
                      </div>
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-1.5">
                      {isRecommended && (
                        <Chip
                          size="sm"
                          className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0"
                          startContent={<Star className="w-3 h-3" />}
                        >
                          Recommended
                        </Chip>
                      )}
                      <Chip
                        size="sm"
                        className={`${
                          technician.status === "available"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : technician.status === "busy"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        } px-2 py-0 capitalize`}
                      >
                        {technician.status}
                      </Chip>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-medium text-gray-400">
                            Rating
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {technician.rating}/5.0
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-medium text-gray-400">
                            Cases
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {technician.completedCases}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-xs font-medium text-gray-400">
                            Experience
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {technician.experience}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-xs font-medium text-gray-400">
                            Response
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {technician.avgResponseTime}
                        </p>
                      </div>
                    </div>

                    {/* Workload Bar */}
                    <div className="space-y-2 pt-2 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Workload
                        </span>
                        <span
                          className={`text-xs font-semibold ${workloadColor}`}
                        >
                          {technician.currentWorkload}/{technician.maxWorkload}{" "}
                          ({workloadPercentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${workloadPercentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full rounded-full ${
                            workloadPercentage >= 100
                              ? "bg-gradient-to-r from-red-600 to-red-500"
                              : workloadPercentage >= 75
                              ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                              : "bg-gradient-to-r from-green-600 to-green-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    <div className="space-y-2 pt-2 border-t border-gray-800">
                      <span className="text-xs font-medium text-gray-400">
                        Expertise
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {technician.expertise.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {technician.expertise.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
                            +{technician.expertise.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cannot Assign Warning */}
                    {!canAssign && (
                      <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-300">
                          {technician.status === "offline"
                            ? "Currently offline"
                            : "At maximum capacity"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedTechnicians.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 border-purple-500/30">
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Team Assignment Summary
                  </h3>
                  <Chip
                    size="lg"
                    className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50 px-3 py-1"
                  >
                    {selectedTechnicians.length} Technician
                    {selectedTechnicians.length > 1 ? "s" : ""}
                  </Chip>
                </div>

                <div className="space-y-3">
                  {selectedTechnicians.map((techId, index) => {
                    const technician = MOCK_TECHNICIANS.find(
                      (t) => t.id === techId
                    );
                    if (!technician) return null;

                    const isPrimary = index === 0;
                    const workloadPercentage =
                      getWorkloadPercentage(technician);

                    return (
                      <motion.div
                        key={techId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                          isPrimary
                            ? "bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-purple-500/30"
                            : "bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-500/30"
                        }`}
                      >
                        <div className="relative">
                          <Avatar
                            src={technician.avatar}
                            name={technician.name}
                            className="w-12 h-12 ring-2 ring-gray-700"
                            fallback={
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-300" />
                              </div>
                            }
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#18181b] ${
                              technician.status === "available"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white">
                              {technician.name}
                            </h4>
                            <Chip
                              size="sm"
                              className={`${
                                isPrimary
                                  ? "bg-gradient-to-r from-purple-600/30 to-purple-500/30 text-purple-300 border border-purple-500/50"
                                  : "bg-gradient-to-r from-blue-600/30 to-blue-500/30 text-blue-300 border border-blue-500/50"
                              } px-2 py-0`}
                            >
                              {isPrimary
                                ? "Primary Technician"
                                : `Support ${index}`}
                            </Chip>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">
                            {technician.specialization}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-gray-300">
                                {technician.rating} rating
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3 text-blue-400" />
                              <span className="text-xs text-gray-300">
                                {technician.completedCases} cases
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-green-400" />
                              <span className="text-xs text-gray-300">
                                ~{technician.avgResponseTime} response
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Chip
                            size="sm"
                            className={`${
                              technician.status === "available"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            } px-2 py-0 capitalize`}
                          >
                            {technician.status}
                          </Chip>
                          <span
                            className={`text-xs font-medium ${
                              workloadPercentage >= 75
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {workloadPercentage}% workload
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Avg Rating</p>
                    <p className="text-lg font-bold text-white">
                      {(
                        selectedTechnicians.reduce((sum, id) => {
                          const tech = MOCK_TECHNICIANS.find(
                            (t) => t.id === id
                          );
                          return sum + (tech?.rating || 0);
                        }, 0) / selectedTechnicians.length
                      ).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Cases</p>
                    <p className="text-lg font-bold text-white">
                      {selectedTechnicians.reduce((sum, id) => {
                        const tech = MOCK_TECHNICIANS.find((t) => t.id === id);
                        return sum + (tech?.completedCases || 0);
                      }, 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Combined Exp</p>
                    <p className="text-lg font-bold text-white">
                      {selectedTechnicians.reduce((sum, id) => {
                        const tech = MOCK_TECHNICIANS.find((t) => t.id === id);
                        const years = parseInt(tech?.experience || "0");
                        return sum + years;
                      }, 0)}{" "}
                      yrs
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
