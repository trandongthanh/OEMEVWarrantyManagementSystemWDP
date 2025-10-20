"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Save,
  Search,
  Package,
  AlertCircle,
  CheckCircle,
  Wrench,
  FileText,
  Shield,
  ShieldOff,
} from "lucide-react";
import technicianService, {
  CaseLineInput,
  CompatibleComponent,
} from "@/services/technicianService";

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vin: string;
  recordId: string; // Processing record ID for API calls
  caseId: string;
  onSuccess?: () => void;
}

interface CaseLineForm extends CaseLineInput {
  id?: string;
}

// EV-specific categories matching backend TypeComponent table
const COMPONENT_CATEGORIES = [
  // EV-Specific Systems
  { value: "HIGH_VOLTAGE_BATTERY", label: "High Voltage Battery & BMS" },
  { value: "POWERTRAIN", label: "Powertrain (Motor, Inverter, Transmission)" },
  { value: "CHARGING_SYSTEM", label: "Charging System & Port" },
  {
    value: "THERMAL_MANAGEMENT",
    label: "Thermal Management (Battery & Motor)",
  },

  // Standard Systems
  {
    value: "LOW_VOLTAGE_SYSTEM",
    label: "Low Voltage System (12V & Accessories)",
  },
  { value: "BRAKING", label: "Braking System (incl. Regenerative)" },
  { value: "SUSPENSION_STEERING", label: "Suspension & Steering" },
  { value: "HVAC", label: "HVAC (Climate Control)" },
  { value: "BODY_CHASSIS", label: "Body & Chassis" },
  { value: "INFOTAINMENT_ADAS", label: "Infotainment & ADAS" },
];

export function CaseDetailsModal({
  isOpen,
  onClose,
  vin,
  recordId,
  caseId,
  onSuccess,
}: CaseDetailsModalProps) {
  const [caseLines, setCaseLines] = useState<CaseLineForm[]>([
    {
      diagnosisText: "",
      correctionText: "",
      componentId: null,
      quantity: 0,
      warrantyStatus: "ELIGIBLE",
    },
  ]);
  const [searchCategory, setSearchCategory] = useState("HIGH_VOLTAGE_BATTERY");
  const [searchQuery, setSearchQuery] = useState("");
  const [components, setComponents] = useState<CompatibleComponent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComponentSearch, setShowComponentSearch] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen && recordId) {
      console.log("🔍 CaseDetailsModal opened with recordId:", recordId);
      searchComponents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchCategory]);

  const searchComponents = async () => {
    if (!recordId) {
      setErrorMessage(
        "No processing record ID available. Please try refreshing the page."
      );
      return;
    }

    setIsSearching(true);
    setErrorMessage(""); // Clear previous errors
    try {
      const response = await technicianService.searchCompatibleComponents(
        recordId, // Use recordId instead of vin
        searchCategory,
        searchQuery || undefined
      );
      setComponents(response.data?.result || []);
    } catch (error: unknown) {
      console.error("Error searching components:", error);
      const errMsg =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to search components. Please try again.";
      setErrorMessage(errMsg);
      setComponents([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCaseLine = () => {
    setCaseLines([
      ...caseLines,
      {
        diagnosisText: "",
        correctionText: "",
        componentId: null,
        quantity: 0,
        warrantyStatus: "ELIGIBLE",
      },
    ]);
  };

  const handleRemoveCaseLine = (index: number) => {
    if (caseLines.length > 1) {
      setCaseLines(caseLines.filter((_, i) => i !== index));
    }
  };

  const handleCaseLineChange = (
    index: number,
    field: keyof CaseLineForm,
    value: string | number | null
  ) => {
    const newCaseLines = [...caseLines];
    newCaseLines[index] = { ...newCaseLines[index], [field]: value };
    setCaseLines(newCaseLines);
  };

  const handleSelectComponent = (component: CompatibleComponent) => {
    if (activeLineIndex !== null) {
      // Set component ID
      handleCaseLineChange(
        activeLineIndex,
        "componentId",
        component.typeComponentId
      );
      // Automatically set warranty status based on backend calculation
      handleCaseLineChange(
        activeLineIndex,
        "warrantyStatus",
        component.isUnderWarranty ? "ELIGIBLE" : "INELIGIBLE"
      );
      setShowComponentSearch(false);
      setActiveLineIndex(null);
    }
  };

  const handleOpenComponentSearch = (index: number) => {
    setActiveLineIndex(index);
    setShowComponentSearch(true);
  };

  const handleSubmit = async () => {
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    const hasInvalidLines = caseLines.some(
      (line) =>
        !line.diagnosisText.trim() ||
        !line.correctionText.trim() ||
        (line.componentId && line.quantity < 1)
    );

    if (hasInvalidLines) {
      setErrorMessage(
        "Please fill in all required fields (diagnosis and correction are required)"
      );
      return;
    }

    setIsSaving(true);
    try {
      // Create case lines
      await technicianService.createCaseLines(caseId, { caselines: caseLines });

      // If there are components with quantities, update stock
      const linesWithComponents = caseLines.filter(
        (line) => line.componentId && line.quantity > 0
      );

      if (linesWithComponents.length > 0) {
        const stockData = linesWithComponents.map((line, index) => ({
          id: `temp-${index}`, // Temporary ID
          componentId: line.componentId!,
          quantity: line.quantity,
        }));

        await technicianService.updateStockQuantities(caseId, stockData);
      }

      setSuccessMessage("Case lines saved successfully!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500); // Show success message briefly before closing
    } catch (error: unknown) {
      console.error("Error saving case lines:", error);
      const errMsg =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to save case lines";
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Case Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                VIN: {vin} | Case ID: {caseId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Error/Success Messages */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Component Search Section */}
            {showComponentSearch && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Search Compatible Components
                  </h3>
                  <button
                    onClick={() => {
                      setShowComponentSearch(false);
                      setActiveLineIndex(null);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-3 mb-4">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COMPONENT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={searchComponents}
                    disabled={isSearching}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSearching ? (
                      <>Searching...</>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Search
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {components.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      No components found
                    </div>
                  ) : (
                    components.map((component) => (
                      <button
                        key={component.typeComponentId}
                        onClick={() => handleSelectComponent(component)}
                        className="p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {component.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {component.typeComponentId}
                            </p>
                          </div>
                          {component.isUnderWarranty ? (
                            <Shield className="w-5 h-5 text-green-600" />
                          ) : (
                            <ShieldOff className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Case Lines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Diagnosis & Repair Actions
                </h3>
                <button
                  onClick={handleAddCaseLine}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Line
                </button>
              </div>

              {caseLines.map((caseLine, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      Line {index + 1}
                    </span>
                    {caseLines.length > 1 && (
                      <button
                        onClick={() => handleRemoveCaseLine(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Diagnosis *
                      </label>
                      <textarea
                        value={caseLine.diagnosisText}
                        onChange={(e) =>
                          handleCaseLineChange(
                            index,
                            "diagnosisText",
                            e.target.value
                          )
                        }
                        placeholder="Describe the problem found..."
                        rows={3}
                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Wrench className="w-4 h-4 inline mr-1" />
                        Correction *
                      </label>
                      <textarea
                        value={caseLine.correctionText}
                        onChange={(e) =>
                          handleCaseLineChange(
                            index,
                            "correctionText",
                            e.target.value
                          )
                        }
                        placeholder="Describe the repair action..."
                        rows={3}
                        className="w-full px-4 text-black py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package className="w-4 h-4 inline mr-1" />
                        Component
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={caseLine.componentId || ""}
                          readOnly
                          placeholder="No component selected"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                        />
                        <button
                          onClick={() => handleOpenComponentSearch(index)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={caseLine.quantity}
                        onChange={(e) =>
                          handleCaseLineChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 text-black py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Status
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      {caseLine.warrantyStatus === "ELIGIBLE" ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="font-medium text-green-700">
                              Warranty Eligible
                            </span>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Component is covered under active warranty
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <span className="font-medium text-red-700">
                              Warranty Ineligible
                            </span>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Component is not covered by warranty
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ℹ️ Warranty status is automatically determined by the
                      system based on component coverage
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Case Lines
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}