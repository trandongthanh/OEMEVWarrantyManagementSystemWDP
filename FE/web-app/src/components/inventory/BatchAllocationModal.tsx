"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Plus,
  Trash2,
  Send,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { warehouseService } from "@/services/warehouseService";

interface BatchAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AllocationItem {
  id: string;
  componentId: string;
  quantity: number;
  allocatedTo: string;
}

interface Component {
  id: string;
  name: string;
  code: string;
  availableQuantity: number;
}

interface ServiceCenter {
  serviceCenterId: string;
  name: string;
}

export default function BatchAllocationModal({
  isOpen,
  onClose,
}: BatchAllocationModalProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [items, setItems] = useState<AllocationItem[]>([
    { id: "1", componentId: "", quantity: 1, allocatedTo: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const comps = await warehouseService.getComponents();
      setComponents(comps as unknown as Component[]);
      // Mock service centers - replace with actual API
      setServiceCenters([
        { serviceCenterId: "sc1", name: "Service Center A" },
        { serviceCenterId: "sc2", name: "Service Center B" },
        { serviceCenterId: "sc3", name: "Service Center C" },
      ]);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load data");
    }
  };

  const resetForm = () => {
    setItems([{ id: "1", componentId: "", quantity: 1, allocatedTo: "" }]);
    setError("");
    setSuccess(false);
    setValidationErrors({});
  };

  const addItem = () => {
    const newId = String(Date.now());
    setItems([
      ...items,
      { id: newId, componentId: "", quantity: 1, allocatedTo: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
      const newErrors = { ...validationErrors };
      delete newErrors[id];
      setValidationErrors(newErrors);
    }
  };

  const updateItem = (
    id: string,
    field: keyof AllocationItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    // Clear validation error for this field
    const errorKey = `${id}-${field}`;
    if (validationErrors[errorKey]) {
      const newErrors = { ...validationErrors };
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  };

  const validateItems = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    items.forEach((item) => {
      if (!item.componentId) {
        errors[`${item.id}-componentId`] = "Component required";
        isValid = false;
      }
      if (!item.allocatedTo) {
        errors[`${item.id}-allocatedTo`] = "Service center required";
        isValid = false;
      }
      if (item.quantity <= 0) {
        errors[`${item.id}-quantity`] = "Quantity must be > 0";
        isValid = false;
      }

      // Check available quantity
      const component = components.find((c) => c.id === item.componentId);
      if (component && item.quantity > component.availableQuantity) {
        errors[
          `${item.id}-quantity`
        ] = `Max available: ${component.availableQuantity}`;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateItems()) {
      setError("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      // Allocate each item
      const promises = items.map((item) =>
        warehouseService.allocateComponent({
          stockId: item.componentId,
          quantity: item.quantity,
          allocatedTo: item.allocatedTo,
        })
      );

      await Promise.all(promises);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to allocate components");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedComponent = (componentId: string) => {
    return components.find((c) => c.id === componentId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Batch Allocation</h2>
                    <p className="text-green-100 text-sm">
                      Allocate multiple components at once
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Success State */}
              {success && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Batch Allocation Complete!
                  </h3>
                  <p className="text-green-700">
                    All {items.length} items allocated successfully.
                  </p>
                </motion.div>
              )}

              {!success && (
                <>
                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Allocation Items */}
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Item {index + 1}
                          </h4>
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Component Selection */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Component
                            </label>
                            <select
                              value={item.componentId}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "componentId",
                                  e.target.value
                                )
                              }
                              className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                                validationErrors[`${item.id}-componentId`]
                                  ? "border-red-300"
                                  : "border-gray-200"
                              }`}
                            >
                              <option value="">Select component</option>
                              {components.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.availableQuantity} available)
                                </option>
                              ))}
                            </select>
                            {validationErrors[`${item.id}-componentId`] && (
                              <p className="text-red-600 text-xs mt-1">
                                {validationErrors[`${item.id}-componentId`]}
                              </p>
                            )}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                                validationErrors[`${item.id}-quantity`]
                                  ? "border-red-300"
                                  : "border-gray-200"
                              }`}
                            />
                            {validationErrors[`${item.id}-quantity`] && (
                              <p className="text-red-600 text-xs mt-1">
                                {validationErrors[`${item.id}-quantity`]}
                              </p>
                            )}
                          </div>

                          {/* Service Center */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              To Service Center
                            </label>
                            <select
                              value={item.allocatedTo}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "allocatedTo",
                                  e.target.value
                                )
                              }
                              className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                                validationErrors[`${item.id}-allocatedTo`]
                                  ? "border-red-300"
                                  : "border-gray-200"
                              }`}
                            >
                              <option value="">Select center</option>
                              {serviceCenters.map((sc) => (
                                <option
                                  key={sc.serviceCenterId}
                                  value={sc.serviceCenterId}
                                >
                                  {sc.name}
                                </option>
                              ))}
                            </select>
                            {validationErrors[`${item.id}-allocatedTo`] && (
                              <p className="text-red-600 text-xs mt-1">
                                {validationErrors[`${item.id}-allocatedTo`]}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Component Preview */}
                        {item.componentId && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-900">
                                {getSelectedComponent(item.componentId)?.name}
                              </span>
                              <span className="text-green-600">•</span>
                              <span className="text-green-700">
                                {
                                  getSelectedComponent(item.componentId)
                                    ?.availableQuantity
                                }{" "}
                                available
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Item Button */}
                  <Button
                    onClick={addItem}
                    className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Item
                  </Button>
                </>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="border-t p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <Button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Allocate All ({items.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
