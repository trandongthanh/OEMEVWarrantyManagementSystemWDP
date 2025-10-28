"use client";

import { motion } from "framer-motion";
import { Package, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import componentReservationService from "@/services/componentReservationService";

interface ComponentPickupListProps {
  serviceCenterId?: string;
}

interface ReservationItem {
  reservationId: string;
  componentId: string;
  componentName: string;
  quantity: number;
  caseLineId: string;
  status: string;
  createdAt: string;
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
      // Mock data - replace with actual API call when backend ready
      // const response = await componentReservationService.getReservations();
      setReservations([]);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [serviceCenterId]);

  const handlePickup = async (reservationId: string) => {
    try {
      setPickingUp(reservationId);
      await componentReservationService.pickupComponent(reservationId);
      await fetchReservations();
    } catch (error) {
      console.error("Failed to pickup component:", error);
      alert("Failed to pickup component");
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
                      {reservation.componentId}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span>{" "}
                      {reservation.quantity}
                    </p>
                    <p>
                      <span className="font-medium">Case Line:</span>{" "}
                      {reservation.caseLineId}
                    </p>
                    <p className="text-gray-500">
                      Reserved:{" "}
                      {new Date(reservation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePickup(reservation.reservationId)}
                  disabled={pickingUp === reservation.reservationId}
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
