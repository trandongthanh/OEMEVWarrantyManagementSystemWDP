"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import inventoryService, {
  StockHistoryItem,
  StockHistoryResponse,
} from "@/services/inventoryService";
import { Loader2, History, Package } from "lucide-react";
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
                  <History className="w-8 h-8 text-blue-600" />
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
              <History className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">No history found</p>
            </div>
          ) : (
            <>
              {/* ================= TABLE ================= */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                      <th className="py-3 px-6 font-medium">Event</th>
                      <th className="py-3 px-6 font-medium">Quantity Change</th>
                      <th className="py-3 px-6 font-medium">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {item.eventType}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span
                            className={`font-medium ${
                              item.quantityChange > 0
                                ? "text-green-600"
                                : item.quantityChange < 0
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {item.quantityChange > 0
                              ? `+${item.quantityChange}`
                              : item.quantityChange}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {new Date(item.eventDate).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ================= PAGINATION ================= */}
              <div className="flex justify-between items-center p-6 border-t border-gray-200">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() => loadHistory(pagination.currentPage - 1)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600 font-medium">
                  Page {pagination.currentPage} / {pagination.totalPages}
                </span>

                <button
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => loadHistory(pagination.currentPage + 1)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
export { StockHistoryList };
