"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AllocateComponentModal from "./AllocationModal";
import TransferComponentModal from "./TransferModal";
import { warehouseService } from "@/services/warehouseService";

interface Component {
  id: string;
  name: string;
  code: string;
  quantity: number;
}

export default function Inventory() {
  const [components, setComponents] = useState<Component[]>([]);
  const [isAllocModalOpen, setAllocModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);

  // Fetch components
  const fetchComponents = async () => {
    try {
      const data = await warehouseService.getComponents();
      setComponents(data);
    } catch (err) {
      console.error("Error fetching components:", err);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Inventory Management</h2>

      <div className="flex gap-3 mb-4">
        <Button onClick={() => setAllocModalOpen(true)}>Allocate</Button>
        <Button onClick={() => setTransferModalOpen(true)}>Transfer</Button>
      </div>

      {/* Inventory table */}
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Component Name</th>
            <th className="border px-4 py-2">Code</th>
            <th className="border px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr key={c.id}>
              <td className="border px-4 py-2">{c.name}</td>
              <td className="border px-4 py-2">{c.code}</td>
              <td className="border px-4 py-2">{c.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Allocate Modal */}
      <AllocateComponentModal
        isOpen={isAllocModalOpen}
        onClose={() => {
          setAllocModalOpen(false);
          fetchComponents(); // refresh after allocation
        }}
      />

      {/* Transfer Modal */}
      <TransferComponentModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setTransferModalOpen(false);
          fetchComponents(); // refresh after transfer
        }}
      />
    </div>
  );
}
