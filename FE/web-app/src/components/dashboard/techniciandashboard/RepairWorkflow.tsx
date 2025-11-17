"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Wrench,
  CheckCircle,
  X,
  Eye,
  AlertCircle,
  Search,
  Filter,
  Warehouse,
} from "lucide-react";
import caseLineService, { CaseLine } from "@/services/caseLineService";
import componentReservationService from "@/services/componentReservationService";
import { toast } from "sonner";
import { usePolling } from "@/hooks/usePolling";
import { getCurrentUser } from "@/services/authService";

interface ComponentWithReservation extends CaseLine {
  pickedUpReservations?: Array<{
    reservationId: string;
    status: string;
    component?: {
      serialNumber: string;
      componentId: string;
    };
    warehouse?: {
      warehouseId: string;
      name?: string;
      warehouseName?: string;
      address?: string;
    };
  }>;
}

type ViewMode = "install" | "complete";

export function RepairWorkflow() {
  const [activeView, setActiveView] = useState<ViewMode>("install");
  const [componentsToInstall, setComponentsToInstall] = useState<
    ComponentWithReservation[]
  >([]);
  const [repairsToComplete, setRepairsToComplete] = useState<CaseLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<CaseLine | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  const loadComponentsToInstall = async () => {
    try {
      const currentUser = getCurrentUser();
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        repairTechId: currentUser?.userId,
        limit: 100,
      });

      const caseLines = response.data.caseLines || [];
      const componentsReady = caseLines.filter((cl) => {
        if (cl.reservations && cl.reservations.length > 0) {
          return cl.reservations.some((res) => res.status === "PICKED_UP");
        }
        return false;
      });

      setComponentsToInstall(componentsReady as ComponentWithReservation[]);
    } catch (error) {
      console.error("Failed to load components to install:", error);
    }
  };

  const loadRepairsToComplete = async () => {
    try {
      const currentUser = getCurrentUser();
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        repairTechId: currentUser?.userId,
        limit: 100,
      });

      const inRepairLines = response.data?.caseLines || [];
      const readyToComplete = inRepairLines.filter((cl) => {
        if (!cl.reservations || cl.reservations.length === 0) return false;
        const hasInstalled = cl.reservations.some(
          (res) => res.status === "INSTALLED"
        );
        const hasPickedUp = cl.reservations.some(
          (res) => res.status === "PICKED_UP"
        );
        return hasInstalled && !hasPickedUp;
      });

      setRepairsToComplete(readyToComplete);
    } catch (error) {
      console.error("Failed to load repairs to complete:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadComponentsToInstall(), loadRepairsToComplete()]);
    } finally {
      setLoading(false);
    }
  };

  usePolling(
    async () => {
      await Promise.all([loadComponentsToInstall(), loadRepairsToComplete()]);
    },
    {
      interval: 120000,
      enabled: !loading && !showDetailModal,
      onError: (err) => console.error("❌ Repair workflow polling error:", err),
    }
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async (component: ComponentWithReservation) => {
    const reservation = component.reservations?.find(
      (res) => res.status === "PICKED_UP"
    );

    if (!reservation || !reservation.reservationId) {
      toast.error("No reservation found for this component");
      return;
    }

    const caseLineId = component.id || component.caseLineId || "";
    setProcessingItem(caseLineId);

    try {
      await componentReservationService.installComponent(
        reservation.reservationId
      );
      toast.success("Component installed successfully!");
      await loadData();
    } catch (error: unknown) {
      console.error("Failed to install component:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to install component");
    } finally {
      setProcessingItem(null);
    }
  };

  const handleMarkComplete = async (caseLine: CaseLine) => {
    const caseLineId = caseLine.id || caseLine.caseLineId || "";
    setProcessingItem(caseLineId);

    try {
      await caseLineService.markRepairComplete(caseLineId);
      toast.success("Repair marked as complete!");
      await loadData();
    } catch (error: unknown) {
      console.error("Failed to mark repair complete:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to mark repair complete"
      );
    } finally {
      setProcessingItem(null);
    }
  };

  const showDetails = (data: CaseLine) => {
    setSelectedItem(data);
    setShowDetailModal(true);
  };

  const filteredInstallComponents = componentsToInstall.filter((comp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comp.typeComponent?.name?.toLowerCase().includes(query) ||
      comp.guaranteeCaseId?.toLowerCase().includes(query) ||
      comp.guaranteeCase?.vehicleProcessingRecord?.vin
        ?.toLowerCase()
        .includes(query)
    );
  });

  const filteredCompleteRepairs = repairsToComplete.filter((repair) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      repair.typeComponent?.name?.toLowerCase().includes(query) ||
      repair.guaranteeCaseId?.toLowerCase().includes(query) ||
      repair.guaranteeCase?.vehicleProcessingRecord?.vin
        ?.toLowerCase()
        .includes(query)
    );
  });

  const currentList =
    activeView === "install"
      ? filteredInstallComponents
      : filteredCompleteRepairs;

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Repair Workflow
            </h2>
            <p className="text-gray-600 mt-1">
              Install components and complete repairs
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Tabs & Search */}
            <div className="p-6 border-b border-gray-200">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveView("install")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeView === "install"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Install Components
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeView === "install"
                        ? "bg-purple-700 text-purple-100"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {componentsToInstall.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveView("complete")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeView === "complete"
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Mark Repair Complete
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeView === "complete"
                        ? "bg-green-700 text-green-100"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {repairsToComplete.length}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Search & Filter</h3>
              </div>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by component, case ID, or VIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors text-gray-900"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="divide-y divide-gray-200">
              {currentList.length === 0 ? (
                <div className="p-12 text-center">
                  {activeView === "install" ? (
                    <>
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Components to Install
                      </h3>
                      <p className="text-gray-500">
                        Components will appear here after you pick them up from
                        the warehouse
                      </p>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Repairs to Complete
                      </h3>
                      <p className="text-gray-500">
                        Repairs will appear here after components are installed
                      </p>
                    </>
                  )}
                </div>
              ) : (
                currentList.map((item) => {
                  const itemId = item.id || item.caseLineId || "";
                  const isProcessing = processingItem === itemId;
                  const pickedUpReservation =
                    activeView === "install"
                      ? (item as ComponentWithReservation).reservations?.find(
                          (res) => res.status === "PICKED_UP"
                        )
                      : null;

                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-6">
                        {/* Left: Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg flex-shrink-0 ${
                                activeView === "install"
                                  ? "bg-purple-100"
                                  : "bg-green-100"
                              }`}
                            >
                              {activeView === "install" ? (
                                <Package
                                  className={`w-5 h-5 ${
                                    activeView === "install"
                                      ? "text-purple-600"
                                      : "text-green-600"
                                  }`}
                                />
                              ) : (
                                <Wrench className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {item.typeComponent?.name || "Component"}
                              </h3>
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Case ID:</span>{" "}
                                  {item.guaranteeCaseId || "N/A"}
                                </div>
                                <div>
                                  <span className="font-medium">Quantity:</span>{" "}
                                  {item.quantity || 1}
                                </div>
                                {activeView === "install" &&
                                  pickedUpReservation?.warehouse && (
                                    <div className="col-span-2 flex items-start gap-2">
                                      <Warehouse className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <span className="font-medium">
                                          Warehouse:
                                        </span>{" "}
                                        {pickedUpReservation.warehouse.name ||
                                          pickedUpReservation.warehouse
                                            .warehouseName ||
                                          "N/A"}
                                        {pickedUpReservation.warehouse
                                          .address && (
                                          <span className="block text-xs text-gray-500 mt-0.5">
                                            {
                                              pickedUpReservation.warehouse
                                                .address
                                            }
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {pickedUpReservation?.component
                                  ?.serialNumber && (
                                  <div className="col-span-2">
                                    <span className="font-medium">
                                      Serial Number:
                                    </span>{" "}
                                    {pickedUpReservation.component.serialNumber}
                                  </div>
                                )}
                                {item.diagnosisText && (
                                  <div className="col-span-2">
                                    <span className="font-medium">
                                      Diagnosis:
                                    </span>{" "}
                                    {item.diagnosisText}
                                  </div>
                                )}
                                {item.correctionText && (
                                  <div className="col-span-2">
                                    <span className="font-medium">
                                      Correction:
                                    </span>{" "}
                                    {item.correctionText}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => showDetails(item)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          {activeView === "install" ? (
                            <button
                              onClick={() =>
                                handleInstall(item as ComponentWithReservation)
                              }
                              disabled={isProcessing}
                              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                            >
                              <Package className="w-4 h-4" />
                              {isProcessing
                                ? "Installing..."
                                : "Install Component"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkComplete(item)}
                              disabled={isProcessing}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {isProcessing
                                ? "Completing..."
                                : "Mark Repair Complete"}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activeView === "install"
                        ? "bg-purple-100"
                        : "bg-green-100"
                    }`}
                  >
                    {activeView === "install" ? (
                      <Package className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Wrench className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {activeView === "install"
                        ? "Component Installation Details"
                        : "Repair Completion Details"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {selectedItem.typeComponent?.name || "Component"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Component Type</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.typeComponent?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.quantity || 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Case ID</p>
                      <p className="font-medium text-gray-900 truncate">
                        {selectedItem.guaranteeCaseId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Correction */}
                {(selectedItem.diagnosisText ||
                  selectedItem.correctionText) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Diagnosis & Correction
                    </h3>
                    {selectedItem.diagnosisText && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          Diagnosis
                        </p>
                        <p className="text-sm text-blue-800">
                          {selectedItem.diagnosisText}
                        </p>
                      </div>
                    )}
                    {selectedItem.correctionText && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs font-medium text-green-900 mb-1">
                          Correction
                        </p>
                        <p className="text-sm text-green-800">
                          {selectedItem.correctionText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reservation Details for Install */}
                {activeView === "install" &&
                  (selectedItem as ComponentWithReservation).reservations && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">
                        Reservation Details
                      </h3>
                      {(selectedItem as ComponentWithReservation).reservations
                        ?.filter((res) => res.status === "PICKED_UP")
                        .map((res, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-gray-50 rounded-lg space-y-3 text-sm"
                          >
                            {res.component?.serialNumber && (
                              <div>
                                <p className="text-gray-500">Serial Number</p>
                                <p className="font-medium text-gray-900">
                                  {res.component.serialNumber}
                                </p>
                              </div>
                            )}
                            {res.warehouse && (
                              <div>
                                <p className="text-gray-500 mb-1">Warehouse</p>
                                <div className="flex items-start gap-2">
                                  <Warehouse className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {res.warehouse.name ||
                                        res.warehouse.warehouseName ||
                                        "N/A"}
                                    </p>
                                    {res.warehouse.address && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {res.warehouse.address}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                {/* Vehicle Info */}
                {selectedItem.guaranteeCase?.vehicleProcessingRecord?.vin && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Vehicle Information
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">VIN</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.guaranteeCase.vehicleProcessingRecord.vin}
                      </p>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">
                      {activeView === "install"
                        ? "Installation Instructions"
                        : "Completion Instructions"}
                    </p>
                    <p className="text-blue-700">
                      {activeView === "install"
                        ? "Verify component serial number and warehouse location before installation. Once installed, the old component will automatically be marked as removed."
                        : "Ensure all repair work is complete and tested before marking as complete. This will finalize the repair status for this case line."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (activeView === "install") {
                      handleInstall(selectedItem as ComponentWithReservation);
                    } else {
                      handleMarkComplete(selectedItem);
                    }
                    setShowDetailModal(false);
                  }}
                  disabled={processingItem !== null}
                  className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm ${
                    activeView === "install"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {activeView === "install" ? (
                    <>
                      <Package className="w-4 h-4" />
                      Install Component
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
