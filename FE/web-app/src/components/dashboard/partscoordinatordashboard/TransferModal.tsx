"use client";

import { useState, useEffect } from "react";
import { warehouseService } from "@/services/warehouseService";
import { AnimatePresence, motion } from "framer-motion";
import {
  Package,
  Hash,
  Building2,
  ArrowRight,
  Loader,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

interface TransferComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Component {
  id: string;
  name: string;
  code: string;
}

interface Warehouse {
  warehouseId: string;
  name: string;
}

export default function TransferComponentModal({
  isOpen,
  onClose,
}: TransferComponentModalProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [targetWarehouseId, setTargetWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load components & warehouses when modal opens
  useEffect(() => {
    if (isOpen) {
      warehouseService
        .getComponents()
        .then(setComponents)
        .catch((err) => setError("Error loading components: " + err.message));

      warehouseService
        .getWarehouseInfo()
        .then((data) => setWarehouses(data.warehouses))
        .catch((err) => setError("Error loading warehouses: " + err.message));
    } else {
      // Reset form when modal closes
      setSelectedComponent("");
      setQuantity("");
      setSourceWarehouseId("");
      setTargetWarehouseId("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  const sourceWarehouse = warehouses.find(
    (w) => w.warehouseId === sourceWarehouseId
  );
  const targetWarehouse = warehouses.find(
    (w) => w.warehouseId === targetWarehouseId
  );

  const handleTransfer = async () => {
    setError("");

    if (
      !selectedComponent ||
      !quantity ||
      !sourceWarehouseId ||
      !targetWarehouseId
    ) {
      setError("Please fill all fields!");
      return;
    }

    if (sourceWarehouseId === targetWarehouseId) {
      setError("Source and target warehouse cannot be the same!");
      return;
    }

    if (Number(quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      await warehouseService.transferComponent({
        fromWarehouseId: sourceWarehouseId,
        toWarehouseId: targetWarehouseId,
        stockId: selectedComponent,
        quantity: Number(quantity),
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to transfer component");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
                  <ArrowRight className="w-6 h-6 text-blue-600" />
                  Transfer Component
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Move inventory between warehouses
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
              {success && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Transfer Successful!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Component transferred between warehouses
                  </p>
                </motion.div>
              )}

              {!success && (
                <>
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Component Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Component <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                        value={selectedComponent}
                        onChange={(e) => {
                          setSelectedComponent(e.target.value);
                          setError("");
                        }}
                      >
                        <option value="">Select component...</option>
                        {components.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          setError("");
                        }}
                      />
                    </div>
                  </div>

                  {/* Warehouse Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Source Warehouse */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        From Warehouse <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                          value={sourceWarehouseId}
                          onChange={(e) => {
                            setSourceWarehouseId(e.target.value);
                            setError("");
                          }}
                        >
                          <option value="">Select source...</option>
                          {warehouses.map((w) => (
                            <option key={w.warehouseId} value={w.warehouseId}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Target Warehouse */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        To Warehouse <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                          value={targetWarehouseId}
                          onChange={(e) => {
                            setTargetWarehouseId(e.target.value);
                            setError("");
                          }}
                        >
                          <option value="">Select target...</option>
                          {warehouses.map((w) => (
                            <option key={w.warehouseId} value={w.warehouseId}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Flow Visual */}
                  {sourceWarehouse && targetWarehouse && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white rounded-lg border border-gray-200">
                            <Building2 className="w-6 h-6 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {sourceWarehouse.name}
                          </span>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white rounded-lg border border-gray-200">
                            <Building2 className="w-6 h-6 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {targetWarehouse.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={
                    loading ||
                    !selectedComponent ||
                    !quantity ||
                    !sourceWarehouseId ||
                    !targetWarehouseId
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Transfer
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
