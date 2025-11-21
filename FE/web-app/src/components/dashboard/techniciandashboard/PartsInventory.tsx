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
import technicianService, {
  CompatibleComponent,
  TechnicianProcessingRecord,
} from "@/services/technicianService";

const COMPONENT_CATEGORIES = [
  { value: "all", label: "All Categories" },

  // EV-Specific Systems
  { value: "HIGH_VOLTAGE_BATTERY", label: "High Voltage Battery & BMS" },
  { value: "POWERTRAIN", label: "Powertrain (Motor, Inverter, Transmission)" },
  { value: "CHARGING_SYSTEM", label: "Charging System & Port" },
  {
    value: "THERMAL_MANAGEMENT",
    label: "Thermal Management (Battery & Motor)",
  },

  // Standard Systems
  {
    value: "LOW_VOLTAGE_SYSTEM",
    label: "Low Voltage System (12V & Accessories)",
  },
  { value: "BRAKING", label: "Braking System (incl. Regenerative)" },
  { value: "SUSPENSION_STEERING", label: "Suspension & Steering" },
  { value: "HVAC", label: "HVAC (Climate Control)" },
  { value: "BODY_CHASSIS", label: "Body & Chassis" },
  { value: "INFOTAINMENT_ADAS", label: "Infotainment & ADAS" },
];

export function PartsInventory() {
  const [components, setComponents] = useState<CompatibleComponent[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<
    CompatibleComponent[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedComponent, setSelectedComponent] =
    useState<CompatibleComponent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [currentVehicleInfo, setCurrentVehicleInfo] = useState<{
    vin: string;
    model: string;
  } | null>(null);
  const [availableRecords, setAvailableRecords] = useState<
    TechnicianProcessingRecord[]
  >([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Load available records on mount
  useEffect(() => {
    loadAvailableRecords();
  }, []);

  // Filter components when search/category changes
  useEffect(() => {
    filterComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, searchQuery, categoryFilter]);

  const loadAvailableRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await technicianService.getAssignedRecords();
      const records = response.data?.records?.records || [];
      setAvailableRecords(records);
      console.log("📋 Loaded available records for selection:", records.length);
    } catch (err) {
      console.error("Failed to load records:", err);
      setError("Failed to load available vehicle records");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleRecordSelection = (recordId: string) => {
    const record = availableRecords.find(
      (r) => r.vehicleProcessingRecordId === recordId
    );
    if (record) {
      setCurrentRecordId(recordId);
      setCurrentVehicleInfo({
        vin: record.vin,
        model: record.vehicle?.model?.name || "Unknown Model",
      });
      setComponents([]); // Clear previous components
      setFilteredComponents([]);
      setCategoryFilter(""); // Reset to select category
      setTimeout(() => setCategoryFilter("all"), 0); // Then set to all categories to trigger API
      console.log("✅ Selected record:", {
        recordId,
        vin: record.vin,
        model: record.vehicle?.model?.name,
      });
    }
  };

  const loadComponents = async (recordId: string, category: string) => {
    if (!recordId) {
      setComponents([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let results: CompatibleComponent[] = [];

      if (category === "all" || category === "") {
        // Fetch components from ALL categories
        console.log("🔄 Fetching components from ALL categories...");

        const categories = COMPONENT_CATEGORIES.filter(
          (c) => c.value !== "all"
        ).map((c) => c.value);
        const promises = categories.map((cat) =>
          technicianService
            .searchCompatibleComponents(recordId, cat, searchQuery)
            .then((res) => res.data?.result || [])
            .catch((err) => {
              console.error(`Failed to fetch ${cat}:`, err);
              return [];
            })
        );

        const allResults = await Promise.all(promises);
        results = allResults.flat(); // Combine all arrays into one

        console.log(
          `🔍 Found ${results.length} total components across all categories`
        );
      } else {
        // Fetch single category
        const response = await technicianService.searchCompatibleComponents(
          recordId,
          category,
          searchQuery
        );
        results = response.data?.result || [];
        console.log(
          `🔍 Found ${results.length} components for category: ${category}`
        );
      }

      setComponents(results);
    } catch (err: unknown) {
      setError("Failed to load components");
      console.error(err);
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load components when category changes
  useEffect(() => {
    if (currentRecordId && categoryFilter !== "") {
      loadComponents(currentRecordId, categoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const filterComponents = () => {
    let filtered = [...components];

    // Search filter (no category filter needed, backend already filtered by category)
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
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">
                {currentVehicleInfo
                  ? `📦 Showing parts for: ${currentVehicleInfo.model}`
                  : "🔍 Select a Vehicle to Start"}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {currentRecordId
                  ? `VIN: ${currentVehicleInfo?.vin} - Select a category below to view compatible components.`
                  : "Choose one of your assigned vehicles from the dropdown below to search for compatible parts."}
              </p>
              {currentVehicleInfo && (
                <p className="text-xs text-blue-600 mt-2">
                  💡 Component availability depends on vehicle model and
                  warehouse stock
                </p>
              )}
            </div>
          </div>
        </motion.div>
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm space-y-4"
        >
          {/* Vehicle Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vehicle to Search Parts For
            </label>
            <select
              value={currentRecordId || ""}
              onChange={(e) => handleRecordSelection(e.target.value)}
              disabled={isLoadingRecords || availableRecords.length === 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingRecords
                  ? "Loading vehicles..."
                  : availableRecords.length === 0
                  ? "No assigned vehicles"
                  : "-- Select a vehicle --"}
              </option>
              {availableRecords.map((record) => (
                <option
                  key={record.vehicleProcessingRecordId}
                  value={record.vehicleProcessingRecordId}
                >
                  {record.vehicle?.model?.name || "Unknown Model"} -{" "}
                  {record.vin} ({record.status})
                </option>
              ))}
            </select>
          </div>

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
                <option value="">-- Select Category --</option>
                <option value="all">All Categories</option>
                {COMPONENT_CATEGORIES.filter((cat) => cat.value !== "all").map(
                  (cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  )
                )}
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">
                {categoryFilter === "all"
                  ? "Loading components from all categories..."
                  : "Loading components..."}
              </p>
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
                  : "Select a category above to view compatible components for this vehicle."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredComponents.length}
                  </span>{" "}
                  component{filteredComponents.length !== 1 ? "s" : ""}
                  {categoryFilter !== "all" && (
                    <span className="text-gray-500">
                      {" "}
                      in{" "}
                      {
                        COMPONENT_CATEGORIES.find(
                          (c) => c.value === categoryFilter
                        )?.label
                      }
                    </span>
                  )}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredComponents.map((component, index) => (
                  <motion.div
                    key={component.typeComponentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => viewComponentDetails(component)}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <Box className="w-5 h-5 text-blue-600" />
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
            </div>
          )}
        </motion.div>{" "}
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
