"use client";

import { useState, useEffect } from "react";
import inventoryService, {
  CreateAdjustmentRequest,
  StockItemFromAPI,
} from "@/services/inventoryService";

export default function CreateAdjustmentModal({
  isOpen,
  onClose,
  warehouseId,
}: {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: string;
}) {
  const [tab, setTab] = useState<"IN" | "OUT">("IN");
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
    if (error) return alert(error);

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

      await inventoryService.createAdjustment(body);

      alert("Adjustment created successfully!");
      onClose();
    } catch (err) {
      console.error("Create adjustment failed:", err);
      alert("Failed to create adjustment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
              <label className="text-sm font-medium text-black">
                Serial Numbers *
              </label>

              {serials.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 border border-black rounded-lg px-3 py-2 bg-white text-black placeholder-black"
                    value={s}
                    placeholder="Serial Number"
                    onChange={(e) => updateSerial(i, e.target.value)}
                  />

                  {serials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSerial(i)}
                      className="px-3 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setSerials([...serials, ""])}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                + Add Serial
              </button>
            </div>
          )}

          {/* OUT MODE */}
          {tab === "OUT" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Serial Numbers * (Components to Remove)
              </label>

              {serials.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 border border-black rounded-lg px-3 py-2 bg-white text-black placeholder-black"
                    value={s}
                    placeholder="Serial Number"
                    onChange={(e) => updateSerial(i, e.target.value)}
                  />

                  {serials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSerial(i)}
                      className="px-3 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => setSerials([...serials, ""])}
                className="text-sm text-red-600 font-medium hover:underline"
              >
                + Add Serial
              </button>
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
