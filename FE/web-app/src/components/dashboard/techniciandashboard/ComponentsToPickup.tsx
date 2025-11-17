"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Warehouse, MapPin } from "lucide-react";
import { CaseLine } from "@/services/caseLineService";
import componentReservationService from "@/services/componentReservationService";
import { toast } from "sonner";
import { usePolling } from "@/hooks/usePolling";
import { getCurrentUser } from "@/services/authService";

export function ComponentsToPickup() {
  const [components, setComponents] = useState<CaseLine[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time polling for components to pickup
  usePolling(
    async () => {
      const currentUser = getCurrentUser();
      const response =
        await componentReservationService.getComponentReservations({
          status: "RESERVED",
          repairTechId: currentUser?.userId,
          limit: 100,
        });

      // Group reservations by case line
      const caseLineMap = new Map<string, any>();

      response.data.reservations.forEach((reservation: any) => {
        const caseLineId = reservation.caseLine?.id;
        if (!caseLineId) return;

        if (!caseLineMap.has(caseLineId)) {
          caseLineMap.set(caseLineId, {
            ...reservation.caseLine,
            reservations: [],
          });
        }

        caseLineMap.get(caseLineId)!.reservations.push(reservation);
      });

      const pickupComponents = Array.from(caseLineMap.values());
      setComponents(pickupComponents);
      return pickupComponents;
    },
    {
      interval: 120000, // Poll every 2 minutes
      enabled: !loading,
      onError: (err) => {
        console.error("❌ Components to pickup polling error:", err);
      },
    }
  );

  useEffect(() => {
    loadComponentsToPickup();
  }, []);

  const loadComponentsToPickup = async () => {
    try {
      setLoading(true);

      const currentUser = getCurrentUser();
      const response =
        await componentReservationService.getComponentReservations({
          status: "RESERVED",
          repairTechId: currentUser?.userId,
          limit: 100,
        });

      // Group reservations by case line
      const caseLineMap = new Map<string, any>();

      response.data.reservations.forEach((reservation: any) => {
        const caseLineId = reservation.caseLine?.id;
        if (!caseLineId) return;

        if (!caseLineMap.has(caseLineId)) {
          caseLineMap.set(caseLineId, {
            ...reservation.caseLine,
            reservations: [],
          });
        }

        caseLineMap.get(caseLineId)!.reservations.push(reservation);
      });

      setComponents(Array.from(caseLineMap.values()));
    } catch (error) {
      console.error("Failed to load components to pickup:", error);
      toast.error("Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Warehouse className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pickup Required
              </h2>
              <p className="text-sm text-gray-500">
                Components waiting for pickup
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Warehouse className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pickup Required
              </h2>
              <p className="text-sm text-gray-500">
                {components.length === 0
                  ? "No components to pickup"
                  : `${components.length} component${
                      components.length !== 1 ? "s" : ""
                    } waiting`}
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            {components.length}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {components.length === 0 ? (
          <div className="p-8 text-center">
            <Warehouse className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No components waiting for pickup
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Components will appear here when they are reserved
            </p>
          </div>
        ) : (
          components.map((component, index) => {
            const reservation = component.reservations?.find(
              (res: any) => res.status === "RESERVED"
            );

            const warehouse =
              reservation?.component?.stockTransferRequest
                ?.requestingWarehouse || reservation?.component?.warehouse;

            return (
              <motion.div
                key={component.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {component.typeComponent?.name || "Component"}
                      </h3>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        Pickup Required
                      </span>
                    </div>

                    {reservation?.component?.serialNumber && (
                      <p className="text-sm text-gray-600 mb-2">
                        Serial:{" "}
                        <span className="font-mono font-medium">
                          {reservation.component.serialNumber}
                        </span>
                      </p>
                    )}

                    {warehouse && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
                        <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-orange-900">
                            📍 Pickup Location
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {warehouse.name}
                          </p>
                          {warehouse.address && (
                            <p className="text-xs text-gray-600 mt-1">
                              {warehouse.address}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {component.guaranteeCase?.vehicleProcessingRecord?.vin && (
                      <p className="text-xs text-gray-500 mt-2">
                        VIN:{" "}
                        {component.guaranteeCase.vehicleProcessingRecord.vin}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
