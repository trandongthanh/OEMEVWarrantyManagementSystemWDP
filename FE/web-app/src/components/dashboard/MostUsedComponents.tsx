"use client";

import React, { useEffect, useState } from "react";
import inventoryService, {
  MostUsedTypeComponentItem,
} from "@/services/inventoryService";
import { TrendingUp, Package, Loader, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  limit?: number;
  showDateFilter?: boolean;
}

export default function MostUsedComponents({
  limit = 10,
  showDateFilter = false,
}: Props) {
  const [components, setComponents] = useState<MostUsedTypeComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchMostUsed = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: Partial<{
        limit: number;
        startDate: string;
        endDate: string;
      }> = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await inventoryService.getMostUsedTypeComponents(params);
      setComponents(response.items);
    } catch (err) {
      console.error("Error fetching most used components:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, startDate, endDate]);

  useEffect(() => {
    fetchMostUsed();
  }, [fetchMostUsed]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading popular components...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Most Used Components
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Top {limit} components installed in completed repairs
            </p>
          </div>
        </div>

        {/* Date Filter */}
        {showDateFilter && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!components || components.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No usage data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {components.map((item, index) => (
              <motion.div
                key={item.typeComponentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {/* Rank */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : index === 1
                      ? "bg-gray-200 text-gray-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Component Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 truncate">
                      {item.typeComponentName}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500">
                    ID: {item.typeComponentId}
                  </p>
                </div>

                {/* Usage Count */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {item.totalUsed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">times used</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
