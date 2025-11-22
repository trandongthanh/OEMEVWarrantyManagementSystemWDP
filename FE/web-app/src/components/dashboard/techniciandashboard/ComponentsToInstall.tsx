"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Wrench } from "lucide-react";
import caseLineService, { CaseLine } from "@/services/caseLineService";
import componentReservationService from "@/services/componentReservationService";
import { ComponentInstallModal } from "./ComponentInstallModal";
import { toast } from "sonner";
import { usePolling } from "@/hooks/usePolling";
import { getCurrentUser } from "@/services/authService";

export function ComponentsToInstall() {
  const [components, setComponents] = useState<CaseLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<{
    reservationId: string;
    componentName: string;
    vehicleVin: string;
    componentSerial: string;
  } | null>(null);
  const [selectedForBulkInstall, setSelectedForBulkInstall] = useState<
    Set<string>
  >(new Set());
  const [isBulkInstalling, setIsBulkInstalling] = useState(false);

  // Real-time polling for components to install
  usePolling(
    async () => {
      const currentUser = getCurrentUser();
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        repairTechId: currentUser?.userId,
        limit: 50,
      });
      const caseLines = response.data.caseLines || [];
      const componentsReady = caseLines.filter((cl) => {
        if (cl.reservations && cl.reservations.length > 0) {
          return cl.reservations.some((res) => res.status === "PICKED_UP");
        }
        return (cl.quantityReserved || 0) > 0;
      });
      setComponents(componentsReady);
      return componentsReady;
    },
    {
      interval: 120000, // Poll every 2 minutes
      enabled: !loading && !selectedComponent, // Only poll when not loading and no modal open
      onError: (err) => {
        console.error("❌ Components polling error:", err);
      },
    }
  );

  useEffect(() => {
    loadComponentsToInstall();
  }, []);

  const loadComponentsToInstall = async () => {
    try {
      setLoading(true);

      // Fetch case lines with IN_REPAIR status (components picked up, ready to install)
      // Technician has permission to call this API
      const currentUser = getCurrentUser();
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        repairTechId: currentUser?.userId,
        limit: 50,
      });

      const caseLines = response.data.caseLines || [];

      // Filter only case lines with picked up components (reservation status PICKED_UP, not yet installed)
      const componentsReady = caseLines.filter((cl) => {
        // Check if case line has reservations with PICKED_UP status
        if (cl.reservations && cl.reservations.length > 0) {
          return cl.reservations.some((res) => res.status === "PICKED_UP");
        }
        // Fallback: if quantityReserved field exists and > 0
        return (cl.quantityReserved || 0) > 0;
      });

      setComponents(componentsReady);
    } catch (error) {
      console.error("Failed to load components to install:", error);
      toast.error("Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = (component: CaseLine) => {
    // Find the first PICKED_UP reservation for this case line
    const reservation = component.reservations?.find(
      (res) => res.status === "PICKED_UP"
    );

    if (!reservation || !reservation.reservationId) {
      toast.error("No reservation found for this component");
      return;
    }

    setSelectedComponent({
      reservationId: reservation.reservationId,
      componentName: component.typeComponent?.name || "Component",
      vehicleVin: component.guaranteeCase?.vehicleProcessingRecord?.vin || "",
      componentSerial: reservation.component?.serialNumber || "",
    });
  };

  const toggleSelection = (reservationId: string) => {
    const newSelected = new Set(selectedForBulkInstall);
    if (newSelected.has(reservationId)) {
      newSelected.delete(reservationId);
    } else {
      newSelected.add(reservationId);
    }
    setSelectedForBulkInstall(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedForBulkInstall.size === components.length) {
      setSelectedForBulkInstall(new Set());
    } else {
      const allReservationIds = components
        .map(
          (c) =>
            c.reservations?.find((r) => r.status === "PICKED_UP")?.reservationId
        )
        .filter(Boolean) as string[];
      setSelectedForBulkInstall(new Set(allReservationIds));
    }
  };

  const handleBulkInstall = async () => {
    if (selectedForBulkInstall.size === 0) {
      toast.error("Please select components to install");
      return;
    }

    setIsBulkInstalling(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Install components one by one using for loop
      for (const reservationId of Array.from(selectedForBulkInstall)) {
        try {
          await componentReservationService.installComponent(reservationId);
          successCount++;
        } catch (err) {
          console.error(`Failed to install reservation ${reservationId}:`, err);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully installed ${successCount} component(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to install ${errorCount} component(s)`);
      }

      // Clear selection and reload
      setSelectedForBulkInstall(new Set());
      loadComponentsToInstall();
    } catch (error) {
      console.error("Bulk install error:", error);
      toast.error("Failed to complete bulk installation");
    } finally {
      setIsBulkInstalling(false);
    }
  };

  const handleInstallSuccess = () => {
    setSelectedComponent(null);
    loadComponentsToInstall();
    toast.success("Component installed successfully");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        data-section="components-to-install"
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Ready to Install
              </h2>
              <p className="text-xs text-gray-500">
                Components awaiting installation
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {components.length}
          </span>
        </div>

        {components.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No components ready</p>
            <p className="text-xs text-gray-400 mt-1">
              Components will appear after pickup
            </p>
          </div>
        ) : (
          <>
            {/* Bulk Actions Bar */}
            {components.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedForBulkInstall.size === components.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedForBulkInstall.size > 0
                      ? `${selectedForBulkInstall.size} selected`
                      : "Select all"}
                  </span>
                </div>
                {selectedForBulkInstall.size > 0 && (
                  <button
                    onClick={handleBulkInstall}
                    disabled={isBulkInstalling}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isBulkInstalling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Wrench className="w-4 h-4" />
                        Install Selected ({selectedForBulkInstall.size})
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {components.map((component) => {
                const reservation = component.reservations?.find(
                  (res) => res.status === "PICKED_UP"
                );
                const reservationId = reservation?.reservationId || "";
                const isSelected = selectedForBulkInstall.has(reservationId);

                return (
                  <motion.div
                    key={component.id || component.caseLineId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-lg p-3 border transition-colors ${
                      isSelected
                        ? "bg-purple-50 border-purple-300"
                        : "hover:bg-purple-50 hover:border-purple-200 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox for bulk selection */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(reservationId)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 flex-shrink-0"
                      />
                      <div className="flex items-center justify-between gap-3 flex-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                            {component.typeComponent?.name || "Component"}
                          </h4>
                          <div className="space-y-0.5 text-xs text-gray-600">
                            {component.diagnosisText && (
                              <p className="truncate">
                                <span className="font-medium">Diagnosis:</span>{" "}
                                {component.diagnosisText}
                              </p>
                            )}
                            {component.correctionText && (
                              <p className="truncate">
                                <span className="font-medium">Correction:</span>{" "}
                                {component.correctionText}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Qty:</span>{" "}
                              {component.reservations?.filter(
                                (res) => res.status === "PICKED_UP"
                              ).length ||
                                component.quantityReserved ||
                                component.quantity}
                            </p>
                            <p className="truncate">
                              <span className="font-medium">Case:</span>{" "}
                              {component.guaranteeCaseId}
                            </p>
                            {/* Show pickup status and location */}
                            {(() => {
                              const reservation = component.reservations?.find(
                                (res) => res.status === "PICKED_UP"
                              );
                              if (!reservation?.component) return null;

                              const serialNumber =
                                reservation.component.serialNumber;

                              return (
                                <p className="truncate text-green-600">
                                  <span className="font-medium">
                                    ✓ Ready to install:
                                  </span>{" "}
                                  {serialNumber} (Picked up by Parts
                                  Coordinator)
                                </p>
                              );
                            })()}
                            <p className="text-xs text-gray-500">
                              Status: {component.status} • Picked up, ready to
                              install
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInstallClick(component)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                        >
                          <Wrench className="w-4 h-4" />
                          Install
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {selectedComponent && (
        <ComponentInstallModal
          isOpen={true}
          onClose={() => setSelectedComponent(null)}
          onSuccess={handleInstallSuccess}
          reservationId={selectedComponent.reservationId}
          componentName={selectedComponent.componentName}
          vehicleVin={selectedComponent.vehicleVin}
          componentSerial={selectedComponent.componentSerial}
        />
      )}
    </>
  );
}
