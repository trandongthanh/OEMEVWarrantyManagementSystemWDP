"use client";

import { motion } from "framer-motion";
import { Package, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import componentReservationService from "@/services/componentReservationService";
import { useAuth } from "@/hooks/useAuth";
import { usePolling } from "@/hooks/usePolling";

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

  // Real-time polling for pickup list (critical - 15s interval)
  const { isPolling } = usePolling(
    async () => {
      const response =
        await componentReservationService.getComponentReservations({
          status: "RESERVED",
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "DESC",
        });

      const reservationsList = response.data.reservations || [];
      const items: ReservationItem[] = reservationsList.map((reservation) => ({
        caseLineId: reservation.caselineId,
        reservationId: reservation.reservationId,
        componentName: reservation.component?.serialNumber || "Component",
        componentId: reservation.componentId,
        quantity: reservation.quantityReserved,
        status: reservation.status,
        createdAt: reservation.createdAt,
        vehicleVin: reservation.caseLine?.id || "",
        caseNumber: reservation.caselineId,
        typeComponentId: reservation.componentId,
      }));

      setReservations(items);
      return items;
    },
    {
      interval: 120000, // Poll every 2 minutes
      enabled: !loading && !pickingUp,
      onError: (err) => {
        console.error("❌ Pickup list polling error:", err);
      },
    }
  );

  const fetchReservations = async () => {
    try {
      setLoading(true);

      // Use dedicated component reservations endpoint
      // This endpoint is specifically authorized for parts_coordinator_service_center role
      const response =
        await componentReservationService.getComponentReservations({
          status: "RESERVED",
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "DESC",
        });

      const reservationsList = response.data.reservations || [];

      // Transform reservations into pickup items
      const items: ReservationItem[] = reservationsList.map((reservation) => ({
        caseLineId: reservation.caselineId,
        reservationId: reservation.reservationId,
        componentName: reservation.component?.serialNumber || "Component",
        componentId: reservation.componentId,
        quantity: reservation.quantityReserved,
        status: reservation.status,
        createdAt: reservation.createdAt,
        vehicleVin: reservation.caseLine?.id || "",
        caseNumber: reservation.caselineId,
        typeComponentId: reservation.componentId,
      }));

      setReservations(items);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to load component pickups"
      );
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Component Pickups
                </h1>
              </div>
              {isPolling && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700">
                    Live Updates
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-600">
              Reserved components ready for pickup
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Package className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">No components reserved for pickup</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-3">
                {reservations.map((reservation) => (
                  <motion.div
                    key={reservation.reservationId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {reservation.componentName}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-900">
                              Component ID:
                            </span>{" "}
                            {reservation.typeComponentId}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-900">
                              Quantity:
                            </span>{" "}
                            <span className="font-semibold text-blue-600">
                              {reservation.quantity}
                            </span>
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-900">
                              Case:
                            </span>{" "}
                            {reservation.caseNumber || reservation.caseLineId}
                          </p>
                          {reservation.vehicleVin && (
                            <p className="text-gray-700">
                              <span className="font-medium text-gray-900">
                                Vehicle VIN:
                              </span>{" "}
                              {reservation.vehicleVin}
                            </p>
                          )}
                          <p className="text-gray-500 text-xs col-span-2 mt-1">
                            Reserved:{" "}
                            {new Date(reservation.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePickup(reservation.reservationId)}
                        disabled={pickingUp === reservation.reservationId}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shrink-0 h-fit"
                      >
                        {pickingUp === reservation.reservationId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Picking up...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Mark as Picked Up
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
