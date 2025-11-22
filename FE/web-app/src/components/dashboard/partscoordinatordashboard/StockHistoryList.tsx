"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import inventoryService, {
  StockHistoryItem,
  StockHistoryResponse,
} from "@/services/inventoryService";
import {
  Loader2,
  Package,
  History as HistoryIcon,
  Eye,
  X,
  Building,
  User,
  ClipboardList,
} from "lucide-react";
import { Pagination } from "@/components/ui";
import apiClient from "@/lib/apiClient";

interface StockItem {
  stockId: string;
  typeComponentId: string;
  quantityInStock: number;
  quantityReserved: number;
  quantityAvailable: number;
  typeComponent: {
    name: string;
    sku: string;
  };
  warehouse: {
    name: string;
  };
}

export default function StockHistoryList({
  warehouseId,
}: {
  warehouseId: string | null;
}) {
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<StockHistoryItem[]>([]);

  // Detail modal state
  const [selectedItem, setSelectedItem] = useState<StockHistoryItem | null>(
    null
  );
  const [showDetail, setShowDetail] = useState(false);

  // ✅ Pagination đúng chuẩn backend (có itemsPerPage)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 20, // ✅ cần có theo backend
  });

  // ======================================================
  // ✅ Load stocks list when component mounts
  // ======================================================
  useEffect(() => {
    if (!warehouseId) return;
    loadStocks();
  }, [warehouseId]);

  // ======================================================
  // ✅ Load stock history when stockId changes
  // ======================================================
  useEffect(() => {
    if (!selectedStockId) return;
    loadHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStockId]);

  const loadStocks = async () => {
    try {
      setLoadingStocks(true);
      const response = await apiClient.get("/inventory/type-components", {
        params: { limit: 100 },
      });

      const typeComponents =
        response.data.data.components?.typeComponents ?? [];
      setStocks(typeComponents);
    } catch (err) {
      console.error("Error loading stocks:", err);
      setStocks([]);
    } finally {
      setLoadingStocks(false);
    }
  };

  const loadHistory = async (page: number) => {
    if (!selectedStockId) return;

    try {
      setLoading(true);

      const data: StockHistoryResponse = await inventoryService.getStockHistory(
        selectedStockId,
        page,
        20
      );

      setHistory(data.history ?? []);

      // ✅ backend trả pagination đầy đủ gồm itemsPerPage
      setPagination(
        data.pagination ?? {
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: 20,
        }
      );
    } catch (err) {
      console.error("Error loading stock history:", err);

      // fallback pagination
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 20,
      });
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (item: StockHistoryItem) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedItem(null);
  };

  // ======================================================
  // ✅ Safe UI if no warehouse
  // ======================================================
  if (!warehouseId) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-20 text-center"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No warehouse selected</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ======================================================
  // ✅ STOCK SELECTION VIEW
  // ======================================================
  if (!selectedStockId) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Stock History
                </h1>
              </div>
              <p className="text-gray-600">
                Select a stock item to view its adjustment history
              </p>
            </div>

            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Stock Item
              </h2>
            </div>

            <div className="p-6">
              {loadingStocks ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : stocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Package className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg">No stock items found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stocks.map((stock) => (
                    <button
                      key={stock.stockId}
                      onClick={() => setSelectedStockId(stock.stockId)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {stock.typeComponent.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {stock.typeComponent.sku} •{" "}
                            {stock.warehouse.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Available:{" "}
                            <span className="font-semibold text-green-600">
                              {stock.quantityAvailable}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            In Stock: {stock.quantityInStock} • Reserved:{" "}
                            {stock.quantityReserved}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ======================================================
  // ✅ HISTORY VIEW
  // ======================================================
  const selectedStock = stocks.find((s) => s.stockId === selectedStockId);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <HistoryIcon className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Stock History
                  </h1>
                </div>
                <p className="text-gray-600">
                  {selectedStock
                    ? `${selectedStock.typeComponent.name} (${selectedStock.typeComponent.sku})`
                    : "View stock adjustment history by item"}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedStockId(null);
                  setHistory([]);
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ← Back to Stock List
              </button>
            </div>
          </div>

          {/* ================= LOADING ================= */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <HistoryIcon className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">No history found</p>
            </div>
          ) : (
            <>
              {/* ================= TABLE ================= */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-6 font-semibold">Type</th>
                      <th className="py-3 px-6 font-semibold">
                        Quantity Change
                      </th>
                      <th className="py-3 px-6 font-semibold">Reason</th>
                      <th className="py-3 px-6 font-semibold">Adjusted By</th>
                      <th className="py-3 px-6 font-semibold">Date</th>
                      <th className="py-3 px-6 font-semibold text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((item) => (
                      <tr
                        key={item.adjustmentId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.adjustmentType === "IN"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.adjustmentType}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span
                            className={`font-semibold ${
                              item.adjustmentType === "IN"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.adjustmentType === "IN" ? "+" : "-"}
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          <div>
                            <p className="font-medium">{item.reason}</p>
                            {item.note && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {item.adjustedByUser?.name ||
                            (typeof item.adjustedBy === "string"
                              ? item.adjustedBy
                              : item.adjustedBy?.name) ||
                            "System"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          <div>
                            {new Date(
                              item.adjustedAt || item.created_at || Date.now()
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              item.adjustedAt || item.created_at || Date.now()
                            ).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => openDetail(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium shadow-sm"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= PAGINATION ================= */}
          {!loading && history.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={loadHistory}
            />
          )}
        </motion.div>
      </div>

      {/* =================== DETAIL MODAL =================== */}
      {showDetail && selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
          onClick={closeDetail}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header with color-coded background */}
            <div
              className={`p-6 border-b ${
                selectedItem.adjustmentType === "IN"
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Stock History Details
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedItem.adjustmentType === "IN"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedItem.adjustmentType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">
                    ID: {selectedItem.adjustmentId}
                  </p>
                </div>
                <button
                  onClick={closeDetail}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Adjustment Info */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Adjustment Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Quantity Change
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        selectedItem.adjustmentType === "IN"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedItem.adjustmentType === "IN" ? "+" : "-"}
                      {selectedItem.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Adjusted At
                    </span>
                    <span className="text-base font-medium text-gray-900 block">
                      {new Date(
                        selectedItem.adjustedAt ||
                          selectedItem.created_at ||
                          Date.now()
                      ).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(
                        selectedItem.adjustedAt ||
                          selectedItem.created_at ||
                          Date.now()
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 block mb-1">
                      Reason
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {selectedItem.reason}
                    </span>
                  </div>
                  {selectedItem.note && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600 block mb-1">
                        Additional Note
                      </span>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                        {selectedItem.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Component Info */}
              {selectedItem.stock?.typeComponent && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Component Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600 block mb-1">
                        Component Name
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedItem.stock.typeComponent.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        SKU
                      </span>
                      <span className="text-base font-mono font-medium text-gray-900">
                        {selectedItem.stock.typeComponent.sku}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Category
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                        {selectedItem.stock.typeComponent.category}
                      </span>
                    </div>
                    {selectedItem.stock.typeComponent.price && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Unit Price
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          $
                          {selectedItem.stock.typeComponent.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedItem.stock.typeComponent.makeBrand && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Brand
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {selectedItem.stock.typeComponent.makeBrand}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Stock Levels */}
              {selectedItem.stock && (
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Stock Levels
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block mb-1">
                        In Stock
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {selectedItem.stock.quantityInStock}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block mb-1">
                        Reserved
                      </span>
                      <span className="text-2xl font-bold text-amber-600">
                        {selectedItem.stock.quantityReserved}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block mb-1">
                        Available
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {selectedItem.stock.quantityAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warehouse & User Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedItem.stock?.warehouse && (
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-amber-600" />
                      Warehouse
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Name
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {selectedItem.stock.warehouse.name}
                        </span>
                      </div>
                      {selectedItem.stock.warehouse.address && (
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">
                            Address
                          </span>
                          <span className="text-sm text-gray-700">
                            {selectedItem.stock.warehouse.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Adjusted By
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Name
                      </span>
                      <span className="text-base font-medium text-gray-900">
                        {selectedItem.adjustedByUser?.name ||
                          (typeof selectedItem.adjustedBy === "string"
                            ? selectedItem.adjustedBy
                            : selectedItem.adjustedBy?.name) ||
                          "System"}
                      </span>
                    </div>
                    {(selectedItem.adjustedByUser?.email ||
                      (typeof selectedItem.adjustedBy !== "string" &&
                        selectedItem.adjustedBy?.email)) && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Email
                        </span>
                        <span className="text-sm text-gray-700">
                          {selectedItem.adjustedByUser?.email ||
                            (typeof selectedItem.adjustedBy !== "string" &&
                              selectedItem.adjustedBy?.email)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeDetail}
                className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
export { StockHistoryList };
