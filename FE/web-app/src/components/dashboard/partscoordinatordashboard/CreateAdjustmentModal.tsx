"use client";

import { useState, useEffect } from "react";
import inventoryService, {
  CreateAdjustmentRequest,
  StockItemFromAPI,
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
  // Always use IN adjustment type - OUT is removed
  const tab = "IN";
  const [loading, setLoading] = useState(false);

  const [stockList, setStockList] = useState<StockItemFromAPI[]>([]);
  const [stockId, setStockId] = useState("");

  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const [serials, setSerials] = useState<string[]>([""]);

  useEffect(() => {
    if (!isOpen) return;

    setReason("");
    setNote("");
    setSerials([""]);

    loadStockList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const updateSerial = (i: number, val: string) => {
    const updated = [...serials];
    updated[i] = val;
    setSerials(updated);
  };

  const removeSerial = (index: number) => {
    const updated = serials.filter((_, i) => i !== index);
    setSerials(updated.length > 0 ? updated : [""]);
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

      const body: CreateAdjustmentRequest = {
        stockId,
        adjustmentType: "IN",
        reason,
        note,
        components: serials
          .filter((s) => s.trim() !== "")
          .map((s) => ({ serialNumber: s })),
      };

      const response = await inventoryService.createAdjustment(body);

      console.log("📦 Adjustment created successfully:", response);

      // Show success toast with more details
      const componentCount = serials.filter((s) => s.trim() !== "").length;
      const stockInfo = stockList.find((s) => s.stockId === stockId);

      toast.success(
        `Added ${componentCount} component(s) successfully!${
          stockInfo ? ` (${stockInfo.typeComponent.name})` : ""
        }`,
        {
          duration: 4000,
          description: `Stock has been increased by ${componentCount} unit(s)`,
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
              <span className="text-lg text-blue-600">➜</span>

              <h2 className="text-lg font-semibold text-blue-700">
                Adjustment IN
              </h2>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Add new components into warehouse inventory
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
