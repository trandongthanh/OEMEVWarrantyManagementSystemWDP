"use client";

import { useState, useEffect } from "react";
import { warehouseService } from "@/services/warehouseService";
import { Button } from "@/components/ui/button";

interface AllocateComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Component {
  id: string;
  name: string;
  code: string;
}

export default function AllocateComponentModal({ isOpen, onClose }: AllocateComponentModalProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [quantity, setQuantity] = useState("");
  const [serviceCenterId, setServiceCenterId] = useState("");
  const [loading, setLoading] = useState(false);

  // Load components when modal opens
  useEffect(() => {
    if (isOpen) {
      warehouseService.getComponents()
        .then(setComponents)
        .catch(err => alert("Error loading components: " + err.message));
    } else {
      // Reset form when modal closes
      setSelectedComponent("");
      setQuantity("");
      setServiceCenterId("");
    }
  }, [isOpen]);

  const handleAllocate = async () => {
    if (!selectedComponent || !quantity || !serviceCenterId) {
      return alert("Please fill all fields!");
    }

    setLoading(true);
    try {
      await warehouseService.allocateComponent({
        stockId: selectedComponent,
        quantity: Number(quantity),
        allocatedTo: serviceCenterId,
      });
      alert("✅ Allocation successful!");
      onClose();
    } catch (err: any) {
      alert("❌ Error allocating component: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[480px]">
        <h2 className="text-lg font-semibold mb-4">Allocate Component</h2>

        <label className="block text-sm text-gray-600 mb-1">Select Component</label>
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
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border w-full p-2 rounded mb-3"
        />

        <label className="block text-sm text-gray-600 mb-1">Target Service Center ID</label>
        <input
          type="text"
          value={serviceCenterId}
          onChange={(e) => setServiceCenterId(e.target.value)}
          className="border w-full p-2 rounded mb-4"
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAllocate} disabled={loading}>
            {loading ? "Allocating..." : "Allocate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
