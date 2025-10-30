"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Building2,
  Hash,
  CheckCircle,
  AlertCircle,
  Loader,
  Send,
} from "lucide-react";
import { warehouseService } from "@/services/warehouseService";

interface AllocateComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Component {
  id: string;
  name: string;
  code: string;
}

export default function AllocateComponentModal({
  isOpen,
  onClose,
}: AllocateComponentModalProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [quantity, setQuantity] = useState("");
  const [serviceCenterId, setServiceCenterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load components when modal opens
  useEffect(() => {
    if (isOpen) {
      warehouseService
        .getComponents()
        .then(setComponents)
        .catch((err) => setError("Error loading components: " + err.message));

      // Reset states
      setSuccess(false);
      setError("");
    } else {
      // Reset form when modal closes
      setTimeout(() => {
        setSelectedComponent("");
        setQuantity("");
        setServiceCenterId("");
        setError("");
        setSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const handleAllocate = async () => {
    // Validation
    if (!selectedComponent) {
      setError("Please select a component");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (!serviceCenterId) {
      setError("Please enter a service center ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await warehouseService.allocateComponent({
        stockId: selectedComponent,
        quantity: Number(quantity),
        allocatedTo: serviceCenterId,
      });

      setSuccess(true);

      // Auto-close after success animation
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to allocate component");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedComp = components.find((c) => c.id === selectedComponent);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Allocate Component
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Assign components to a service center
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Allocation Successful!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Component has been allocated successfully
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Component Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Component *
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={selectedComponent}
                        onChange={(e) => {
                          setSelectedComponent(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">-- Choose Component --</option>
                        {components.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Component Info */}
                  {selectedComp && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">
                            {selectedComp.name}
                          </p>
                          <p className="text-sm text-blue-700">
                            Code: {selectedComp.code}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter quantity"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Service Center ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Service Center ID *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={serviceCenterId}
                        onChange={(e) => {
                          setServiceCenterId(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter service center ID"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAllocate}
                  disabled={
                    loading ||
                    !selectedComponent ||
                    !quantity ||
                    !serviceCenterId
                  }
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Allocate
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
