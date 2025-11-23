"use client";

import { useState, useEffect } from "react";
import inventoryService, {
  CreateAdjustmentRequest,
  StockItemFromAPI,
  ComponentDetail,
} from "@/services/inventoryService";
import { toast } from "sonner";

export default function CreateAdjustmentModal({
  isOpen,
  onClose,
  onSuccess,
  warehouseId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  warehouseId: string;
}) {
  const [tab, setTab] = useState<"IN" | "OUT">("IN");
  const [loading, setLoading] = useState(false);

  const [stockList, setStockList] = useState<StockItemFromAPI[]>([]);
  const [stockId, setStockId] = useState("");

  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const [serials, setSerials] = useState<string[]>([""]);

  // For OUT mode - available components to select from
  const [availableComponents, setAvailableComponents] = useState<
    ComponentDetail[]
  >([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [showComponentPicker, setShowComponentPicker] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setReason("");
    setNote("");
    setSerials([""]);
    setAvailableComponents([]);
    setShowComponentPicker(false);

    loadStockList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    // Load available components when stock changes and in OUT mode
    if (stockId && tab === "OUT") {
      loadAvailableComponents();
    } else {
      setAvailableComponents([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockId, tab]);

  const loadStockList = async () => {
    try {
      const res = await inventoryService.getTypeComponents(warehouseId);
      const list = Array.isArray(res) ? res : [];
      setStockList(list);
      setStockId(list.length > 0 ? list[0].stockId : "");
    } catch (err) {
      console.error("Failed to load stock list:", err);
      setStockList([]);
      setStockId("");
    }
  };

  const loadAvailableComponents = async () => {
    if (!stockId) return;

    try {
      setLoadingComponents(true);
      const selectedStock = stockList.find((s) => s.stockId === stockId);
      if (!selectedStock) return;

      const components = await inventoryService.getComponentsByType(
        selectedStock.typeComponent.typeComponentId,
        warehouseId
      );

      // Filter only AVAILABLE components for removal
      const availableOnes = components.filter((c) => c.status === "AVAILABLE");
      setAvailableComponents(availableOnes);
    } catch (err) {
      console.error("Failed to load available components:", err);
      setAvailableComponents([]);
    } finally {
      setLoadingComponents(false);
    }
  };

  const updateSerial = (i: number, val: string) => {
    const updated = [...serials];
    updated[i] = val;
    setSerials(updated);
  };

  const removeSerial = (index: number) => {
    const updated = serials.filter((_, i) => i !== index);
    setSerials(updated.length > 0 ? updated : [""]);
  };

  const addSelectedSerial = (serial: string) => {
    // Check if already added
    if (serials.some((s) => s.trim() === serial)) {
      toast.info("Serial number already added");
      return;
    }

    // Replace first empty slot or add new
    const emptyIndex = serials.findIndex((s) => s.trim() === "");
    if (emptyIndex !== -1) {
      updateSerial(emptyIndex, serial);
    } else {
      setSerials([...serials, serial]);
    }
    toast.success(`Added ${serial}`);
  };

  const quickAddAllAvailable = () => {
    if (availableComponents.length === 0) {
      toast.error("No available components to add");
      return;
    }

    const newSerials = availableComponents
      .map((c) => c.serialNumber)
      .filter((s) => !serials.includes(s));

    if (newSerials.length === 0) {
      toast.info("All available components already added");
      return;
    }

    setSerials(newSerials);
    toast.success(`Added ${newSerials.length} serial numbers`);
  };

  const validate = () => {
    if (!stockId) return "Please select a stock item.";
    if (!reason.trim()) return "Reason is required.";

    const cleaned = serials.filter((s) => s.trim() !== "");
    if (cleaned.length === 0) return "At least one serial number is required.";
    if (new Set(cleaned).size !== cleaned.length)
      return "Serial numbers must be unique.";

    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      let body: CreateAdjustmentRequest;

      if (tab === "IN") {
        body = {
          stockId,
          adjustmentType: "IN",
          reason,
          note,
          components: serials
            .filter((s) => s.trim() !== "")
            .map((s) => ({ serialNumber: s })),
        };
      } else {
        body = {
          stockId,
          adjustmentType: "OUT",
          reason,
          note,
          components: serials
            .filter((s) => s.trim() !== "")
            .map((s) => ({ serialNumber: s })),
        };
      }

      const response = await inventoryService.createAdjustment(body);

      console.log("📦 Adjustment created successfully:", response);

      // Show success toast with more details
      const componentCount = serials.filter((s) => s.trim() !== "").length;
      const actionText = tab === "IN" ? "Added" : "Removed";
      const stockInfo = stockList.find((s) => s.stockId === stockId);

      toast.success(
        `${actionText} ${componentCount} component(s) successfully!${
          stockInfo ? ` (${stockInfo.typeComponent.name})` : ""
        }`,
        {
          duration: 4000,
          description: `Stock has been ${
            tab === "IN" ? "increased" : "decreased"
          } by ${componentCount} unit(s)`,
        }
      );

      // Refresh the parent list immediately
      onSuccess?.();

      // Close modal after a reasonable delay to let user see the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Create adjustment failed:", err);
      toast.error("Failed to create adjustment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg ${
                  tab === "IN" ? "text-blue-600" : "text-red-600"
                }`}
              >
                ➜
              </span>

              <h2
                className={`text-lg font-semibold ${
                  tab === "IN" ? "text-blue-700" : "text-red-700"
                }`}
              >
                {tab === "IN" ? "Adjustment IN" : "Adjustment OUT"}
              </h2>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {tab === "IN"
                ? "Add new components into warehouse inventory"
                : "Remove components from warehouse inventory by serial numbers"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-5">
          {/* TAB SWITCH */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {["IN", "OUT"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as "IN" | "OUT")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition
                  ${
                    tab === t
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600"
                  }`}
              >
                {t === "IN" ? "Adjustment IN" : "Adjustment OUT"}
              </button>
            ))}
          </div>

          {/* SELECT STOCK */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">
              Component *
            </label>
            <select
              className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black placeholder-black"
              value={stockId}
              onChange={(e) => setStockId(e.target.value)}
            >
              {stockList.length === 0 ? (
                <option value="">No stock available</option>
              ) : (
                stockList.map((s) => (
                  <option key={s.stockId} value={s.stockId}>
                    {s.typeComponent.name} — Available: {s.quantityAvailable}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* REASON */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Reason *</label>
            <input
              className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black placeholder-black"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason"
            />
          </div>

          {/* NOTE */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Note</label>
            <textarea
              className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black placeholder-black"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
            />
          </div>

          {/* IN MODE */}
          {tab === "IN" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">
                  Serial Numbers *
                </label>
                <div className="text-xs text-gray-600">
                  {serials.filter((s) => s.trim()).length} serial(s) added
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {serials.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                        value={s}
                        placeholder={`Serial #${i + 1}`}
                        onChange={(e) => updateSerial(i, e.target.value)}
                      />
                      {s.trim() && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-sm">
                          ✓
                        </span>
                      )}
                    </div>

                    {serials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSerial(i)}
                        className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove serial"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSerials([...serials, ""])}
                  className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  <span className="text-lg">+</span> Add Serial
                </button>
                {serials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSerials([""])}
                    className="text-sm text-gray-600 font-medium hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>💡 Tip: Enter unique serial numbers for each component</p>
                <p>• Press Tab to quickly move to next field</p>
              </div>
            </div>
          )}

          {/* OUT MODE */}
          {tab === "OUT" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">
                  Serial Numbers * (Components to Remove)
                </label>
                <div className="text-xs text-gray-600">
                  {serials.filter((s) => s.trim()).length} serial(s) to remove
                </div>
              </div>

              {/* Available Components Section */}
              {availableComponents.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-900">
                      📦 Available Components ({availableComponents.length})
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setShowComponentPicker(!showComponentPicker)
                      }
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showComponentPicker ? "Hide" : "Show"} List
                    </button>
                  </div>

                  {showComponentPicker && (
                    <>
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-white rounded border border-blue-200 p-2">
                        {availableComponents.map((comp) => (
                          <div
                            key={comp.componentId}
                            className="flex items-center justify-between p-2 hover:bg-blue-50 rounded text-sm"
                          >
                            <span className="font-mono text-xs text-gray-700">
                              {comp.serialNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                addSelectedSerial(comp.serialNumber)
                              }
                              disabled={serials.includes(comp.serialNumber)}
                              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {serials.includes(comp.serialNumber)
                                ? "Added"
                                : "+ Add"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={quickAddAllAvailable}
                        className="w-full text-sm py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Add All Available ({availableComponents.length})
                      </button>
                    </>
                  )}
                </div>
              )}

              {loadingComponents && (
                <div className="text-sm text-gray-600 text-center py-2">
                  Loading available components...
                </div>
              )}

              {!loadingComponents &&
                availableComponents.length === 0 &&
                stockId && (
                  <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    ⚠️ No available components found for this stock item
                  </div>
                )}

              {/* Manual Serial Entry */}
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-red-50">
                {serials.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input
                        className="w-full border border-red-300 rounded-lg px-3 py-2 pr-8 bg-white text-black placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono text-sm"
                        value={s}
                        placeholder={`Serial #${i + 1} to remove`}
                        onChange={(e) => updateSerial(i, e.target.value)}
                      />
                      {s.trim() && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-sm">
                          ✓
                        </span>
                      )}
                    </div>

                    {serials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSerial(i)}
                        className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove serial"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSerials([...serials, ""])}
                  className="text-sm text-red-600 font-medium hover:underline flex items-center gap-1"
                >
                  <span className="text-lg">+</span> Add Serial
                </button>
                {serials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSerials([""])}
                    className="text-sm text-gray-600 font-medium hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>
                  ⚠️ Warning: These components will be removed from inventory
                </p>
                <p>• Ensure serial numbers match existing components</p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 bg-white border hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Processing..." : "Create Adjustment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { CreateAdjustmentModal };
