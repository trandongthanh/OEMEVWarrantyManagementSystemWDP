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
  X,
  Package,
  Building,
  User,
} from "lucide-react";
import { Pagination } from "@/components/ui";

interface AdjustmentListProps {
  onCreateClick?: () => void;
  onBulkUploadClick?: () => void;
}

export default function AdjustmentList({
  onCreateClick,
  onBulkUploadClick,
}: AdjustmentListProps) {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ LIST ADJUSTMENTS
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentSummary[]>(
    []
  );
  const [filteredAdjustments, setFilteredAdjustments] = useState<
    InventoryAdjustmentSummary[]
  >([]);

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

  // ✅ FILTER ADJUSTMENTS
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAdjustments(adjustments);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = adjustments.filter((adj) => {
      const componentName = adj.stock?.typeComponent?.name?.toLowerCase() || "";
      const sku = adj.stock?.typeComponent?.sku?.toLowerCase() || "";
      const warehouse = adj.stock?.warehouse?.name?.toLowerCase() || "";
      const reason = adj.reason.toLowerCase();
      const adjustedBy = adj.adjustedBy?.name?.toLowerCase() || "";

      return (
        componentName.includes(search) ||
        sku.includes(search) ||
        warehouse.includes(search) ||
        reason.includes(search) ||
        adjustedBy.includes(search)
      );
    });

    setFilteredAdjustments(filtered);
  }, [searchTerm, adjustments]);

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

              <div className="relative w-96">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  placeholder="Search by component, SKU, warehouse, reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredAdjustments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <ClipboardList className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">
                {searchTerm
                  ? "No adjustments match your search"
                  : "No adjustments found"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-6 font-semibold">Component</th>
                      <th className="py-3 px-6 font-semibold">SKU</th>
                      <th className="py-3 px-6 font-semibold">Warehouse</th>
                      <th className="py-3 px-6 font-semibold">Type</th>
                      <th className="py-3 px-6 font-semibold">Qty</th>
                      <th className="py-3 px-6 font-semibold">Reason</th>
                      <th className="py-3 px-6 font-semibold">Adjusted By</th>
                      <th className="py-3 px-6 font-semibold">Date</th>
                      <th className="py-3 px-6 font-semibold text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAdjustments.map((a) => (
                      <tr
                        key={a.adjustmentId}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {a.stock?.typeComponent?.name || "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {a.stock?.typeComponent?.category || ""}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-mono text-gray-600">
                            {a.stock?.typeComponent?.sku || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {a.stock?.warehouse?.name || "—"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              a.adjustmentType === "IN"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {a.adjustmentType}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-semibold ${
                              a.adjustmentType === "IN"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {a.adjustmentType === "IN" ? "+" : "-"}
                            {a.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-xs">
                            <div className="text-sm text-gray-900 truncate">
                              {a.reason}
                            </div>
                            {a.note && (
                              <div className="text-xs text-gray-500 truncate">
                                {a.note}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {a.adjustedBy?.name || "—"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-700">
                            {new Date(
                              a.adjustedAt || a.created_at
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              a.adjustedAt || a.created_at
                            ).toLocaleTimeString()}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => openDetail(a.adjustmentId)}
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

          {/* Pagination */}
          {!loading && adjustments.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={loadAdjustments}
            />
          )}
        </motion.div>
      </div>

      {/* =================== DETAIL MODAL =================== */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closeDetail}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {detailLoading || !selectedAdjustment ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Header with color-coded background */}
                <div
                  className={`p-6 border-b ${
                    selectedAdjustment.adjustmentType === "IN"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Adjustment Details
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            selectedAdjustment.adjustmentType === "IN"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedAdjustment.adjustmentType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-mono">
                        ID: {selectedAdjustment.adjustmentId}
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
                            selectedAdjustment.adjustmentType === "IN"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedAdjustment.adjustmentType === "IN"
                            ? "+"
                            : "-"}
                          {selectedAdjustment.quantity}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Adjusted At
                        </span>
                        <span className="text-base font-medium text-gray-900 block">
                          {new Date(
                            selectedAdjustment.adjustedAt ||
                              selectedAdjustment.createdAt
                          ).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(
                            selectedAdjustment.adjustedAt ||
                              selectedAdjustment.createdAt
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600 block mb-1">
                          Reason
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {selectedAdjustment.reason}
                        </span>
                      </div>
                      {selectedAdjustment.note && (
                        <div className="col-span-2">
                          <span className="text-sm text-gray-600 block mb-1">
                            Additional Note
                          </span>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                            {selectedAdjustment.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Component Info */}
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
                          {selectedAdjustment.stock?.typeComponent?.name || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          SKU
                        </span>
                        <span className="text-base font-mono font-medium text-gray-900">
                          {selectedAdjustment.stock?.typeComponent?.sku || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Category
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                          {selectedAdjustment.stock?.typeComponent?.category ||
                            "—"}
                        </span>
                      </div>
                      {selectedAdjustment.stock?.typeComponent?.price && (
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">
                            Unit Price
                          </span>
                          <span className="text-base font-semibold text-gray-900">
                            $
                            {selectedAdjustment.stock.typeComponent.price.toFixed(
                              2
                            )}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Stock ID
                        </span>
                        <span className="text-base font-mono text-gray-700">
                          {selectedAdjustment.stockId || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse & User Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                      <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Building className="w-5 h-5 text-purple-600" />
                        Warehouse
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">
                            Name
                          </span>
                          <span className="text-base font-medium text-gray-900">
                            {selectedAdjustment.stock?.warehouse?.name || "—"}
                          </span>
                        </div>
                        {selectedAdjustment.stock?.warehouse?.address && (
                          <div>
                            <span className="text-sm text-gray-600 block mb-1">
                              Address
                            </span>
                            <span className="text-sm text-gray-700">
                              {selectedAdjustment.stock.warehouse.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                      <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-600" />
                        Adjusted By
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">
                            Name
                          </span>
                          <span className="text-base font-medium text-gray-900">
                            {selectedAdjustment.adjustedBy?.name || "—"}
                          </span>
                        </div>
                        {selectedAdjustment.adjustedBy?.email && (
                          <div>
                            <span className="text-sm text-gray-600 block mb-1">
                              Email
                            </span>
                            <span className="text-sm text-gray-700">
                              {selectedAdjustment.adjustedBy.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Affected Items (if any) */}
                  {selectedAdjustment.items &&
                    selectedAdjustment.items.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <ClipboardList className="w-5 h-5 text-gray-600" />
                          Affected Items ({selectedAdjustment.items.length})
                        </h4>
                        <div className="max-h-64 overflow-auto rounded-lg border border-gray-300 bg-white">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr className="text-left text-gray-700 font-semibold">
                                <th className="py-3 px-4">Serial Number</th>
                                <th className="py-3 px-4">Old Status</th>
                                <th className="py-3 px-4">New Status</th>
                                <th className="py-3 px-4 text-right">Delta</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedAdjustment.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                  <td className="py-3 px-4 font-mono text-gray-900">
                                    {item.serialNumber}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                      {item.oldStatus}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                      {item.newStatus}
                                    </span>
                                  </td>
                                  <td
                                    className={`py-3 px-4 text-right font-semibold ${
                                      item.delta > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {item.delta > 0 ? "+" : ""}
                                    {item.delta}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export { AdjustmentList };
