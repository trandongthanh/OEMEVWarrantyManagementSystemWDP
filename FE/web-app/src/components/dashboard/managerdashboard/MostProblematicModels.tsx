"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Loader2,
  Car,
  BarChart3,
  PieChart,
  ListFilter,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend,
} from "recharts";
import vehicleModelService, {
  ProblematicModel,
} from "@/services/vehicleModelService";

export function MostProblematicModels() {
  const [models, setModels] = useState<ProblematicModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "bar" | "pie">("bar");

  const fetchProblematicModels = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: { limit: number; startDate?: string; endDate?: string } = {
        limit,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await vehicleModelService.getMostProblematicModels(
        params
      );
      setModels(response.models);
    } catch (err: unknown) {
      console.error("Error fetching problematic models:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [limit, startDate, endDate]);

  useEffect(() => {
    fetchProblematicModels();
  }, [fetchProblematicModels]);

  // Chart colors matching manager dashboard theme
  const CHART_COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#22c55e", // green-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#0ea5e9", // sky-500
  ];

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: ProblematicModel;
      value: number;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">
            {data.vehicleModelName}
          </p>
          <p className="text-sm text-gray-600">SKU: {data.sku}</p>
          {data.companyName && (
            <p className="text-sm text-gray-600">Company: {data.companyName}</p>
          )}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-semibold text-red-600">
              {data.totalIssues} issues
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Most Problematic Vehicle Models
          </h2>
          <p className="text-gray-600 mt-1">
            Track vehicle models with the highest number of warranty issues
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ListFilter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top Models
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("bar")}
                  className={`flex-1 px-3 py-2.5 rounded-lg border transition-colors ${
                    viewMode === "bar"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode("pie")}
                  className={`flex-1 px-3 py-2.5 rounded-lg border transition-colors ${
                    viewMode === "pie"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <PieChart className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 px-3 py-2.5 rounded-lg border transition-colors ${
                    viewMode === "list"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <ListFilter className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Car className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No problematic models found</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Bar Chart View */}
              {viewMode === "bar" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Issues by Vehicle Model
                  </h3>
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={models}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="vehicleModelName"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="totalIssues" radius={[10, 10, 0, 0]}>
                        {models.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pie Chart View */}
              {viewMode === "pie" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Issue Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={500}>
                    <RePieChart>
                      <Pie
                        data={models}
                        dataKey="totalIssues"
                        nameKey="vehicleModelName"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        innerRadius={80}
                        label={({ percent }) =>
                          percent ? `${(percent * 100).toFixed(1)}%` : ""
                        }
                        labelLine={false}
                      >
                        {models.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-sm text-gray-700">{value}</span>
                        )}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Ranked by Issues
                  </h3>
                  <div className="space-y-3">
                    {models.map((model, index) => (
                      <motion.div
                        key={model.vehicleModelId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-lg font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {model.vehicleModelName}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600">
                              SKU: {model.sku}
                            </p>
                            {model.companyName && (
                              <p className="text-sm text-gray-600">
                                {model.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-700">
                            {model.totalIssues} issues
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
