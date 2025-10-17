"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertCircle,
  Loader,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";
import technicianService, {
  type CaseLineInput,
  type CompatibleComponent,
} from "@/services/technicianService";

interface CreateCaseLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  caseId: string;
  onSuccess: () => void;
}

export function CreateCaseLinesModal({
  isOpen,
  onClose,
  recordId,
  caseId,
  onSuccess,
}: CreateCaseLinesModalProps) {
  const [caseLines, setCaseLines] = useState<CaseLineInput[]>([
    {
      diagnosisText: "",
      correctionText: "",
      componentId: null,
      quantity: 0,
      warrantyStatus: "ELIGIBLE",
    },
  ]);
  const [components, setComponents] = useState<CompatibleComponent[]>([]);
  const [searchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadComponents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, recordId]);

  const loadComponents = async () => {
    try {
      const response = await technicianService.searchCompatibleComponents(
        recordId
      );
      setComponents(response.data.components);
    } catch (err: unknown) {
      console.error("Error loading components:", err);
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
    field: keyof CaseLineInput,
    value: string | number | null
  ) => {
    const updated = [...caseLines];
    if (field === "quantity") {
      updated[index][field] = Number(value);
    } else if (field === "warrantyStatus") {
      updated[index][field] = value as "ELIGIBLE" | "INELIGIBLE";
    } else if (field === "componentId") {
      updated[index][field] = value as string | null;
    } else {
      updated[index][field] = value as string;
    }
    setCaseLines(updated);
  };

  const handleSubmit = async () => {
    // Validation
    const validCaseLines = caseLines.filter(
      (cl) => cl.diagnosisText.trim() && cl.correctionText.trim()
    );

    if (validCaseLines.length === 0) {
      setError(
        "Please add at least one case line with diagnosis and correction"
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await technicianService.createCaseLines(caseId, {
        caselines: validCaseLines,
      });
      onSuccess();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create case lines";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredComponents = components.filter(
    (comp) =>
      comp.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create Case Lines
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Add diagnosis and correction work items
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Case Lines */}
                  {caseLines.map((caseLine, index) => (
                    <div
                      key={index}
                      className="p-4 border-2 border-gray-200 rounded-xl space-y-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          Case Line {index + 1}
                        </h3>
                        {caseLines.length > 1 && (
                          <button
                            onClick={() => handleRemoveCaseLine(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Diagnosis */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diagnosis Text *
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
                          placeholder="Describe the diagnostic findings..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white resize-none transition-colors"
                        />
                      </div>

                      {/* Correction */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correction Text *
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
                          placeholder="Describe the corrective action taken..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white resize-none transition-colors"
                        />
                      </div>

                      {/* Component Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Component (Optional)
                        </label>
                        <select
                          value={caseLine.componentId || ""}
                          onChange={(e) =>
                            handleCaseLineChange(
                              index,
                              "componentId",
                              e.target.value || null
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
                        >
                          <option value="">No component</option>
                          {filteredComponents.map((comp) => (
                            <option
                              key={comp.componentId}
                              value={comp.componentId}
                            >
                              {comp.componentName} ({comp.partNumber}) - Stock:{" "}
                              {comp.quantityInStock}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Quantity */}
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
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
                          />
                        </div>

                        {/* Warranty Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Warranty Status *
                          </label>
                          <select
                            value={caseLine.warrantyStatus}
                            onChange={(e) =>
                              handleCaseLineChange(
                                index,
                                "warrantyStatus",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
                          >
                            <option value="ELIGIBLE">Eligible</option>
                            <option value="INELIGIBLE">Ineligible</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Case Line Button */}
                  <button
                    onClick={handleAddCaseLine}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Case Line
                  </button>

                  {error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create Case Lines
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
