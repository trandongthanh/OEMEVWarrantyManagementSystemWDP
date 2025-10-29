"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Warehouse as WarehouseIcon,
  Package,
  TrendingDown,
  AlertTriangle,
  Loader2,
  MapPin,
} from "lucide-react";
import warehouseService, { Warehouse } from "@/services/warehouseService";

export function WarehouseOverview() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [minStockFilter, setMinStockFilter] = useState<number | undefined>(
    undefined
  );

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getWarehouseInfo({
        minStock: minStockFilter,
      });
      setWarehouses(response.warehouses);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minStockFilter]);

  const getTotalStockAcrossWarehouses = () => {
    let total = 0;
    warehouses.forEach((warehouse) => {
      warehouse.stock.forEach((stock) => {
        total += stock.quantityInStock;
      });
    });
    return total;
  };

  const getLowStockItems = () => {
    const lowStockItems: {
      warehouse: string;
      component: string;
      quantity: number;
    }[] = [];
    warehouses.forEach((warehouse) => {
      warehouse.stock.forEach((stock) => {
        if (stock.quantityInStock < 10) {
          lowStockItems.push({
            warehouse: warehouse.name,
            component: stock.typeComponent?.name || "Unknown",
            quantity: stock.quantityInStock,
          });
        }
      });
    });
    return lowStockItems;
  };

  const totalStock = getTotalStockAcrossWarehouses();
  const lowStockItems = getLowStockItems();

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Warehouse Stock Overview
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor inventory levels across all warehouses
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <WarehouseIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Warehouses</p>
            <p className="text-3xl font-bold text-gray-900">
              {warehouses.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Stock Items</p>
            <p className="text-3xl font-bold text-gray-900">{totalStock}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-gray-900">
              {lowStockItems.length}
            </p>
          </motion.div>
        </div>

        {/* Warehouses List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-gray-600" />
                Warehouses & Stock
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">
                  Min Stock Filter:
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minStockFilter || ""}
                  onChange={(e) =>
                    setMinStockFilter(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-20 px-2 py-1 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : warehouses.length === 0 ? (
              <div className="text-center py-12">
                <WarehouseIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No warehouses found</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {warehouses.map((warehouse) => (
                  <motion.div
                    key={warehouse.warehouseId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    {/* Warehouse Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <WarehouseIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {warehouse.name}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {warehouse.address}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {warehouse.stock.reduce(
                            (sum, stock) => sum + stock.quantityInStock,
                            0
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Stock Items */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Stock Items ({warehouse.stock.length})
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {warehouse.stock.map((stock) => (
                          <div
                            key={stock.typeComponentId}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              stock.quantityInStock < 10
                                ? "bg-red-50 border border-red-200"
                                : stock.quantityInStock < 20
                                ? "bg-yellow-50 border border-yellow-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Package
                                className={`w-4 h-4 ${
                                  stock.quantityInStock < 10
                                    ? "text-red-600"
                                    : stock.quantityInStock < 20
                                    ? "text-yellow-600"
                                    : "text-gray-600"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {stock.typeComponent?.name ||
                                    "Unknown Component"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  $
                                  {stock.typeComponent?.price.toLocaleString() ||
                                    "0"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {stock.quantityInStock < 10 && (
                                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                  <TrendingDown className="w-3.5 h-3.5" />
                                  Low Stock
                                </span>
                              )}
                              <span
                                className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                  stock.quantityInStock < 10
                                    ? "bg-red-100 text-red-700"
                                    : stock.quantityInStock < 20
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {stock.quantityInStock}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-red-900">Low Stock Alerts</h3>
            </div>
            <div className="space-y-2">
              {lowStockItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-red-200 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      {item.component}
                    </p>
                    <p className="text-xs text-red-600">{item.warehouse}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                    {item.quantity} left
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
