"use client";

import { useState, useEffect } from "react";
import { Package, PlusCircle } from "lucide-react";
import RestockRequestModal from "./RestockRequestModal";
import { warehouseService } from "@/services/warehouseService";

interface ComponentItem {
  id: string;
  name: string;
  code: string; // SKU
  quantity: number;
}

interface RestockPageProps {
  warehouseId: string;
  warehouseName: string;
}

interface RawComponent {
  id: string;
  name: string;
  code: string;
  quantity: number;
}

export default function RestockPage({
  warehouseId,
  warehouseName,
}: RestockPageProps) {
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComponents = async () => {
    try {
      setLoading(true);

      const data = await warehouseService.getComponents();

      const mapped: ComponentItem[] = data.map((c: RawComponent) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        quantity: c.quantity,
      }));

      setComponents(mapped);
    } catch (err) {
      console.error("❌ Failed to load components:", err);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, []);

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Restock Requests
              </h2>

              <button
                onClick={() => setIsRestockModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                Create Restock Request
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Submit requests to replenish low or out-of-stock components.
            </p>

            <div className="h-40 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Package className="w-10 h-10 mb-1" />
              <p>No restock data yet</p>
            </div>
          </div>
        </div>
      </div>

      <RestockRequestModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        warehouseId={warehouseId}
        warehouseName={warehouseName}
        components={components}
      />
    </>
  );
}
