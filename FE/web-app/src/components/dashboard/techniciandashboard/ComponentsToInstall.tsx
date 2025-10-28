"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Wrench, AlertCircle } from "lucide-react";
import caseLineService, { CaseLine } from "@/services/caseLineService";
import { ComponentInstallModal } from "./ComponentInstallModal";
import { toast } from "sonner";

export function ComponentsToInstall() {
  const [components, setComponents] = useState<CaseLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<{
    reservationId: string;
    componentName: string;
  } | null>(null);

  useEffect(() => {
    loadComponentsToInstall();
  }, []);

  const loadComponentsToInstall = async () => {
    try {
      setLoading(true);

      // Fetch case lines with IN_REPAIR status (components picked up, ready to install)
      // Technician has permission to call this API
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        limit: 50,
      });

      const caseLines = response.data.caseLines || [];

      // Filter only case lines with reserved components (picked up but not yet installed)
      const componentsReady = caseLines.filter(
        (cl) => (cl.quantityReserved || 0) > 0
      );

      setComponents(componentsReady);
    } catch (error) {
      console.error("Failed to load components to install:", error);
      toast.error("Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = (component: CaseLine) => {
    // Note: We need reservationId from component reservation, but backend doesn't have GET endpoint
    // For now, show message that this needs backend support
    console.log("Install clicked for case line:", component.id);
    toast.error(
      "Install feature requires GET /component-reservations endpoint to fetch reservation ID"
    );

    // TODO: When backend adds GET endpoint:
    // 1. Fetch component reservation by case line ID
    // 2. Get reservationId
    // 3. Open modal with reservationId
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
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {components.map((component) => (
              <motion.div
                key={component.id || component.caseLineId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-3 hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {component.typeComponent?.name || "Component"}
                      </h3>
                    </div>

                    <div className="space-y-0.5 text-xs text-gray-600">
                      <p>
                        <span className="font-medium">Qty:</span>{" "}
                        {component.quantityReserved || component.quantity}
                      </p>
                      <p className="truncate">
                        <span className="font-medium">Case:</span>{" "}
                        {component.guaranteeCaseId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Status: {component.status} • Reserved components ready
                        for installation
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInstallClick(component)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Install
                  </button>
                </div>

                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    <strong>Note:</strong> Requires backend endpoint
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {selectedComponent && (
        <ComponentInstallModal
          isOpen={true}
          onClose={() => setSelectedComponent(null)}
          onSuccess={handleInstallSuccess}
          reservationId={selectedComponent.reservationId}
          componentName={selectedComponent.componentName}
        />
      )}
    </>
  );
}
