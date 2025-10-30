"use client";

import { useState, useEffect } from "react";
import { warehouseService, WarehouseQueryParams } from "@/services/warehouseService";
import { Button } from "@/components/ui/button";

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

export default function TransferComponentModal({ isOpen, onClose }: TransferComponentModalProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [targetWarehouseId, setTargetWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);

  // Load components & warehouses when modal opens
  useEffect(() => {
    if (isOpen) {
      warehouseService.getComponents()
        .then(setComponents)
        .catch(err => alert("Error loading components: " + err.message));

      warehouseService.getWarehouseInfo()
        .then(data => setWarehouses(data.warehouses))
        .catch(err => alert("Error loading warehouses: " + err.message));
    } else {
      // Reset form when modal closes
      setSelectedComponent("");
      setQuantity("");
      setSourceWarehouseId("");
      setTargetWarehouseId("");
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    if (!selectedComponent || !quantity || !sourceWarehouseId || !targetWarehouseId)
      return alert("Please fill all fields!");

    if (sourceWarehouseId === targetWarehouseId)
      return alert("Source and target warehouse cannot be the same!");

    setLoading(true);
    try {
      await warehouseService.transferComponent({
        fromWarehouseId: sourceWarehouseId,
        toWarehouseId: targetWarehouseId,
        stockId: selectedComponent,
        quantity: Number(quantity),
      });
      alert("✅ Transfer request created successfully!");
      onClose();
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[480px]">
        <h2 className="text-lg font-semibold mb-4">Transfer Component</h2>

        <label className="block text-sm text-gray-600 mb-1">Component</label>
        <select
          className="border w-full p-2 rounded mb-3"
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
        >
          <option value="">-- Choose Component --</option>
          {components.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>

        <label className="block text-sm text-gray-600 mb-1">Quantity</label>
        <input
          type="number"
          className="border w-full p-2 rounded mb-3"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <label className="block text-sm text-gray-600 mb-1">Source Warehouse</label>
        <select
          className="border w-full p-2 rounded mb-3"
          value={sourceWarehouseId}
          onChange={(e) => setSourceWarehouseId(e.target.value)}
        >
          <option value="">-- Choose Source Warehouse --</option>
          {warehouses.map((w) => (
            <option key={w.warehouseId} value={w.warehouseId}>
              {w.name}
            </option>
          ))}
        </select>

        <label className="block text-sm text-gray-600 mb-1">Target Warehouse</label>
        <select
          className="border w-full p-2 rounded mb-4"
          value={targetWarehouseId}
          onChange={(e) => setTargetWarehouseId(e.target.value)}
        >
          <option value="">-- Choose Target Warehouse --</option>
          {warehouses.map((w) => (
            <option key={w.warehouseId} value={w.warehouseId}>
              {w.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
