"use client";

import { motion } from "framer-motion";
import { Package, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import caseLineService from "@/services/caseLineService";
import componentReservationService from "@/services/componentReservationService";
import { useAuth } from "@/hooks/useAuth";

interface ComponentPickupListProps {
  serviceCenterId?: string;
}

interface ReservationItem {
  caseLineId: string;
  reservationId: string;
  componentName: string;
  componentId: string;
  quantity: number;
  status: string;
  createdAt: string;
  vehicleVin?: string;
  caseNumber?: string;
  typeComponentId?: string;
}

export function ComponentPickupList({
  serviceCenterId,
}: ComponentPickupListProps) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);

      // Note: Parts coordinator role does not have permission to access GET /case-lines endpoint
      // Backend authorization only allows: service_center_technician, service_center_staff, service_center_manager
      //
      // BACKEND FIX NEEDED:
      // Add "parts_coordinator_service_center" to authorizationByRole array in:
      // BE/src/api/routes/caseLine.router.js line ~301
      //
      // Alternative solution: Create GET /component-reservations endpoint with query filters
      // to fetch reservations by status without needing case line access

      const response = await caseLineService.getCaseLinesList({
        status: "READY_FOR_REPAIR",
        limit: 100,
      });

      const caseLines = response.data.caseLines || [];

      // Transform case lines with reservations into pickup items
      const items: ReservationItem[] = [];

      for (const caseLine of caseLines) {
        if (caseLine.reservations && caseLine.reservations.length > 0) {
          // Each reservation represents components to pick up
          for (const reservation of caseLine.reservations) {
            if (reservation.status === "RESERVED") {
              items.push({
                caseLineId: caseLine.id || caseLine.caseLineId || "",
                reservationId: reservation.reservationId,
                componentName:
                  caseLine.typeComponent?.name || "Unknown Component",
                componentId: caseLine.typeComponentId || "",
                quantity: 1, // Each reservation is 1 component
                status: reservation.status,
                createdAt: caseLine.createdAt || new Date().toISOString(),
                vehicleVin:
                  caseLine.guaranteeCase?.vehicleProcessingRecord?.vin,
                caseNumber: caseLine.guaranteeCaseId,
                typeComponentId: caseLine.typeComponentId || "",
              });
            }
          }
        }
      }

      setReservations(items);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      const err = error as { response?: { data?: { message?: string } } };

      // Check if it's a permission error
      if (err.response?.data?.message?.includes("permission")) {
        toast.error(
          "Backend permission required: Parts coordinator needs access to case lines endpoint"
        );
      } else {
        toast.error("Failed to load component pickups");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [serviceCenterId]);

  const handlePickup = async (reservationId: string) => {
    if (!user?.userId) {
      toast.error("User ID not available");
      return;
    }

    try {
      setPickingUp(reservationId);

      // Call the pickup API with the current user's ID as the technician picking up
      await componentReservationService.pickupComponent(
        reservationId,
        user.userId
      );

      toast.success("Component picked up successfully!");

      // Refresh the list
      await fetchReservations();
    } catch (error) {
      console.error("Failed to pickup component:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to pickup component");
    } finally {
      setPickingUp(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Component Pickup List
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Reserved components ready for pickup
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No components reserved for pickup</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <motion.div
              key={reservation.reservationId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-gray-900">
                      {reservation.componentName}
                    </h3>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Component ID:</span>{" "}
                      {reservation.typeComponentId}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span>{" "}
                      {reservation.quantity}
                    </p>
                    <p>
                      <span className="font-medium">Case:</span>{" "}
                      {reservation.caseNumber || reservation.caseLineId}
                    </p>
                    {reservation.vehicleVin && (
                      <p>
                        <span className="font-medium">Vehicle VIN:</span>{" "}
                        {reservation.vehicleVin}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      Reserved:{" "}
                      {new Date(reservation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePickup(reservation.reservationId)}
                  disabled={pickingUp === reservation.reservationId}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pickingUp === reservation.reservationId ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {pickingUp === reservation.reservationId
                    ? "Picking up..."
                    : "Mark as Picked Up"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
