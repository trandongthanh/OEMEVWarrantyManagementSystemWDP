"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface CaseLineFilters {
  status?: string;
  warrantyStatus?: string;
  vehicleProcessingRecordId?: string;
  assignedTechnicianIds?: string[];
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "ASC" | "DESC";
}

interface AdvancedCaseLineFiltersProps {
  onFilterChange: (filters: CaseLineFilters) => void;
  technicians?: Array<{ userId: string; name: string }>;
}

export function AdvancedCaseLineFilters({
  onFilterChange,
  technicians = [],
}: AdvancedCaseLineFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<CaseLineFilters>({});

  const handleFilterChange = (
    key: keyof CaseLineFilters,
    value: string | string[] | undefined
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTechnicianToggle = (techId: string) => {
    const currentTechs = filters.assignedTechnicianIds || [];
    const newTechs = currentTechs.includes(techId)
      ? currentTechs.filter((id) => id !== techId)
      : [...currentTechs, techId];

    handleFilterChange(
      "assignedTechnicianIds",
      newTechs.length > 0 ? newTechs : undefined
    );
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof CaseLineFilters] !== undefined
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Line Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="READY_FOR_REPAIR">Ready for Repair</option>
              <option value="IN_REPAIR">In Repair</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Warranty Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warranty Status
            </label>
            <select
              value={filters.warrantyStatus || ""}
              onChange={(e) =>
                handleFilterChange(
                  "warrantyStatus",
                  e.target.value || undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Types</option>
              <option value="WARRANTY">Warranty</option>
              <option value="NON_WARRANTY">Non-Warranty</option>
              <option value="GOODWILL">Goodwill</option>
            </select>
          </div>

          {/* Vehicle Record ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Record ID
            </label>
            <input
              type="text"
              value={filters.vehicleProcessingRecordId || ""}
              onChange={(e) =>
                handleFilterChange(
                  "vehicleProcessingRecordId",
                  e.target.value || undefined
                )
              }
              placeholder="Enter record ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Assigned Technicians Filter */}
          {technicians.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Technicians
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {technicians.map((tech) => (
                  <label
                    key={tech.userId}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        filters.assignedTechnicianIds?.includes(tech.userId) ||
                        false
                      }
                      onChange={() => handleTechnicianToggle(tech.userId)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tech.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || "createdAt"}
                onChange={(e) =>
                  handleFilterChange(
                    "sortBy",
                    e.target.value as "createdAt" | "updatedAt"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder || "DESC"}
                onChange={(e) =>
                  handleFilterChange(
                    "sortOrder",
                    e.target.value as "ASC" | "DESC"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
