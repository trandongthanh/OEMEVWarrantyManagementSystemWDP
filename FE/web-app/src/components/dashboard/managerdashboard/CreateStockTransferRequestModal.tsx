// ⬇ FULL CODE — ĐÃ THÊM SELECT WAREHOUSE
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Package, AlertCircle, Search } from "lucide-react";
import { useState, useEffect } from "react";
import stockTransferService from "@/services/stockTransferService";
import warehouseService from "@/services/warehouseService";
import caseLineService, { type CaseLine } from "@/services/caseLineService";

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

interface TypeComponent {
  typeComponentId: string;
  name: string;
  category?: string;
  sku?: string;
  price?: number;
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
  const [selectedCaseLineId, setSelectedCaseLineId] = useState<string>(
    caseLineId || ""
  );
  const [caseLines, setCaseLines] = useState<CaseLine[]>([]);
  const [loadingCaseLines, setLoadingCaseLines] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableComponents, setAvailableComponents] = useState<
    TypeComponent[]
  >([]);

  const [componentSearch, setComponentSearch] = useState<string[]>(
    items.map(() => "")
  );
  const [showDropdown, setShowDropdown] = useState<boolean[]>(
    items.map(() => false)
  );

  // ⬇⬇⬇ NEW: LOAD WAREHOUSE
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouseId || "");

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const res = await warehouseService.getWarehouseInfo();
        setWarehouses(res.warehouses || []);
      } catch (err) {
        console.error("Load warehouse failed:", err);
      }
    };
    if (isOpen) loadWarehouses();
  }, [isOpen]);
  // ⬆⬆⬆ END NEW

  // Fetch case lines
  useEffect(() => {
    const fetchCaseLines = async () => {
      if (caseLineId) return;

      setLoadingCaseLines(true);
      try {
        const response = await caseLineService.getCaseLinesList({
          status: "CUSTOMER_APPROVED",
          page: 1,
          limit: 100,
        });

        const caseLinesWithComponents = response.data.caseLines.filter(
          (cl) => cl.typeComponentId && cl.quantity
        );

        setCaseLines(caseLinesWithComponents);
      } catch (error) {
        console.error("Failed to fetch case lines:", error);
      } finally {
        setLoadingCaseLines(false);
      }
    };

    if (isOpen) {
      fetchCaseLines();
    }
  }, [isOpen, caseLineId]);

  // Fetch available components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await warehouseService.getWarehouseInfo();
        const allComponents = new Map<string, TypeComponent>();

        response.warehouses.forEach((warehouse) => {
          const stockItems = warehouse.stocks || warehouse.stock || [];
          stockItems.forEach((stock) => {
            if (stock.typeComponent) {
              allComponents.set(stock.typeComponent.typeComponentId, {
                typeComponentId: stock.typeComponent.typeComponentId,
                name: stock.typeComponent.name,
                category: stock.typeComponent.category,
                price: 0,
              });
            }
          });
        });

        setAvailableComponents(Array.from(allComponents.values()));
      } catch (error) {
        console.error("Failed to fetch components:", error);
      }
    };

    if (isOpen) {
      fetchComponents();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(".component-dropdown")) return;
      setShowDropdown(showDropdown.map(() => false));
    };

    if (showDropdown.some((show) => show)) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { componentId: "", componentName: "", requestedQuantity: 1 },
    ]);
    setComponentSearch([...componentSearch, ""]);
    setShowDropdown([...showDropdown, false]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setComponentSearch(componentSearch.filter((_, i) => i !== index));
      setShowDropdown(showDropdown.filter((_, i) => i !== index));
    }
  };

  const handleComponentSelect = (index: number, component: TypeComponent) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      componentId: component.typeComponentId,
      componentName: component.name,
    };
    setItems(newItems);

    const newSearch = [...componentSearch];
    newSearch[index] = component.name;
    setComponentSearch(newSearch);

    const newDropdown = [...showDropdown];
    newDropdown[index] = false;
    setShowDropdown(newDropdown);
  };

  const handleSearchChange = (index: number, value: string) => {
    const newSearch = [...componentSearch];
    newSearch[index] = value;
    setComponentSearch(newSearch);

    const newDropdown = [...showDropdown];
    newDropdown[index] = value.length > 0;
    setShowDropdown(newDropdown);
  };

  const getFilteredComponents = (searchTerm: string) => {
    const query = searchTerm.toLowerCase();
    return availableComponents.filter(
      (comp) =>
        comp.name.toLowerCase().includes(query) ||
        comp.category?.toLowerCase().includes(query)
    );
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

  const handleCaseLineSelect = (caseLineId: string) => {
    setSelectedCaseLineId(caseLineId);

    const selectedCaseLine = caseLines.find(
      (cl) => (cl.id || cl.caseLineId) === caseLineId
    );

    if (selectedCaseLine && selectedCaseLine.typeComponent) {
      const newItems: TransferItem[] = [
        {
          componentId: selectedCaseLine.typeComponentId || "",
          componentName: selectedCaseLine.typeComponent.name,
          requestedQuantity: selectedCaseLine.quantity || 1,
        },
      ];

      setItems(newItems);
      setComponentSearch([selectedCaseLine.typeComponent.name]);
      setShowDropdown([false]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedWarehouse) {
      setError("Please select a warehouse");
      return;
    }

    const invalidItems = items.filter(
      (item) =>
        !item.componentId || !item.componentName || item.requestedQuantity < 1
    );

    if (invalidItems.length > 0) {
      setError("Please fill in all item details with valid quantities");
      return;
    }

    if (!selectedCaseLineId) {
      setError("Case Line ID is required to create a stock transfer request");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestItems = items.map((item) => ({
        typeComponentId: item.componentId,
        quantityRequested: item.requestedQuantity,
        caselineId: selectedCaseLineId,
      }));

      // ⬇⬇⬇ UPDATE: USE selectedWarehouse
      const requestPayload = {
        requestingWarehouseId: selectedWarehouse,
        items: requestItems,
      };

      await stockTransferService.createRequest(requestPayload as any);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to create stock transfer request:", err);
      setError(
        err.response?.data?.message ||
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

              {/* ⬇⬇⬇ NEW: SELECT WAREHOUSE */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Warehouse *
                </label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg 
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Select warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* ⬆⬆⬆ END NEW */}

              {!caseLineId && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Case Line *
                  </label>
                  {loadingCaseLines ? (
                    <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                      Loading case lines...
                    </div>
                  ) : caseLines.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                      No pending case lines found that require components
                    </div>
                  ) : (
                    <select
                      value={selectedCaseLineId}
                      onChange={(e) => handleCaseLineSelect(e.target.value)}
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Select a case line --</option>
                      {caseLines.map((caseLine) => {
                        const caseLineId =
                          caseLine.id || caseLine.caseLineId || "";
                        const vehicleInfo =
                          caseLine.guaranteeCase?.vehicleProcessingRecord
                            ?.vin || "Unknown VIN";
                        const componentName =
                          caseLine.typeComponent?.name || "Unknown Component";
                        const quantity = caseLine.quantity || 0;

                        return (
                          <option key={caseLineId} value={caseLineId}>
                            {vehicleInfo} - {componentName} (Qty: {quantity}) -
                            Status: {caseLine.status}
                          </option>
                        );
                      })}
                    </select>
                  )}
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
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 rounded-lg"
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
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Minus className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>

                    {/* Component selection */}
                    <div className="relative component-dropdown">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Component *
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={componentSearch[index] || item.componentName}
                          onChange={(e) =>
                            handleSearchChange(index, e.target.value)
                          }
                          onFocus={() => {
                            const newDropdown = [...showDropdown];
                            newDropdown[index] = true;
                            setShowDropdown(newDropdown);
                          }}
                          placeholder="Search for component..."
                          className="w-full pl-9 pr-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {showDropdown[index] && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {getFilteredComponents(componentSearch[index])
                              .length > 0 ? (
                              getFilteredComponents(componentSearch[index]).map(
                                (component) => (
                                  <button
                                    key={component.typeComponentId}
                                    type="button"
                                    onClick={() =>
                                      handleComponentSelect(index, component)
                                    }
                                    className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b last:border-0"
                                  >
                                    <p className="text-sm font-medium text-gray-900">
                                      {component.name}
                                    </p>
                                  </button>
                                )
                              )
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No components found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
