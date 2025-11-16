"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  AlertCircle,
  ArrowUpDown,
  Boxes,
  Loader,
} from "lucide-react";

import { warehouseService } from "@/services/warehouseService";
import { usePolling } from "@/hooks/usePolling";

interface Component {
  id: string;
  name: string;
  code: string;
  quantity: number;
}

export default function Inventory() {
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  const { isPolling } = usePolling(
    async () => {
      const data = await warehouseService.getComponents();
      setComponents(data);
      setFilteredComponents(data);
      return data;
    },
    {
      interval: 120000, // Poll every 2 minutes
      enabled: !loading,
      onError: (err) => {
        console.error("❌ Inventory polling error:", err);
      },
    }
  );

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getComponents();
      setComponents(data);
      setFilteredComponents(data);
    } catch (err) {
      console.error("Error fetching components:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    let filtered = [...components];

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (stockFilter === "low") {
      filtered = filtered.filter((c) => c.quantity > 0 && c.quantity < 10);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((c) => c.quantity === 0);
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc"
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      }
    });

    setFilteredComponents(filtered);
  }, [components, searchQuery, sortBy, sortOrder, stockFilter]);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-700" };
    if (quantity < 10)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700" };
    return { label: "In Stock", color: "bg-green-100 text-green-700" };
  };

  const totalComponents = components.length;
  const lowStockCount = components.filter(
    (c) => c.quantity > 0 && c.quantity < 10
  ).length;
  const outOfStockCount = components.filter((c) => c.quantity === 0).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2 pt-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            Service Center Inventory
          </h2>

          <p className="text-gray-600 text-sm mt-2">
            Manage components for your service center
          </p>
        </div>

        <div className="flex gap-3">
          {isPolling && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">
                Live Updates
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Total Components
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalComponents}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Low Stock</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{lowStockCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Package className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Out of Stock
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{outOfStockCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by component name or code..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setStockFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              stockFilter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setStockFilter("low")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              stockFilter === "low"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Low Stock
          </button>

          <button
            onClick={() => setStockFilter("out")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              stockFilter === "out"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Out
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => {
                    if (sortBy === "name") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("name");
                      setSortOrder("asc");
                    }
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase"
                >
                  Component Name
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Code
              </th>

              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => {
                    if (sortBy === "quantity") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("quantity");
                      setSortOrder("asc");
                    }
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase"
                >
                  Quantity
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading inventory...
                    </p>
                  </td>
                </tr>
              ) : filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-2">No components found</p>
                  </td>
                </tr>
              ) : (
                filteredComponents.map((component, index) => {
                  const status = getStockStatus(component.quantity);
                  return (
                    <motion.tr
                      key={component.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <p className="font-medium text-gray-900">
                            {component.name}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">
                          {component.code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {component.quantity}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
