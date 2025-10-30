"use client";

import React, { useEffect, useState } from "react";
import inventoryService, { InventorySummary } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";

interface Props {
  onOpenAllocate: () => void;
  onOpenTransfer: () => void;
}

export default function InventoryDashboard({ onOpenAllocate, onOpenTransfer }: Props) {
  const [data, setData] = useState<InventorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await inventoryService.getInventorySummary();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading inventory summary...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Warehouse Inventory Summary</h3>
        <div className="flex gap-2">
          <Button onClick={onOpenAllocate}>Allocate</Button>
          <Button onClick={onOpenTransfer}>Transfer</Button>
        </div>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Warehouse</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Reserved</th>
            <th className="p-2 border">Available</th>
          </tr>
        </thead>
        <tbody>
          {data.map((w) => (
            <tr key={w.warehouseId} className="text-center">
              <td className="border p-2">{w.warehouseName}</td>
              <td className="border p-2">{w.totalStock}</td>
              <td className="border p-2">{w.reservedStock}</td>
              <td className="border p-2">{w.availableStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
