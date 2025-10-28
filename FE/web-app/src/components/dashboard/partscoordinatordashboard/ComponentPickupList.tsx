"use client";

import { motion } from "framer-motion";
import { Package, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ComponentPickupListProps {
  serviceCenterId?: string;
}

interface ReservationItem {
  caseLineId: string;
  componentName: string;
  quantity: number;
  status: string;
  createdAt: string;
  vehicleInfo?: string;
  caseNumber?: string;
  typeComponentId?: string;
}

export function ComponentPickupList({
  serviceCenterId,
}: ComponentPickupListProps) {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);

      // Note: Parts coordinator role currently doesn't have permission to access case lines API
      // Backend returns 403 Forbidden - only technicians, staff, and managers can access
      // TODO: Backend needs to add parts_coordinator_service_center to case lines GET endpoint authorization
      // For now, show empty list until backend permissions are updated

      setReservations([]);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      toast.error("Unable to load component pickups - permission required");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [serviceCenterId]);

  const handlePickup = async (caseLineId: string) => {
    try {
      setPickingUp(caseLineId);

      // Note: Pickup functionality requires backend permissions to be updated
      // Parts coordinator role needs access to case lines API to fetch reservation data
      toast.error(
        "Pickup feature unavailable - waiting for backend permissions update"
      );

      // TODO: When backend adds parts_coordinator_service_center to case lines endpoint:
      // 1. Fetch case line to get component reservation ID
      // 2. Call componentReservationService.pickupComponent(reservationId)
      // 3. Refresh the list
    } catch (error) {
      console.error("Failed to pickup component:", error);
      toast.error("Failed to pickup component");
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
              key={reservation.caseLineId}
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
                    {reservation.vehicleInfo && (
                      <p>
                        <span className="font-medium">Vehicle:</span>{" "}
                        {reservation.vehicleInfo}
                      </p>
                    )}
                    <p className="text-gray-500">
                      Reserved:{" "}
                      {new Date(reservation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePickup(reservation.caseLineId)}
                  disabled={pickingUp === reservation.caseLineId}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Picked Up
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
