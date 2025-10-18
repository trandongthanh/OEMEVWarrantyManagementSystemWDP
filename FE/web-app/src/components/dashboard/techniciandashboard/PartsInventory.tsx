"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle,
  Box,
  Wrench,
  X,
  Info,
} from "lucide-react";
import { CompatibleComponent } from "@/services/technicianService";

const COMPONENT_CATEGORIES = [
  { value: "battery", label: "Battery Systems" },
  { value: "motor", label: "Electric Motors" },
  { value: "electronics", label: "Electronics" },
  { value: "chassis", label: "Chassis & Suspension" },
  { value: "brake", label: "Brake Systems" },
  { value: "body", label: "Body & Interior" },
  { value: "lighting", label: "Lighting System" },
  { value: "other", label: "Other Components" },
];

export function PartsInventory() {
  const [components] = useState<CompatibleComponent[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<
    CompatibleComponent[]
  >([]);
  const [isLoading] = useState(false);
  const [error] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedComponent, setSelectedComponent] =
    useState<CompatibleComponent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    filterComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, searchQuery, categoryFilter]);

  const filterComponents = () => {
    let filtered = [...components];

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((comp) =>
        comp.name.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.typeComponentId.toLowerCase().includes(query)
      );
    }

    setFilteredComponents(filtered);
  };

  const viewComponentDetails = (component: CompatibleComponent) => {
    setSelectedComponent(component);
    setShowDetailsModal(true);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Parts Inventory
              </h1>
              <p className="text-gray-600 mt-1">
                Browse available components and check warranty status
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Component Search Available
              </p>
              <p className="text-sm text-blue-700 mt-1">
                To search for compatible components, you need to select a
                specific processing record first. This feature is available when
                working on a task.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by component name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {COMPONENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Components Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : filteredComponents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16">
              <Package className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No components available
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your filters to see more components."
                  : "Component inventory will appear here when you search within a task."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComponents.map((component, index) => (
                <motion.div
                  key={component.typeComponentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => viewComponentDetails(component)}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Box className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {component.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        ID: {component.typeComponentId}
                      </p>
                      {component.isUnderWarranty !== undefined && (
                        <div className="flex items-center gap-2">
                          {component.isUnderWarranty ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Under Warranty
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                              <AlertCircle className="w-3 h-3" />
                              Not Covered
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">How to Search</h3>
            </div>
            <p className="text-sm text-gray-600">
              Access component search from within your assigned tasks to find
              compatible parts for specific vehicles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Warranty Status</h3>
            </div>
            <p className="text-sm text-gray-600">
              Each component shows warranty coverage status to help you
              determine claim eligibility.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Quick Access</h3>
            </div>
            <p className="text-sm text-gray-600">
              Filter by category and search by name or ID to quickly find the
              parts you need.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Component Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedComponent.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Component Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Box className="w-5 h-5 text-blue-600" />
                    Component Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Component Name</p>
                      <p className="font-medium text-gray-900">
                        {selectedComponent.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Component ID</p>
                      <p className="font-medium text-gray-900">
                        {selectedComponent.typeComponentId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warranty Status */}
                {selectedComponent.isUnderWarranty !== undefined && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Warranty Status
                    </h3>
                    {selectedComponent.isUnderWarranty ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">
                            Under Warranty
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            This component is covered under warranty and
                            eligible for claim processing.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">
                            Not Covered
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            This component is not covered under warranty.
                            Additional charges may apply.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
