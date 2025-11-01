"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  AlertCircle,
  ArrowUpDown,
  Send,
  Layers,
  Loader,
} from "lucide-react";
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
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [isAllocModalOpen, setAllocModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // Fetch components
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

  // Filter and search
  useEffect(() => {
    let filtered = [...components];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter((c) => c.quantity > 0 && c.quantity < 10);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((c) => c.quantity === 0);
    }

    // Sort
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Service Center Inventory
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Component-level stock management
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAllocModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <Send className="w-4 h-4" />
            Allocate
          </button>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium text-sm"
          >
            <Layers className="w-4 h-4" />
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
              Total Components
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalComponents}</p>
          <p className="text-sm text-gray-500 mt-1">In inventory</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Low Stock</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{lowStockCount}</p>
          <p className="text-sm text-gray-500 mt-1">Needs restock</p>
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
          <p className="text-sm text-gray-500 mt-1">Unavailable</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by component name or code..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Stock Filter */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setStockFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              stockFilter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStockFilter("low")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              stockFilter === "low"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setStockFilter("out")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              stockFilter === "out"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Out
          </button>
        </div>
      </div>

      {/* Components Table */}
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
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Component Name
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Quantity
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Loading inventory...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">No components found</p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-sm text-gray-900 hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
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
                      className="hover:bg-gray-50 transition-colors"
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

      {/* Modals */}
      <AllocateComponentModal
        isOpen={isAllocModalOpen}
        onClose={() => {
          setAllocModalOpen(false);
          fetchComponents();
        }}
      />
      <TransferComponentModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setTransferModalOpen(false);
          fetchComponents();
        }}
      />
    </div>
  );
}
