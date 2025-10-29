"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Package, AlertCircle } from "lucide-react";
import { useState } from "react";
import stockTransferService from "@/services/stockTransferService";

interface CreateStockTransferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  caseLineId?: string;
  warehouseId: string;
  initialItems?: Array<{
    componentId: string;
    componentName: string;
    requestedQuantity: number;
  }>;
}

interface TransferItem {
  componentId: string;
  componentName: string;
  requestedQuantity: number;
}

export function CreateStockTransferRequestModal({
  isOpen,
  onClose,
  onSuccess,
  caseLineId,
  warehouseId,
  initialItems = [],
}: CreateStockTransferRequestModalProps) {
  const [items, setItems] = useState<TransferItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ componentId: "", componentName: "", requestedQuantity: 1 }]
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems([
      ...items,
      { componentId: "", componentName: "", requestedQuantity: 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof TransferItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const invalidItems = items.filter(
      (item) =>
        !item.componentId || !item.componentName || item.requestedQuantity < 1
    );

    if (invalidItems.length > 0) {
      setError("Please fill in all item details with valid quantities");
      return;
    }

    setIsSubmitting(true);

    try {
      await stockTransferService.createRequest({
        requestingWarehouseId: warehouseId,
        caselineIds: caseLineId ? [caseLineId] : [],
        items: items.map((item) => ({
          typeComponentId: item.componentId,
          quantityRequested: item.requestedQuantity,
          caselineId: caseLineId,
        })),
      });

      // Success
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to create stock transfer request:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Failed to create stock transfer request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create Stock Transfer Request
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Request components from company warehouse
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
            >
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Components to Request
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Item {index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Component ID *
                        </label>
                        <input
                          type="text"
                          value={item.componentId}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "componentId",
                              e.target.value
                            )
                          }
                          placeholder="e.g., COMP-12345"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.requestedQuantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "requestedQuantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Component Name *
                      </label>
                      <input
                        type="text"
                        value={item.componentName}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "componentName",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Battery Module"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional information about this request..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Request"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
