"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Upload,
  Info,
  Loader2,
  Package,
  Search,
  Grid,
  List,
  TrendingUp,
  Plus,
  Calendar,
  Shield,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
  X,
  Hash,
  Gauge,
  Edit2,
  Trash2,
} from "lucide-react";
import VehicleBulkUpload from "./VehicleBulkUpload";
import vehicleModelService, {
  VehicleModel,
} from "@/services/vehicleModelService";
import inventoryService from "@/services/inventoryService";
import warrantyComponentService, {
  type WarrantyComponent,
} from "@/services/warrantyComponentService";
import { authService } from "@/services";
import { toast } from "sonner";

// Component categories for creating new components
const CATEGORIES = [
  { value: "HIGH_VOLTAGE_BATTERY", label: "High Voltage Battery" },
  { value: "POWERTRAIN", label: "Powertrain" },
  { value: "CHARGING_SYSTEM", label: "Charging System" },
  { value: "THERMAL_MANAGEMENT", label: "Thermal Management" },
  { value: "LOW_VOLTAGE_SYSTEM", label: "Low Voltage System" },
  { value: "BRAKING", label: "Braking" },
  { value: "SUSPENSION_STEERING", label: "Suspension & Steering" },
  { value: "HVAC", label: "HVAC" },
  { value: "BODY_CHASSIS", label: "Body & Chassis" },
  { value: "INFOTAINMENT_ADAS", label: "Infotainment & ADAS" },
];

/**
 * Vehicle Management Component
 * For parts_coordinator_company role
 *
 * Provides bulk vehicle creation via Excel upload and manual model creation
 */

interface CreateVehicleModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateVehicleModelModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateVehicleModelModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    vehicleModelName: "",
    sku: "",
    vehicleCompanyId: "",
    yearOfLaunch: "",
    placeOfManufacture: "",
    generalWarrantyDuration: "",
    generalWarrantyMileage: "",
  });

  // Step 2: Warranty Components
  const [components, setComponents] = useState<
    Array<{
      isNew: boolean; // Track if this is a new component
      typeComponentId: string;
      componentName: string;
      // Fields for new components
      name: string;
      price: string;
      sku: string;
      category: string;
      makeBrand: string;
      // Warranty terms
      durationMonth: string;
      mileageLimit: string;
      quantity: string;
    }>
  >([]);
  const [availableComponents, setAvailableComponents] = useState<
    Array<{
      typeComponentId: string;
      typeComponent: { name: string; sku: string };
    }>
  >([]);

  // Auto-populate company ID from logged-in user
  useEffect(() => {
    if (isOpen) {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.companyId) {
        setFormData((prev) => ({
          ...prev,
          vehicleCompanyId: currentUser.companyId || "",
        }));
      }
      loadComponents();
    }
  }, [isOpen]);

  const loadComponents = async () => {
    try {
      const componentsData = await inventoryService.getTypeComponents("");
      // Deduplicate by typeComponentId to prevent duplicate keys
      const uniqueComponents = Array.from(
        new Map(componentsData.map((c) => [c.typeComponentId, c])).values()
      );
      setAvailableComponents(uniqueComponents);
    } catch (error) {
      console.error("Error loading components:", error);
    }
  };

  const handleNext = () => {
    // Validate required fields for step 1
    const errors: Record<string, string> = {};
    if (!formData.vehicleModelName.trim())
      errors.vehicleModelName = "Model name is required";
    if (!formData.sku.trim()) errors.sku = "SKU is required";
    if (!formData.vehicleCompanyId.trim())
      errors.vehicleCompanyId = "Company ID is required";
    if (!formData.placeOfManufacture.trim())
      errors.placeOfManufacture = "Place of manufacture is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    setFieldErrors({});
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {
        isNew: false,
        typeComponentId: "",
        componentName: "",
        name: "",
        price: "",
        sku: "",
        category: "",
        makeBrand: "",
        durationMonth: "",
        mileageLimit: "",
        quantity: "1",
      },
    ]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, field: string, value: string) => {
    const updated = [...components];
    if (field === "typeComponentId") {
      const selected = availableComponents.find(
        (c) => c.typeComponentId === value
      );
      updated[index] = {
        ...updated[index],
        typeComponentId: value,
        componentName: selected?.typeComponent?.name || "",
      };
    } else if (field === "isNew") {
      updated[index] = {
        ...updated[index],
        isNew: value === "true",
        // Clear fields when toggling
        typeComponentId: "",
        componentName: "",
        name: "",
        sku: "",
      };
    } else if (field === "sku") {
      // Check for duplicate SKU in new components
      const existingSkuInNew = updated.some(
        (c, i) => i !== index && c.isNew && c.sku === value && value !== ""
      );

      // Check for duplicate SKU in existing components
      const existingSkuInAvailable = availableComponents.some(
        (c) => c.typeComponent.sku === value && value !== ""
      );

      if (existingSkuInNew) {
        toast.error(`SKU "${value}" is already used in another new component`);
        return;
      }

      if (existingSkuInAvailable) {
        toast.error(`SKU "${value}" already exists in the system`);
        return;
      }

      updated[index] = { ...updated[index], [field]: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setComponents(updated);
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (loading) return;

    // Validate at least one component
    if (components.length === 0) {
      toast.error("Please add at least one warranty component");
      return;
    }

    // Validate component fields
    const invalidComponents = components.filter((c) => {
      // Common fields for both modes
      if (!c.durationMonth || !c.mileageLimit || !c.quantity) return true;

      // If selecting existing component
      if (!c.isNew && !c.typeComponentId) return true;

      // If creating new component
      if (
        c.isNew &&
        (!c.name || !c.sku || !c.category || !c.price || !c.makeBrand)
      )
        return true;

      return false;
    });
    if (invalidComponents.length > 0) {
      toast.error("Please fill in all required component fields");
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      let createdModel = null;

      try {
        // Step 1: Create vehicle model without components
        const vehicleModelData = {
          vehicleModelName: formData.vehicleModelName,
          sku: formData.sku,
          placeOfManufacture: formData.placeOfManufacture,
          ...(formData.yearOfLaunch && { yearOfLaunch: formData.yearOfLaunch }),
          ...(formData.generalWarrantyDuration && {
            generalWarrantyDuration: parseInt(formData.generalWarrantyDuration),
          }),
          ...(formData.generalWarrantyMileage && {
            generalWarrantyMileage: parseInt(formData.generalWarrantyMileage),
          }),
        };

        createdModel = await vehicleModelService.createVehicleModel(
          vehicleModelData
        );

        // Step 2: Set warranty terms for components on the created vehicle model
        const warrantyComponentsData = components.map((c) => {
          const baseData = {
            durationMonth: parseInt(c.durationMonth),
            mileageLimit: parseInt(c.mileageLimit),
            quantity: parseInt(c.quantity),
          };

          if (c.isNew) {
            return {
              ...baseData,
              name: c.name,
              price: parseFloat(c.price),
              sku: c.sku,
              category: c.category,
              makeBrand: c.makeBrand,
            };
          } else {
            return {
              ...baseData,
              typeComponentId: c.typeComponentId,
            };
          }
        });

        await vehicleModelService.addWarrantyComponents(
          createdModel.vehicleModelId,
          warrantyComponentsData
        );

        toast.success("Vehicle model created successfully!", {
          description: "Model and warranty components configured",
          duration: 5000,
        });
        onSuccess();
        onClose();
        setCurrentStep(1);
        setComponents([]);
        setFormData({
          vehicleModelName: "",
          sku: "",
          vehicleCompanyId: "",
          yearOfLaunch: "",
          placeOfManufacture: "",
          generalWarrantyDuration: "",
          generalWarrantyMileage: "",
        });
        setFieldErrors({});
      } catch (componentError) {
        // If warranty components fail and vehicle was created, inform user
        if (createdModel) {
          console.error("Error adding warranty components:", componentError);
          toast.error(
            "Vehicle model created but warranty components failed to add",
            {
              description:
                "Please add warranty components manually from the Warranty Component Config page",
              duration: 7000,
            }
          );
          // Still call onSuccess since vehicle was created
          onSuccess();
          onClose();
          setCurrentStep(1);
          setComponents([]);
          setFormData({
            vehicleModelName: "",
            sku: "",
            vehicleCompanyId: "",
            yearOfLaunch: "",
            placeOfManufacture: "",
            generalWarrantyDuration: "",
            generalWarrantyMileage: "",
          });
          setFieldErrors({});
        } else {
          // Vehicle creation failed
          throw componentError;
        }
      }
    } catch (error) {
      console.error("Error creating vehicle model:", error);
      toast.error("Failed to create vehicle model");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Vehicle Model
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentStep === 1
                    ? "Step 1: Basic Information"
                    : "Step 2: Warranty Terms"}
                </p>
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep === 1 ? "text-blue-600" : "text-green-600"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep === 1
                          ? "bg-blue-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {currentStep === 1 ? "1" : "✓"}
                    </div>
                    <span className="text-xs font-medium">Basic Info</span>
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div
                    className={`flex items-center gap-2 ${
                      currentStep === 2 ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep === 2
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      2
                    </div>
                    <span className="text-xs font-medium">Warranty Terms</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">
                          Model Name *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 transition-colors ${
                            fieldErrors.vehicleModelName
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                          value={formData.vehicleModelName}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              vehicleModelName: e.target.value,
                            });
                            if (fieldErrors.vehicleModelName) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                vehicleModelName: "",
                              }));
                            }
                          }}
                          placeholder="e.g., Model S, Cybertruck"
                        />
                        {fieldErrors.vehicleModelName && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.vehicleModelName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">
                          SKU *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 transition-colors ${
                            fieldErrors.sku
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                          value={formData.sku}
                          onChange={(e) => {
                            setFormData({ ...formData, sku: e.target.value });
                            if (fieldErrors.sku) {
                              setFieldErrors((prev) => ({ ...prev, sku: "" }));
                            }
                          }}
                          placeholder="MODEL-S-2024"
                        />
                        {fieldErrors.sku && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.sku}
                          </p>
                        )}
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          Vehicle Company ID *
                          <span className="text-xs text-gray-500 font-normal">
                            (Auto-filled from your account)
                          </span>
                        </label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700 placeholder-gray-400 font-mono text-sm cursor-not-allowed"
                          value={formData.vehicleCompanyId}
                          readOnly
                          placeholder="Loading company ID..."
                        />
                        {formData.vehicleCompanyId && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Using your company ID from account
                          </p>
                        )}
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          Place of Manufacture *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 transition-colors ${
                            fieldErrors.placeOfManufacture
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                          value={formData.placeOfManufacture}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              placeOfManufacture: e.target.value,
                            });
                            if (fieldErrors.placeOfManufacture) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                placeOfManufacture: "",
                              }));
                            }
                          }}
                          placeholder="e.g., Vietnam, USA, Germany"
                        />
                        {fieldErrors.placeOfManufacture && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.placeOfManufacture}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          Year of Launch (Optional)
                        </label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          value={formData.yearOfLaunch}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              yearOfLaunch: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      General Warranty (Optional)
                    </h3>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-900 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          After creating the model, you can configure specific
                          warranty components in the{" "}
                          <strong>Warranty Config</strong> section.
                        </span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">
                          Duration (Months)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={formData.generalWarrantyDuration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                generalWarrantyDuration: e.target.value,
                              })
                            }
                            placeholder="36"
                            min="1"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            months
                          </span>
                        </div>
                        {formData.generalWarrantyDuration && (
                          <p className="text-xs text-green-600">
                            ≈{" "}
                            {Math.floor(
                              parseInt(formData.generalWarrantyDuration) / 12
                            )}{" "}
                            years
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">
                          Mileage (KM)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            value={formData.generalWarrantyMileage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                generalWarrantyMileage: e.target.value,
                              })
                            }
                            placeholder="100000"
                            min="1"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            km
                          </span>
                        </div>
                        {formData.generalWarrantyMileage && (
                          <p className="text-xs text-orange-600">
                            {(
                              parseInt(formData.generalWarrantyMileage) / 1000
                            ).toFixed(0)}
                            K km
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {formData.vehicleModelName && formData.sku && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            Model Preview
                          </p>
                          <div className="space-y-1 text-xs text-gray-700">
                            <p>
                              <strong>Name:</strong> {formData.vehicleModelName}
                            </p>
                            <p>
                              <strong>SKU:</strong> {formData.sku}
                            </p>
                            {formData.yearOfLaunch && (
                              <p>
                                <strong>Launch:</strong>{" "}
                                {new Date(formData.yearOfLaunch).getFullYear()}
                              </p>
                            )}
                            {(formData.generalWarrantyDuration ||
                              formData.generalWarrantyMileage) && (
                              <p>
                                <strong>Warranty:</strong>{" "}
                                {formData.generalWarrantyDuration &&
                                  `${formData.generalWarrantyDuration} months`}
                                {formData.generalWarrantyDuration &&
                                  formData.generalWarrantyMileage &&
                                  " / "}
                                {formData.generalWarrantyMileage &&
                                  `${parseInt(
                                    formData.generalWarrantyMileage
                                  ).toLocaleString()} km`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: Warranty Components */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Configure Warranty Terms
                    </h3>
                    <button
                      onClick={addComponent}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Warranty Term
                    </button>
                  </div>

                  {components.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        No warranty terms configured yet
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Add at least one component with warranty terms to
                        continue
                      </p>
                      <button
                        onClick={addComponent}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Warranty Term
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {components.map((comp, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900">
                              Warranty Term #{index + 1}
                            </span>
                            <button
                              onClick={() => removeComponent(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {/* Toggle between existing and new component */}
                            <div className="flex gap-4 p-2 bg-white border border-gray-200 rounded-lg">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`mode-${index}`}
                                  checked={!comp.isNew}
                                  onChange={() =>
                                    updateComponent(index, "isNew", "false")
                                  }
                                  className="text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Select Existing Component
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`mode-${index}`}
                                  checked={comp.isNew}
                                  onChange={() =>
                                    updateComponent(index, "isNew", "true")
                                  }
                                  className="text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Create New Component
                                </span>
                              </label>
                            </div>

                            {/* Existing component selection */}
                            {!comp.isNew && (
                              <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">
                                  Component Type *
                                </label>
                                <select
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  value={comp.typeComponentId}
                                  onChange={(e) =>
                                    updateComponent(
                                      index,
                                      "typeComponentId",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select component...</option>
                                  {availableComponents.map((c) => (
                                    <option
                                      key={c.typeComponentId}
                                      value={c.typeComponentId}
                                    >
                                      {c.typeComponent.name} (
                                      {c.typeComponent.sku})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* New component creation fields */}
                            {comp.isNew && (
                              <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                      Component Name *
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      value={comp.name}
                                      onChange={(e) =>
                                        updateComponent(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., Battery Pack 60kWh"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                      SKU *
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      value={comp.sku}
                                      onChange={(e) =>
                                        updateComponent(
                                          index,
                                          "sku",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., BAT-60KWH-001"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                      Category *
                                    </label>
                                    <select
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      value={comp.category}
                                      onChange={(e) =>
                                        updateComponent(
                                          index,
                                          "category",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">
                                        Select category...
                                      </option>
                                      {CATEGORIES.map((cat) => (
                                        <option
                                          key={cat.value}
                                          value={cat.value}
                                        >
                                          {cat.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 block mb-1">
                                      Price *
                                    </label>
                                    <input
                                      type="number"
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      value={comp.price}
                                      onChange={(e) =>
                                        updateComponent(
                                          index,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      placeholder="0.00"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-700 block mb-1">
                                    Make/Brand *
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={comp.makeBrand}
                                    onChange={(e) =>
                                      updateComponent(
                                        index,
                                        "makeBrand",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., LG Chem"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Warranty fields (common for both modes) */}
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">
                                  Quantity *
                                </label>
                                <input
                                  type="number"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  value={comp.quantity}
                                  onChange={(e) =>
                                    updateComponent(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  placeholder="1"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">
                                  Warranty Duration (Months) *
                                </label>
                                <input
                                  type="number"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  value={comp.durationMonth}
                                  onChange={(e) =>
                                    updateComponent(
                                      index,
                                      "durationMonth",
                                      e.target.value
                                    )
                                  }
                                  placeholder="36"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">
                                  Mileage Limit (KM) *
                                </label>
                                <input
                                  type="number"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  value={comp.mileageLimit}
                                  onChange={(e) =>
                                    updateComponent(
                                      index,
                                      "mileageLimit",
                                      e.target.value
                                    )
                                  }
                                  placeholder="100000"
                                  min="1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-900 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        You must add at least one warranty component. These
                        define specific coverage for individual parts of the
                        vehicle.
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              {currentStep === 1 ? (
                <>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Next: Set Warranty Terms
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || components.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Model
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function VehicleManagement() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showAddWarrantyModal, setShowAddWarrantyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [warrantyComponents, setWarrantyComponents] = useState<
    WarrantyComponent[]
  >([]);
  const [loadingWarranty, setLoadingWarranty] = useState(false);
  const [addWarrantyLoading, setAddWarrantyLoading] = useState(false);
  const [editWarrantyLoading, setEditWarrantyLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [componentToDelete, setComponentToDelete] =
    useState<WarrantyComponent | null>(null);
  const [componentToEdit, setComponentToEdit] =
    useState<WarrantyComponent | null>(null);
  const [newWarrantyTerm, setNewWarrantyTerm] = useState({
    isNew: false,
    typeComponentId: "",
    name: "",
    price: "",
    sku: "",
    category: "",
    makeBrand: "",
    durationMonth: "",
    mileageLimit: "",
    quantity: "1",
  });
  const [availableComponents, setAvailableComponents] = useState<
    Array<{
      typeComponentId: string;
      typeComponent: { name: string; sku: string };
    }>
  >([]);

  useEffect(() => {
    fetchVehicleModels();
  }, []);

  const fetchVehicleModels = async () => {
    try {
      setLoading(true);
      const models = await vehicleModelService.getVehicleModels();
      setVehicleModels(models);
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      toast.error("Failed to load vehicle models");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchVehicleModels();
  };

  // Filter models based on search query
  const filteredModels = vehicleModels.filter(
    (model) =>
      model.vehicleModelName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      model.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Vehicle Management
                  </h1>
                </div>
                <p className="text-gray-600">
                  Manage vehicle models and bulk operations
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Create Model
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  <Upload className="w-5 h-5" />
                  Bulk Upload
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-blue-600" />
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Total Models
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {(vehicleModels || []).length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div className="group relative">
                      <Info className="w-5 h-5 text-green-500" />
                      <div className="absolute right-0 top-8 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
                        Models that have general warranty coverage configured
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-green-900 mb-1">
                    With General Warranty
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {
                      (vehicleModels || []).filter(
                        (m) =>
                          m.generalWarrantyDuration || m.generalWarrantyMileage
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-purple-600" />
                    <div className="group relative">
                      <Info className="w-5 h-5 text-purple-500" />
                      <div className="absolute right-0 top-8 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
                        Average warranty duration across all models
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-purple-900 mb-1">
                    Avg Warranty Duration
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {vehicleModels.length > 0
                      ? Math.round(
                          (vehicleModels || []).reduce(
                            (sum, m) => sum + (m.generalWarrantyDuration || 0),
                            0
                          ) /
                            vehicleModels.filter(
                              (m) => m.generalWarrantyDuration
                            ).length || 0
                        )
                      : 0}
                    <span className="text-sm font-normal text-purple-700 ml-1">
                      months
                    </span>
                  </p>
                </div>
              </div>

              {/* Vehicle Models List */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Vehicle Models
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "grid"
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "list"
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by model name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : filteredModels.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">
                        {searchQuery
                          ? "No models match your search"
                          : "No vehicle models found"}
                      </p>
                      <p className="text-sm mt-1">
                        {searchQuery
                          ? "Try a different search term"
                          : "Create your first vehicle model to get started"}
                      </p>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(filteredModels || []).map((model) => (
                        <motion.div
                          key={model.vehicleModelId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowDetailModal(true);
                          }}
                          className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white group cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Car className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {model.vehicleModelName}
                                </h4>
                                <p className="text-xs text-gray-500 font-mono">
                                  {model.sku}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {/* General Warranty Info */}
                            {(model.generalWarrantyDuration ||
                              model.generalWarrantyMileage) && (
                              <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <Info className="w-4 h-4 text-blue-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-blue-900">
                                    General Warranty
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    {model.generalWarrantyDuration &&
                                      `${model.generalWarrantyDuration} months`}
                                    {model.generalWarrantyDuration &&
                                      model.generalWarrantyMileage &&
                                      " / "}
                                    {model.generalWarrantyMileage &&
                                      `${model.generalWarrantyMileage.toLocaleString()} km`}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Warranty Components */}
                            {model.warrantyComponents &&
                              model.warrantyComponents.length > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                  <Package className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-medium text-green-700">
                                    {model.warrantyComponents.length} warranty
                                    component
                                    {model.warrantyComponents.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                </div>
                              )}

                            {/* Year of Launch */}
                            {model.yearOfLaunch && (
                              <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-medium text-purple-700">
                                  Launched{" "}
                                  {new Date(model.yearOfLaunch).getFullYear()}
                                </span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-500 font-mono truncate">
                                ID: {model.vehicleModelId.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(filteredModels || []).map((model) => (
                        <motion.div
                          key={model.vehicleModelId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowDetailModal(true);
                          }}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all bg-white cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Car className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900">
                                  {model.vehicleModelName}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-xs text-gray-500">
                                    SKU:{" "}
                                    <span className="font-mono">
                                      {model.sku}
                                    </span>
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono">
                                    ID: {model.vehicleModelId.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {/* Year Badge */}
                              {model.yearOfLaunch && (
                                <div className="px-2 py-1 bg-purple-100 border border-purple-200 rounded text-xs font-medium text-purple-700">
                                  {new Date(model.yearOfLaunch).getFullYear()}
                                </div>
                              )}

                              {/* General Warranty Badge */}
                              {(model.generalWarrantyDuration ||
                                model.generalWarrantyMileage) && (
                                <div className="px-2 py-1 bg-blue-100 border border-blue-200 rounded text-xs font-medium text-blue-700">
                                  {model.generalWarrantyDuration &&
                                    `${model.generalWarrantyDuration}mo`}
                                  {model.generalWarrantyDuration &&
                                    model.generalWarrantyMileage &&
                                    " / "}
                                  {model.generalWarrantyMileage &&
                                    `${(
                                      model.generalWarrantyMileage / 1000
                                    ).toFixed(0)}K km`}
                                </div>
                              )}

                              {/* Warranty Components Badge */}
                              {model.warrantyComponents &&
                                model.warrantyComponents.length > 0 && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                    <Package className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">
                                      {model.warrantyComponents.length}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bulk Upload Vehicles
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload a prepared Excel file containing vehicle data to
                    create multiple vehicles at once.
                  </p>
                </button>

                <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Requirements
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>VIN:</strong> Vehicle Identification Number
                        (unique)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>Model SKU:</strong> Vehicle model identifier
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>Date:</strong> Manufacturing date (YYYY-MM-DD)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        <strong>Place:</strong> Manufacturing location
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <VehicleBulkUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Create Model Modal */}
      <CreateVehicleModelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Vehicle Model Detail Modal */}
      {showDetailModal && selectedModel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedModel.vehicleModelName}
                  </h2>
                  <p className="text-sm text-gray-600 font-mono">
                    {selectedModel.sku}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedModel(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* General Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  General Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Model ID
                    </p>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {selectedModel.vehicleModelId}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      SKU
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedModel.sku}
                    </p>
                  </div>
                  {selectedModel.yearOfLaunch && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Year of Launch
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedModel.yearOfLaunch).getFullYear()}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Created At
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedModel.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warranty Information */}
              {(selectedModel.generalWarrantyDuration ||
                selectedModel.generalWarrantyMileage) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    General Warranty
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedModel.generalWarrantyDuration && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <p className="text-xs font-medium text-green-900 mb-1">
                          Duration
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {selectedModel.generalWarrantyDuration}{" "}
                          <span className="text-sm font-normal">months</span>
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          ~
                          {Math.floor(
                            selectedModel.generalWarrantyDuration / 12
                          )}{" "}
                          years
                        </p>
                      </div>
                    )}
                    {selectedModel.generalWarrantyMileage && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          Mileage
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {selectedModel.generalWarrantyMileage.toLocaleString()}{" "}
                          <span className="text-sm font-normal">km</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warranty Components */}
              {selectedModel.warrantyComponents &&
                selectedModel.warrantyComponents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Warranty Components (
                      {selectedModel.warrantyComponents.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedModel.warrantyComponents.map(
                        (component, index) => (
                          <div
                            key={component.id || index}
                            className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-purple-900">
                                  Component #{index + 1}
                                </p>
                                <p className="text-xs text-purple-700 font-mono mt-1">
                                  ID: {component.typeComponentId}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-purple-900">
                                  {component.warrantyPeriodMonths} months
                                </p>
                                <p className="text-xs text-purple-700">
                                  {component.warrantyMileageKm.toLocaleString()}{" "}
                                  km
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Company Info */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Company ID:</strong>{" "}
                  <span className="font-mono">
                    {selectedModel.vehicleCompanyId}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Last Updated:</strong>{" "}
                  {new Date(selectedModel.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={async () => {
                  setShowDetailModal(false);
                  setLoadingWarranty(true);
                  setShowWarrantyModal(true);
                  try {
                    const response =
                      await warrantyComponentService.getWarrantyComponents({
                        vehicleModelId: selectedModel.vehicleModelId,
                        page: 1,
                        limit: 100,
                      });
                    setWarrantyComponents(response.data.items || []);
                  } catch (error) {
                    console.error("Error loading warranty components:", error);
                    toast.error("Failed to load warranty terms");
                  } finally {
                    setLoadingWarranty(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Manage Warranty Terms
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedModel(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Warranty Terms Management Modal */}
      {showWarrantyModal && selectedModel && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[60] p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Warranty Terms for {selectedModel.vehicleModelName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure warranty components and terms for this vehicle model
                </p>
              </div>
              <button
                onClick={() => {
                  setShowWarrantyModal(false);
                  setWarrantyComponents([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {loadingWarranty ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : warrantyComponents.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Warranty Terms Yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    This vehicle model doesn&apos;t have any warranty components
                    configured yet.
                  </p>
                  <button
                    onClick={() => {
                      setShowAddWarrantyModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add Warranty Terms
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {warrantyComponents.length} Warranty Term
                      {warrantyComponents.length !== 1 ? "s" : ""}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddWarrantyModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Term
                    </button>
                  </div>

                  {warrantyComponents.map((component, index) => {
                    const componentId =
                      component.warrantyComponentId || component.id;
                    return (
                      <motion.div
                        key={componentId || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Vehicle Model */}
                            <div className="flex items-center gap-2">
                              <Car className="w-5 h-5 text-blue-600" />
                              <div>
                                <span className="text-sm font-semibold text-gray-900">
                                  {component.vehicleModel?.vehicleModelName}
                                </span>
                                {component.vehicleModel?.makeBrand && (
                                  <span className="text-gray-500 text-sm ml-2">
                                    ({component.vehicleModel.makeBrand})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Component Name */}
                            <div className="flex items-center gap-2">
                              <Package className="w-5 h-5 text-purple-600" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {component.typeComponent?.name}
                                </span>
                              </div>
                            </div>

                            {/* SKU */}
                            <div className="flex items-center gap-2">
                              <Hash className="w-5 h-5 text-gray-500" />
                              <span className="text-sm text-gray-600 font-mono">
                                {component.typeComponent?.sku}
                              </span>
                            </div>

                            {/* Warranty Terms */}
                            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Quantity
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {component.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Duration
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {component.durationMonth} months
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-orange-600" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Mileage
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {component.mileageLimit.toLocaleString()} km
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 relative z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setComponentToEdit(component);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setComponentToDelete(component);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowWarrantyModal(false);
                  setWarrantyComponents([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Warranty Terms Modal */}
      {showAddWarrantyModal && selectedModel && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddWarrantyModal(false);
              setNewWarrantyTerm({
                isNew: false,
                typeComponentId: "",
                name: "",
                price: "",
                sku: "",
                category: "",
                makeBrand: "",
                durationMonth: "",
                mileageLimit: "",
                quantity: "1",
              });
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-green-600" />
                  Add Warranty Term
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedModel.vehicleModelName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddWarrantyModal(false);
                  setNewWarrantyTerm({
                    isNew: false,
                    typeComponentId: "",
                    name: "",
                    price: "",
                    sku: "",
                    category: "",
                    makeBrand: "",
                    durationMonth: "",
                    mileageLimit: "",
                    quantity: "1",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content - Form */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  // Validate required fields
                  if (newWarrantyTerm.isNew) {
                    if (!newWarrantyTerm.name.trim()) {
                      toast.error("Component name is required");
                      return;
                    }
                    if (!newWarrantyTerm.sku.trim()) {
                      toast.error("SKU is required");
                      return;
                    }
                    if (
                      !newWarrantyTerm.price ||
                      parseFloat(newWarrantyTerm.price) <= 0
                    ) {
                      toast.error("Valid price is required");
                      return;
                    }
                    if (!newWarrantyTerm.category) {
                      toast.error("Category is required");
                      return;
                    }
                    if (!newWarrantyTerm.makeBrand.trim()) {
                      toast.error("Make/Brand is required");
                      return;
                    }
                  } else {
                    if (!newWarrantyTerm.typeComponentId) {
                      toast.error("Please select a component");
                      return;
                    }
                  }

                  // Validate common fields
                  if (
                    !newWarrantyTerm.quantity ||
                    parseInt(newWarrantyTerm.quantity) <= 0
                  ) {
                    toast.error("Valid quantity is required");
                    return;
                  }
                  if (
                    !newWarrantyTerm.durationMonth ||
                    parseInt(newWarrantyTerm.durationMonth) <= 0
                  ) {
                    toast.error("Valid warranty duration is required");
                    return;
                  }
                  if (
                    !newWarrantyTerm.mileageLimit ||
                    parseInt(newWarrantyTerm.mileageLimit) <= 0
                  ) {
                    toast.error("Valid mileage limit is required");
                    return;
                  }

                  setAddWarrantyLoading(true);

                  try {
                    // Build payload - ONLY include relevant fields for each mode
                    let payload;

                    if (newWarrantyTerm.isNew) {
                      // New component - send all fields
                      payload = [
                        {
                          quantity: parseInt(newWarrantyTerm.quantity),
                          durationMonth: parseInt(
                            newWarrantyTerm.durationMonth
                          ),
                          mileageLimit: parseInt(newWarrantyTerm.mileageLimit),
                          name: newWarrantyTerm.name,
                          price: parseFloat(newWarrantyTerm.price),
                          sku: newWarrantyTerm.sku,
                          category: newWarrantyTerm.category,
                          makeBrand: newWarrantyTerm.makeBrand,
                        },
                      ];
                    } else {
                      // Existing component - ONLY send typeComponentId and warranty terms
                      payload = [
                        {
                          typeComponentId: newWarrantyTerm.typeComponentId,
                          quantity: parseInt(newWarrantyTerm.quantity),
                          durationMonth: parseInt(
                            newWarrantyTerm.durationMonth
                          ),
                          mileageLimit: parseInt(newWarrantyTerm.mileageLimit),
                        },
                      ];
                    }

                    await vehicleModelService.addWarrantyComponents(
                      selectedModel.vehicleModelId,
                      payload
                    );

                    toast.success("Warranty term added successfully");
                    setShowAddWarrantyModal(false);

                    // Reload warranty components
                    const response =
                      await warrantyComponentService.getWarrantyComponents({
                        vehicleModelId: selectedModel.vehicleModelId,
                        page: 1,
                        limit: 100,
                      });
                    setWarrantyComponents(response.data.items || []);

                    // Reset form
                    setNewWarrantyTerm({
                      isNew: false,
                      typeComponentId: "",
                      name: "",
                      price: "",
                      sku: "",
                      category: "",
                      makeBrand: "",
                      durationMonth: "",
                      mileageLimit: "",
                      quantity: "1",
                    });
                  } catch (error) {
                    console.error("Error adding warranty term:", error);
                    toast.error("Failed to add warranty term");
                  } finally {
                    setAddWarrantyLoading(false);
                  }
                }}
                className="space-y-5"
              >
                {/* Component Selection Mode */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Component Source
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!newWarrantyTerm.isNew}
                        onChange={() =>
                          setNewWarrantyTerm({
                            ...newWarrantyTerm,
                            isNew: false,
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        Existing Component
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={newWarrantyTerm.isNew}
                        onChange={() =>
                          setNewWarrantyTerm({
                            ...newWarrantyTerm,
                            isNew: true,
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        Create New Component
                      </span>
                    </label>
                  </div>
                </div>

                {/* Existing Component Selection */}
                {!newWarrantyTerm.isNew && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Component <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newWarrantyTerm.typeComponentId}
                      onChange={(e) => {
                        setNewWarrantyTerm({
                          ...newWarrantyTerm,
                          typeComponentId: e.target.value,
                        });
                      }}
                      onFocus={async () => {
                        if (availableComponents.length === 0) {
                          try {
                            const componentsData =
                              await inventoryService.getTypeComponents("");
                            const uniqueComponents = Array.from(
                              new Map(
                                componentsData.map((c) => [
                                  c.typeComponentId,
                                  c,
                                ])
                              ).values()
                            );
                            setAvailableComponents(uniqueComponents);
                          } catch (error) {
                            console.error("Error loading components:", error);
                          }
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 [&>option]:bg-white [&>option]:text-gray-900"
                    >
                      <option value="">Select a component...</option>
                      {availableComponents.map((c) => (
                        <option
                          key={c.typeComponentId}
                          value={c.typeComponentId}
                        >
                          {c.typeComponent?.name} - {c.typeComponent?.sku}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* New Component Fields */}
                {newWarrantyTerm.isNew && (
                  <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Component Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newWarrantyTerm.name}
                          onChange={(e) =>
                            setNewWarrantyTerm({
                              ...newWarrantyTerm,
                              name: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Battery Pack 60kWh"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newWarrantyTerm.sku}
                          onChange={(e) =>
                            setNewWarrantyTerm({
                              ...newWarrantyTerm,
                              sku: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., BAT-60KWH-001"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={newWarrantyTerm.category}
                          onChange={(e) =>
                            setNewWarrantyTerm({
                              ...newWarrantyTerm,
                              category: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select category...</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newWarrantyTerm.price}
                          onChange={(e) =>
                            setNewWarrantyTerm({
                              ...newWarrantyTerm,
                              price: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., 15000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Make/Brand <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newWarrantyTerm.makeBrand}
                        onChange={(e) =>
                          setNewWarrantyTerm({
                            ...newWarrantyTerm,
                            makeBrand: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., LG Chem"
                      />
                    </div>
                  </div>
                )}

                {/* Warranty Terms */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Warranty Terms
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newWarrantyTerm.quantity}
                        onChange={(e) =>
                          setNewWarrantyTerm({
                            ...newWarrantyTerm,
                            quantity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Duration (months){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="36"
                        min="1"
                        required
                        value={newWarrantyTerm.durationMonth}
                        onChange={(e) =>
                          setNewWarrantyTerm({
                            ...newWarrantyTerm,
                            durationMonth: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Mileage (km) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="100000"
                        required
                        value={newWarrantyTerm.mileageLimit}
                        onChange={(e) =>
                          setNewWarrantyTerm({
                            ...newWarrantyTerm,
                            mileageLimit: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddWarrantyModal(false);
                      setNewWarrantyTerm({
                        isNew: false,
                        typeComponentId: "",
                        name: "",
                        price: "",
                        sku: "",
                        category: "",
                        makeBrand: "",
                        durationMonth: "",
                        mileageLimit: "",
                        quantity: "1",
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addWarrantyLoading}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addWarrantyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Warranty Term
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && componentToDelete && selectedModel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Confirm Deletion
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setComponentToDelete(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to remove the warranty term for:
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <p className="font-semibold text-gray-900">
                    {componentToDelete.typeComponent?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    SKU: {componentToDelete.typeComponent?.sku}
                  </p>
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Duration: {componentToDelete.durationMonth} months
                    </span>
                    <span className="text-xs text-gray-500">
                      Mileage: {componentToDelete.mileageLimit.toLocaleString()}{" "}
                      km
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setComponentToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const componentId =
                      componentToDelete.warrantyComponentId ||
                      componentToDelete.id;
                    if (!componentId) {
                      toast.error("Invalid component ID");
                      return;
                    }

                    try {
                      await warrantyComponentService.deleteWarrantyComponent(
                        componentId
                      );
                      toast.success("Warranty term deleted successfully");
                      setShowDeleteModal(false);
                      setComponentToDelete(null);

                      // Reload warranty components
                      const response =
                        await warrantyComponentService.getWarrantyComponents({
                          vehicleModelId: selectedModel.vehicleModelId,
                          page: 1,
                          limit: 100,
                        });
                      setWarrantyComponents(response.data.items || []);
                    } catch (error) {
                      console.error("Error deleting warranty term:", error);
                      toast.error("Failed to delete warranty term");
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Warranty Modal */}
      <AnimatePresence>
        {showEditModal && componentToEdit && selectedModel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-blue-600" />
                      Edit Warranty Terms
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {componentToEdit.typeComponent?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setComponentToEdit(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  const formData = new FormData(e.currentTarget);
                  const quantity = formData.get("quantity") as string;
                  const durationMonth = formData.get("durationMonth") as string;
                  const mileageLimit = formData.get("mileageLimit") as string;

                  if (!quantity || parseInt(quantity) <= 0) {
                    toast.error("Valid quantity is required");
                    return;
                  }
                  if (!durationMonth || parseInt(durationMonth) <= 0) {
                    toast.error("Valid warranty duration is required");
                    return;
                  }
                  if (!mileageLimit || parseInt(mileageLimit) <= 0) {
                    toast.error("Valid mileage limit is required");
                    return;
                  }

                  setEditWarrantyLoading(true);

                  try {
                    const componentId =
                      componentToEdit.warrantyComponentId || componentToEdit.id;

                    await warrantyComponentService.updateWarrantyComponent(
                      componentId,
                      {
                        quantity: parseInt(quantity),
                        durationMonth: parseInt(durationMonth),
                        mileageLimit: parseInt(mileageLimit),
                      }
                    );

                    toast.success("Warranty terms updated successfully");
                    setShowEditModal(false);
                    setComponentToEdit(null);

                    // Reload warranty components
                    const response =
                      await warrantyComponentService.getWarrantyComponents({
                        vehicleModelId: selectedModel.vehicleModelId,
                        page: 1,
                        limit: 100,
                      });
                    setWarrantyComponents(response.data.items || []);
                  } catch (error) {
                    console.error("Error updating warranty terms:", error);
                    toast.error("Failed to update warranty terms");
                  } finally {
                    setEditWarrantyLoading(false);
                  }
                }}
                className="p-6 space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      required
                      defaultValue={componentToEdit.quantity}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (months) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="durationMonth"
                      min="1"
                      required
                      defaultValue={componentToEdit.durationMonth}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mileage Limit (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="mileageLimit"
                      min="1"
                      required
                      defaultValue={componentToEdit.mileageLimit}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setComponentToEdit(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editWarrantyLoading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editWarrantyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { VehicleManagement };
