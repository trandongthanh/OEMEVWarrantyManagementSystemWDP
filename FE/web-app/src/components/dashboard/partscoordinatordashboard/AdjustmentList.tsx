"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import inventoryService, {
  InventoryAdjustmentDetail,
  InventoryAdjustmentSummary,
} from "@/services/inventoryService";
import {
  Loader2,
  Search,
  Eye,
  ClipboardList,
  Filter,
  Plus,
  Upload,
} from "lucide-react";

interface AdjustmentListProps {
  onCreateClick?: () => void;
  onBulkUploadClick?: () => void;
}

export default function AdjustmentList({
  onCreateClick,
  onBulkUploadClick,
}: AdjustmentListProps) {
  const [loading, setLoading] = useState(true);

  // ✅ LIST ADJUSTMENTS
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentSummary[]>(
    []
  );

  // ✅ Pagination
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 20,
  });

  // ✅ DETAIL STATE
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<InventoryAdjustmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadAdjustments(1);
  }, []);

  // ======================================================
  // ✅ LOAD LIST
  // ======================================================
  const loadAdjustments = async (page: number) => {
    try {
      setLoading(true);

      const result = await inventoryService.getAdjustmentList({ page });

      setAdjustments(result.items ?? []);

      setPagination({
        totalItems: result.pagination?.totalItems ?? 0,
        totalPages: result.pagination?.totalPages ?? 1,
        currentPage: result.pagination?.currentPage ?? 1,
        itemsPerPage: result.pagination?.itemsPerPage ?? 20,
      });
    } catch (err) {
      console.error("Error fetching adjustments:", err);

      setAdjustments([]);
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
  // ✅ LOAD DETAIL
  // ======================================================
  const openDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      setShowDetail(true);

      const detail = await inventoryService.getAdjustmentById(id);
      setSelectedAdjustment(detail);
    } catch (err) {
      console.error("Error fetching adjustment detail:", err);
      setSelectedAdjustment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedAdjustment(null);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardList className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Adjustment History
                  </h1>
                </div>
                <p className="text-gray-600">
                  View inventory adjustment records and details
                </p>
              </div>
              <div className="flex items-center gap-3">
                {onBulkUploadClick && (
                  <button
                    onClick={onBulkUploadClick}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                  >
                    <Upload className="w-5 h-5" />
                    Bulk Import
                  </button>
                )}
                {onCreateClick && (
                  <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Create Adjustment
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Search & Filter</span>
              </div>

              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  placeholder="Search adjustments..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : adjustments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <ClipboardList className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">No adjustments found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                      <th className="py-3 px-6 font-medium">ID</th>
                      <th className="py-3 px-6 font-medium">Warehouse</th>
                      <th className="py-3 px-6 font-medium">Reason</th>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium">Created At</th>
                      <th className="py-3 px-6 font-medium text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {adjustments.map((a) => (
                      <tr
                        key={a.adjustmentId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {a.adjustmentId}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {a.warehouseId}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {a.reason}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {a.adjustmentType}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => openDetail(a.adjustmentId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center p-6 border-t border-gray-200">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() => loadAdjustments(pagination.currentPage - 1)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
                >
                  Prev
                </button>

                <span className="text-sm text-gray-600 font-medium">
                  Page {pagination.currentPage} / {pagination.totalPages}
                </span>

                <button
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => loadAdjustments(pagination.currentPage + 1)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* =================== DETAIL MODAL =================== */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
            {detailLoading || !selectedAdjustment ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  Adjustment Detail
                </h3>

                <div className="space-y-2 mb-6">
                  <p>
                    <strong>ID:</strong> {selectedAdjustment.adjustmentId}
                  </p>
                  <p>
                    <strong>Warehouse:</strong>{" "}
                    {selectedAdjustment.stock?.warehouse?.name ||
                      selectedAdjustment.warehouseId}
                  </p>
                  <p>
                    <strong>Stock ID:</strong>{" "}
                    {selectedAdjustment.stockId || "—"}
                  </p>
                  <p>
                    <strong>Component:</strong>{" "}
                    {selectedAdjustment.stock?.typeComponent?.name || "—"}
                  </p>
                  <p>
                    <strong>Quantity:</strong>{" "}
                    {selectedAdjustment.quantity || "—"}
                  </p>
                  <p>
                    <strong>Adjusted By:</strong>{" "}
                    {selectedAdjustment.adjustedBy?.name || "—"}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedAdjustment.adjustmentType}
                  </p>
                  <p>
                    <strong>Reason:</strong> {selectedAdjustment.reason}
                  </p>
                  <p>
                    <strong>Note:</strong> {selectedAdjustment.note || "—"}
                  </p>
                  <p>
                    <strong>Adjusted At:</strong>{" "}
                    {selectedAdjustment.adjustedAt
                      ? new Date(selectedAdjustment.adjustedAt).toLocaleString()
                      : selectedAdjustment.createdAt
                      ? new Date(selectedAdjustment.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {selectedAdjustment.items &&
                  selectedAdjustment.items.length > 0 && (
                    <>
                      <h4 className="font-semibold mb-2">Affected Items</h4>
                      <div className="max-h-64 overflow-auto border rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-gray-600">
                              <th className="py-2">Serial</th>
                              <th className="py-2">Old Status</th>
                              <th className="py-2">New Status</th>
                              <th className="py-2">Δ</th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedAdjustment.items.map((item, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2">{item.serialNumber}</td>
                                <td className="py-2">{item.oldStatus}</td>
                                <td className="py-2">{item.newStatus}</td>
                                <td className="py-2">
                                  {item.delta > 0
                                    ? `+${item.delta}`
                                    : item.delta}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                <button
                  onClick={closeDetail}
                  className="mt-6 w-full py-2 bg-gray-800 text-white rounded-lg"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { AdjustmentList };
