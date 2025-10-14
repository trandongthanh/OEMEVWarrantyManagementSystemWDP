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
  Gauge,
  FileText,
  Eye,
} from "lucide-react";
import { VehicleValidationStep } from "./claimSteps/VehicleValidationStep";
import { OdometerStep } from "./claimSteps/OdometerStep";
import { WarrantyIssuesStep } from "./claimSteps/WarrantyIssuesStep";
import { ReviewSubmitStep } from "./claimSteps/ReviewSubmitStep";
import type { ClaimData } from "./claimSteps/types";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 4-Step Warranty Claim Process
 *
 * Aligned with backend requirements:
 * 1. Vehicle Validation - GET /vehicle?vin={vin}
 * 2. Odometer Reading - GET /vehicle/{vin} with odometer
 * 3. Warranty Issues - Collect guarantee cases
 * 4. Review & Submit - POST /vehicleProcessingRecord
 */
const STEPS = [
  {
    id: 1,
    title: "Vehicle Verification",
    subtitle: "Verify vehicle & owner",
    icon: Shield,
  },
  {
    id: 2,
    title: "Odometer Reading",
    subtitle: "Check warranty status",
    icon: Gauge,
  },
  {
    id: 3,
    title: "Warranty Issues",
    subtitle: "Describe problems",
    icon: FileText,
  },
  {
    id: 4,
    title: "Review & Submit",
    subtitle: "Finalize claim",
    icon: Eye,
  },
];

export default function NewClaimModal({ isOpen, onClose }: NewClaimModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [claimData, setClaimData] = useState<ClaimData>({});

  const handleNext = async () => {
    if (currentStep < 4 && canProceed()) {
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

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle if not in an input/textarea
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    
    if (!isInput) {
      if (e.key === 'ArrowRight' && currentStep < 4 && canProceed()) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VehicleValidationStep
            data={claimData}
            onDataChange={handleStepData}
          />
        );
      case 2:
        return <OdometerStep data={claimData} onDataChange={handleStepData} />;
      case 3:
        return (
          <WarrantyIssuesStep data={claimData} onDataChange={handleStepData} />
        );
      case 4:
        return <ReviewSubmitStep data={claimData} onClose={handleClose} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Step 1: Vehicle must be validated
        return claimData.vehicleInfo?.vin && claimData.vehicleInfo?.owner;
      case 2:
        // Step 2: Odometer must be checked and warranty validated
        return claimData.odometer !== undefined && claimData.warrantyCheck;
      case 3:
        // Step 3: At least one guarantee case with content
        return (
          claimData.guaranteeCases &&
          claimData.guaranteeCases.length > 0 &&
          claimData.guaranteeCases.every(
            (c) => c.contentGuarantee.trim().length > 0
          )
        );
      case 4:
        // Step 4: Final review (submission handled in component)
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
      <ModalContent 
        className="max-h-[96vh] overflow-hidden w-full max-w-[98vw] md:max-w-6xl"
        onKeyDown={handleKeyDown}
      >
        <div className="flex h-full min-h-[600px] md:min-h-[680px]">
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
                <div className="mt-3 pt-3 border-t border-gray-800 space-y-1 text-xs text-gray-500">
                  <p className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono text-[10px]">ESC</kbd>
                    <span>Close modal</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono text-[10px]">←</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono text-[10px]">→</kbd>
                    <span>Navigate steps</span>
                  </p>
                </div>
                <div className="text-xs text-gray-500 pt-2">
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
            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
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
            <div className="p-5 md:p-6 border-t-2 border-gray-700 bg-gray-900">
              <div className="flex justify-between items-center gap-4">
                <Button
                  variant="bordered"
                  onPress={currentStep === 1 ? handleClose : handlePrevious}
                  size="lg"
                  className="border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-800 px-6 md:px-8 py-3 font-medium transition-all duration-300 rounded-xl"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onPress={handleNext}
                    isDisabled={!canProceed()}
                    size="lg"
                    className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 hover:from-gray-300 hover:to-gray-400 px-6 md:px-10 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    {currentStep === 3 ? "Review Claim" : "Next Step"}
                  </Button>
                ) : (
                  <div className="text-gray-400 text-sm italic flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-500" />
                    <span className="hidden md:inline">
                      Review information and submit claim above
                    </span>
                    <span className="md:hidden">Submit above</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
