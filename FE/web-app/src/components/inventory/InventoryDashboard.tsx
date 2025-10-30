"use client";

import React, { useEffect, useState } from "react";
import inventoryService, {
  InventorySummary,
} from "@/services/inventoryService";

import {
  Package,
  Building2,
  Lock,
  CheckCircle,
  ArrowRight,
  Send,
  Loader,
} from "lucide-react";

interface Props {
  onOpenAllocate: () => void;
  onOpenTransfer: () => void;
}

export default function InventoryDashboard({
  onOpenAllocate,
  onOpenTransfer,
}: Props) {
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

  // Calculate totals across all warehouses
  const totals = data.reduce(
    (acc, w) => ({
      total: acc.total + w.totalStock,
      reserved: acc.reserved + w.reservedStock,
      available: acc.available + w.availableStock,
    }),
    { total: 0, reserved: 0, available: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading inventory summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Company Inventory Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All warehouses across the company
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onOpenAllocate}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <Send className="w-4 h-4" />
            Allocate
          </button>
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            Transfer
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Total Stock
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {totals.total.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">All warehouses</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Lock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Reserved</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {totals.reserved.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Allocated</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Available</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {totals.available.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ready to allocate</p>
        </div>
      </div>

      {/* Warehouses List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouses</h3>
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No warehouses found</p>
            </div>
          ) : (
            data.map((warehouse) => {
              const utilizationPercent =
                warehouse.totalStock > 0
                  ? Math.round(
                      (warehouse.reservedStock / warehouse.totalStock) * 100
                    )
                  : 0;

              return (
                <div
                  key={warehouse.warehouseId}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {warehouse.warehouseName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID: {warehouse.warehouseId}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                      {utilizationPercent}% Used
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Total</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {(warehouse.totalStock || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Reserved</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {(warehouse.reservedStock || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Available</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {(warehouse.availableStock || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
                      style={{ width: `${utilizationPercent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
