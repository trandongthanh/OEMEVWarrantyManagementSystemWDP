"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import componentReservationService, {
  ComponentReservation,
  GetComponentReservationsParams,
} from "@/services/componentReservationService";
import {
  Loader2,
  Package,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { usePolling } from "@/hooks/usePolling";

export default function ComponentReservationQueue() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ComponentReservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // Real-time polling for reservations (critical - 15s interval)
  const { isPolling } = usePolling(
    async () => {
      const params: GetComponentReservationsParams = {
        page: currentPage,
        limit: 20,
      };

      if (
        statusFilter &&
        (statusFilter === "RESERVED" ||
          statusFilter === "PICKED_UP" ||
          statusFilter === "INSTALLED" ||
          statusFilter === "CANCELLED")
      ) {
        params.status = statusFilter as
          | "RESERVED"
          | "PICKED_UP"
          | "INSTALLED"
          | "CANCELLED";
      }

      const result = await componentReservationService.getComponentReservations(
        params
      );

      setReservations(result.data.reservations || []);
      if (result.data.pagination) {
        setPagination({
          total: result.data.pagination.total,
          page: result.data.pagination.page,
          limit: result.data.pagination.limit,
          totalPages: result.data.pagination.totalPages,
        });
      }
      return result.data.reservations;
    },
    {
      interval: 120000, // Poll every 2 minutes
      enabled: !loading,
      onError: (err) => {
        console.error("❌ Reservation polling error:", err);
      },
    }
  );

  useEffect(() => {
    loadReservations(1, statusFilter);
  }, [statusFilter]);

  const loadReservations = async (page: number, status?: string) => {
    try {
      setLoading(true);

      const params: GetComponentReservationsParams = {
        page,
        limit: 20,
      };

      if (
        status &&
        (status === "RESERVED" ||
          status === "PICKED_UP" ||
          status === "INSTALLED" ||
          status === "CANCELLED")
      ) {
        params.status = status as
          | "RESERVED"
          | "PICKED_UP"
          | "INSTALLED"
          | "CANCELLED";
      }

      const result = await componentReservationService.getComponentReservations(
        params
      );

      setReservations(result.data.reservations || []);
      if (result.data.pagination) {
        setPagination({
          total: result.data.pagination.total,
          page: result.data.pagination.page,
          limit: result.data.pagination.limit,
          totalPages: result.data.pagination.totalPages,
        });
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (reservationId: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    // Find the reservation to get technician ID
    const reservation = reservations.find(
      (r) => r.reservationId === reservationId
    );

    if (!reservation) {
      setErrorMessage("Reservation not found");
      return;
    }

    // Get technician ID from the case line's repair technician
    const techId = reservation.caseLine?.repairTechId;

    if (!techId) {
      setErrorMessage(
        "No technician assigned to this repair. Please assign a technician first in Case Line Operations."
      );
      return;
    }

    try {
      await componentReservationService.pickupComponent(reservationId, techId);
      setSuccessMessage(
        `Component picked up successfully by ${
          reservation.caseLine?.repairTechnician?.name || "technician"
        }`
      );
      setCurrentPage(pagination.page); // Keep current page
      loadReservations(pagination.page, statusFilter);
    } catch (err: unknown) {
      console.error("Error picking up component:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        error?.response?.data?.message || "Failed to pick up component"
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      RESERVED: "bg-blue-100 text-blue-700",
      PICKED_UP: "bg-yellow-100 text-yellow-700",
      INSTALLED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          {/* HEADER */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Component Reservation Queue
                  </h1>
                </div>
                <p className="text-gray-600">
                  Manage component pickups and installations
                </p>
              </div>

              {/* STATUS FILTER & LIVE INDICATOR */}
              <div className="flex items-center gap-3">
                {isPolling && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">
                      Live Updates
                    </span>
                  </div>
                )}
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  className="border border-gray-300 text-black rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="PICKED_UP">Picked Up</option>
                  <option value="INSTALLED">Installed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* ERROR/SUCCESS MESSAGES */}
          {errorMessage && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-green-400 hover:text-green-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Package className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">No reservations found</p>
              <p className="text-sm mt-1 text-gray-400">
                {statusFilter
                  ? `No reservations with status "${statusFilter}"`
                  : "No active component reservations"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.reservationId}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          {getStatusBadge(reservation.status)}
                          {reservation.status === "RESERVED" && (
                            <span className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertCircle className="w-4 h-4" />
                              Ready for Pickup
                            </span>
                          )}
                          {reservation.installedAt && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              Installed
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {/* Component Info */}
                          {reservation.component && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Component
                              </p>
                              <p className="font-medium text-gray-900">
                                Serial: {reservation.component.serialNumber}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {reservation.component.status}
                              </p>
                            </div>
                          )}

                          {/* Warehouse */}
                          {reservation.warehouse && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Warehouse
                              </p>
                              <p className="text-sm text-gray-900">
                                {reservation.warehouse.warehouseName}
                              </p>
                            </div>
                          )}

                          {/* Serial Number */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Serial Number
                            </p>
                            <p className="text-sm text-gray-900 font-mono font-semibold">
                              {reservation.component?.serialNumber || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Pickup Info */}
                        {reservation.pickedUpAt && (
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                            <p className="text-xs font-medium text-yellow-700 mb-1">
                              Picked Up
                            </p>
                            <p className="text-sm text-yellow-900">
                              {new Date(
                                reservation.pickedUpAt
                              ).toLocaleString()}
                              {reservation.pickedUpByTech && (
                                <span className="block mt-1">
                                  by {reservation.pickedUpByTech.name}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Installation Info */}
                        {reservation.installedAt && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs font-medium text-green-700 mb-1">
                              Installed
                            </p>
                            <p className="text-sm text-green-900">
                              {new Date(
                                reservation.installedAt
                              ).toLocaleString()}
                              {reservation.component?.vehicleVin &&
                                ` on VIN: ${reservation.component.vehicleVin}`}
                            </p>
                            {reservation.oldComponentSerial && (
                              <p className="text-xs text-green-700 mt-1">
                                Replaced: {reservation.oldComponentSerial}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Case Line Info */}
                        {reservation.caseLine && (
                          <div className="mt-3 text-xs text-gray-500">
                            Case Line: {reservation.caseLine.id} | Status:{" "}
                            {reservation.caseLine.status}
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="ml-4">
                        {reservation.status === "RESERVED" && (
                          <button
                            onClick={() =>
                              handlePickup(reservation.reservationId)
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Picked Up
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        loadReservations(pagination.page - 1, statusFilter)
                      }
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        loadReservations(pagination.page + 1, statusFilter)
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
