"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  X,
  Shield,
  FileText,
  Users,
  Camera,
  Eye,
} from "lucide-react";
import { WarrantyValidationStep } from "./claimSteps/WarrantyValidationStep";
import { IssueDescriptionStep } from "./claimSteps/IssueDescriptionStep";
import { GuaranteeCaseStep } from "./claimSteps/GuaranteeCaseStep";
import { TechnicianAssignmentStep } from "./claimSteps/TechnicianAssignmentStep";
import { InitialDocumentationStep } from "./claimSteps/InitialDocumentationStep";
import { ReviewCreateStep } from "./claimSteps/ReviewCreateStep";
import type { ClaimData } from "./claimSteps/types";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Vehicle Check",
    subtitle: "Verify warranty status",
    icon: Shield,
  },
  {
    id: 2,
    title: "Issue Details",
    subtitle: "Describe the problem",
    icon: FileText,
  },
  {
    id: 3,
    title: "Warranty Case",
    subtitle: "Select warranty type & parts",
    icon: Shield,
  },
  {
    id: 4,
    title: "Expert Team",
    subtitle: "Assign technicians",
    icon: Users,
  },
  {
    id: 5,
    title: "Documentation",
    subtitle: "Upload files & notes",
    icon: Camera,
  },
  {
    id: 6,
    title: "Final Review",
    subtitle: "Create warranty claim",
    icon: Eye,
  },
];

export default function NewClaimModal({ isOpen, onClose }: NewClaimModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [claimData, setClaimData] = useState<ClaimData>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (data: Partial<ClaimData>) => {
    setClaimData((prev) => ({ ...prev, ...data }));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setClaimData({});
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WarrantyValidationStep
            data={claimData}
            onDataChange={handleStepData}
          />
        );
      case 2:
        return (
          <IssueDescriptionStep
            data={claimData}
            onDataChange={handleStepData}
          />
        );
      case 3:
        return (
          <GuaranteeCaseStep data={claimData} onDataChange={handleStepData} />
        );
      case 4:
        return (
          <TechnicianAssignmentStep
            data={claimData}
            onDataChange={handleStepData}
          />
        );
      case 5:
        return (
          <InitialDocumentationStep
            data={claimData}
            onDataChange={handleStepData}
          />
        );
      case 6:
        return <ReviewCreateStep data={claimData} onClose={handleClose} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return claimData.vehicleInfo?.vin;
      case 2:
        return claimData.issueType && claimData.description;
      case 3:
        return (
          claimData.warrantyType &&
          claimData.reportAssignee &&
          claimData.odometerReading
        );
      case 4:
        return claimData.technician;
      case 5:
        return true; // Documentation is optional
      case 6:
        return true;
      default:
        return false;
    }
  };

  const currentStepData = STEPS[currentStep - 1];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="5xl"
      classNames={{
        backdrop: "bg-black/90 backdrop-blur-md",
        base: "bg-gray-950 border-2 border-gray-700 mx-auto shadow-2xl",
        wrapper: "flex items-center justify-center",
      }}
      hideCloseButton={true}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      placement="center"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent className="max-h-[95vh] overflow-hidden w-full max-w-[98vw] md:max-w-6xl">
        <div className="flex h-full min-h-[450px] md:min-h-[500px]">
          {/* Left Sidebar - Vertical Progress */}
          <div className="w-60 md:w-64 bg-gray-900 border-r-2 border-gray-700 p-4 md:p-6 flex flex-col justify-between">
            <div>
              {/* Vertical Step Progress */}
              <div className="relative">
                {/* Progress Line */}
                <div
                  className="absolute left-4 top-0 w-0.5 bg-gray-800"
                  style={{ height: `${(STEPS.length - 1) * 72}px` }}
                >
                  <motion.div
                    className="w-full bg-gradient-to-b from-gray-200 to-gray-300"
                    initial={{ height: "0%" }}
                    animate={{
                      height: `${
                        currentStep === STEPS.length
                          ? 100
                          : ((currentStep - 1) / (STEPS.length - 1)) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>

                {/* Steps */}
                <div className="space-y-6">
                  {STEPS.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-4"
                      >
                        {/* Step Circle */}
                        <motion.div
                          animate={{
                            scale: isCurrent ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className={`
                          relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg
                          ${
                            isCompleted
                              ? "bg-gradient-to-b from-gray-200 to-gray-300 border-gray-300 text-gray-800"
                              : isCurrent
                              ? "bg-gradient-to-b from-gray-200 to-gray-300 border-gray-300 text-gray-800 shadow-gray-300/30"
                              : "bg-gray-900 border-gray-700 text-gray-500"
                          }
                        `}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <step.icon className="w-4 h-4" />
                          )}

                          {/* Current step pulse */}
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-gray-300/50"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [1, 0, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                            />
                          )}
                        </motion.div>

                        {/* Step Content */}
                        <div className="flex-1 pt-1">
                          <h3
                            className={`font-medium mb-1 text-sm tracking-wide ${
                              isCurrent
                                ? "text-white"
                                : isCompleted
                                ? "text-gray-300"
                                : "text-gray-500"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p
                            className={`text-xs font-light ${
                              isCurrent ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {step.subtitle}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Helper Section */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  Need Help?
                </h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <p className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>Describe the issue as detailed as possible</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>Our system will recommend the best technician</span>
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                    Live support available 24/7
                  </span>
                </div>
              </div>
            </div>

            {/* Step Counter */}
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="text-center">
                <p className="text-gray-300 text-sm font-medium">
                  Step {currentStep} of {STEPS.length}
                </p>
                <div className="mt-2 w-full bg-gray-800 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-gray-200 to-gray-300 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h2 className="text-base font-semibold text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-400 mt-1 text-xs">
                  {currentStepData.subtitle}
                </p>
              </div>

              <Button
                isIconOnly
                variant="light"
                className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onPress={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="h-full max-w-4xl mx-auto"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="p-4 border-t-2 border-gray-700 bg-gray-900">
              <div className="flex justify-between items-center">
                <Button
                  variant="bordered"
                  onPress={currentStep === 1 ? handleClose : handlePrevious}
                  size="lg"
                  className="border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-8 py-3 font-medium transition-all duration-300 rounded-xl"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                >
                  {currentStep === 1 ? "Cancel" : "Previous Step"}
                </Button>

                {currentStep < 6 ? (
                  <Button
                    onPress={handleNext}
                    isDisabled={!canProceed()}
                    size="lg"
                    className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 hover:from-gray-300 hover:to-gray-400 px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg rounded-xl"
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Next Step
                  </Button>
                ) : (
                  <Button
                    onPress={() => {
                      // Handle final submission
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        handleClose();
                      }, 2000);
                    }}
                    isLoading={isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-6 py-3 font-semibold shadow-lg transition-all duration-200"
                    endContent={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Create Warranty Claim
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
