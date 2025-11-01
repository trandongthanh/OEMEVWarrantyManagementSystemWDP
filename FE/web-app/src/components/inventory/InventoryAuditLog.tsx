"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  User,
  Package,
  ArrowRight,
  Send,
  Filter,
  Calendar,
  Download,
  Loader,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: "ALLOCATION" | "TRANSFER" | "RESERVATION" | "ADJUSTMENT" | "RECEIPT";
  userId: string;
  userName: string;
  userRole: string;
  componentId?: string;
  componentName?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  quantity: number;
  beforeQuantity?: number;
  afterQuantity?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

interface InventoryAuditLogProps {
  warehouseId?: string;
  componentId?: string;
}

export default function InventoryAuditLog({
  warehouseId,
  componentId,
}: InventoryAuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    loadAuditLogs();
  }, [warehouseId, componentId, filter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError("");
    try {
      // Mock data for now - replace with actual API call
      const mockLogs: AuditLogEntry[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          action: "ALLOCATION",
          userId: "user1",
          userName: "John Doe",
          userRole: "Parts Coordinator",
          componentName: "Battery Pack",
          toWarehouse: "Service Center A",
          quantity: 5,
          reason: "New warranty case",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: "TRANSFER",
          userId: "user2",
          userName: "Jane Smith",
          userRole: "Warehouse Manager",
          componentName: "Motor Controller",
          fromWarehouse: "Main Warehouse",
          toWarehouse: "Regional Warehouse",
          quantity: 10,
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          action: "RESERVATION",
          userId: "user3",
          userName: "Mike Johnson",
          userRole: "Service Technician",
          componentName: "Charging Port",
          quantity: 2,
          reason: "Scheduled maintenance",
        },
      ];
      setLogs(mockLogs);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csv = [
      [
        "Timestamp",
        "Action",
        "User",
        "Component",
        "Quantity",
        "From",
        "To",
        "Reason",
      ].join(","),
      ...logs.map((log) =>
        [
          log.timestamp,
          log.action,
          log.userName,
          log.componentName || "-",
          log.quantity,
          log.fromWarehouse || "-",
          log.toWarehouse || "-",
          log.reason || "-",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-audit-log-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ALLOCATION":
        return <Send className="w-5 h-5" />;
      case "TRANSFER":
        return <ArrowRight className="w-5 h-5" />;
      case "RESERVATION":
        return <Package className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "ALLOCATION":
        return "bg-green-100 text-green-700 border-green-200";
      case "TRANSFER":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "RESERVATION":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "ADJUSTMENT":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "RECEIPT":
        return "bg-teal-100 text-teal-700 border-teal-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter !== "ALL" && log.action !== filter) return false;
    if (dateRange.from && new Date(log.timestamp) < new Date(dateRange.from))
      return false;
    if (dateRange.to && new Date(log.timestamp) > new Date(dateRange.to))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Inventory Audit Log
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Complete history of all inventory operations
          </p>
        </div>
        <Button
          onClick={exportLogs}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Filter className="w-4 h-4" />
              Action Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Actions</option>
              <option value="ALLOCATION">Allocations</option>
              <option value="TRANSFER">Transfers</option>
              <option value="RESERVATION">Reservations</option>
              <option value="ADJUSTMENT">Adjustments</option>
              <option value="RECEIPT">Receipts</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-semibold">Error loading logs</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Logs List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Logs Found
              </h3>
              <p className="text-gray-600">
                No audit logs match your current filters.
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl border-2 ${getActionColor(
                        log.action
                      )}`}
                    >
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {log.action}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getActionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">User:</span>
                    <span className="font-semibold text-gray-900">
                      {log.userName}
                    </span>
                    <span className="text-gray-500">({log.userRole})</span>
                  </div>

                  {log.componentName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Component:</span>
                      <span className="font-semibold text-gray-900">
                        {log.componentName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-bold text-blue-600 text-lg">
                      {log.quantity}
                    </span>
                  </div>

                  {(log.fromWarehouse || log.toWarehouse) && (
                    <div className="flex items-center gap-2 text-sm">
                      {log.fromWarehouse && (
                        <>
                          <span className="text-gray-600">From:</span>
                          <span className="font-semibold text-gray-900">
                            {log.fromWarehouse}
                          </span>
                        </>
                      )}
                      {log.fromWarehouse && log.toWarehouse && (
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      )}
                      {log.toWarehouse && (
                        <>
                          <span className="text-gray-600">To:</span>
                          <span className="font-semibold text-gray-900">
                            {log.toWarehouse}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {log.reason && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Reason:</span>{" "}
                      {log.reason}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
