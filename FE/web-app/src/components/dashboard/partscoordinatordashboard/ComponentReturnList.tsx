"use client";

import { motion } from "framer-motion";
import { RotateCcw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import componentReservationService from "@/services/componentReservationService";

interface ComponentReturnListProps {
  serviceCenterId?: string;
}

interface ReturnItem {
  reservationId: string;
  componentName: string;
  serialNumber: string;
  vehicleVin: string;
  installedAt: string;
  caseLineId: string;
}

export function ComponentReturnList({
  serviceCenterId,
}: ComponentReturnListProps) {
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<{
    reservationId: string;
    componentName: string;
    newSerial: string;
  } | null>(null);
  const [oldSerialNumber, setOldSerialNumber] = useState("");

  const fetchItemsToReturn = async () => {
    try {
      setLoading(true);

      // Fetch reservations with INSTALLED status (components installed, ready to be returned)
      const response =
        await componentReservationService.getComponentReservations({
          status: "INSTALLED",
          limit: 100,
          sortBy: "updatedAt",
          sortOrder: "DESC",
        });

      const reservationsList = response.data.reservations || [];

      // Transform reservations into return items
      const returnItems: ReturnItem[] = reservationsList
        .filter((res) => res.installedAt) // Only show if actually installed
        .map((reservation) => ({
          reservationId: reservation.reservationId,
          componentName: reservation.component?.serialNumber || "Component",
          serialNumber: reservation.component?.serialNumber || "",
          vehicleVin: reservation.component?.vehicleVin || "Unknown",
          installedAt: reservation.installedAt || "",
          caseLineId: reservation.caselineId,
        }));

      setItems(returnItems);
    } catch (error) {
      console.error("Failed to fetch items to return:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to load components to return"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemsToReturn();
  }, [serviceCenterId]);

  const handleReturnClick = (item: ReturnItem) => {
    setSelectedReturn({
      reservationId: item.reservationId,
      componentName: item.componentName,
      newSerial: item.serialNumber,
    });
    setOldSerialNumber("");
  };

  const handleReturn = async () => {
    if (!selectedReturn || !oldSerialNumber.trim()) {
      toast.error("Please enter the old component serial number");
      return;
    }

    try {
      setReturning(selectedReturn.reservationId);

      await componentReservationService.returnComponent(
        selectedReturn.reservationId,
        {
          serialNumber: oldSerialNumber.trim(),
        }
      );

      toast.success("Old component returned successfully!");
      setSelectedReturn(null);
      setOldSerialNumber("");

      // Refresh the list
      await fetchItemsToReturn();
    } catch (error) {
      console.error("Failed to return component:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to return component");
    } finally {
      setReturning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Components to Return
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Installed components with old parts ready to be returned
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No components ready to return</p>
          <p className="text-xs text-gray-400 mt-1">
            Components will appear after installation
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.reservationId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium text-gray-900">
                      {item.componentName}
                    </h3>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Serial Number:</span>{" "}
                      {item.serialNumber}
                    </p>
                    <p>
                      <span className="font-medium">Vehicle VIN:</span>{" "}
                      {item.vehicleVin}
                    </p>
                    <p>
                      <span className="font-medium">Case Line:</span>{" "}
                      {item.caseLineId}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Installed: {new Date(item.installedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleReturnClick(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Return Old Part
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Return Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Return Old Component
            </h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="font-medium text-blue-900 mb-2">
                    📋 How to find the old component:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 text-xs">
                    <li>Ask the technician for the removed component</li>
                    <li>Check the physical label/marking on the old part</li>
                    <li>The serial number is usually printed or engraved</li>
                    <li>
                      Must be same type as new component:{" "}
                      <strong>{selectedReturn.componentName}</strong>
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <p className="font-medium mb-1">⚠️ Important:</p>
                  <p>
                    Enter the <strong>OLD</strong> component serial number being
                    returned, NOT the new one (
                    <code className="bg-yellow-100 px-1 rounded">
                      {selectedReturn.newSerial}
                    </code>
                    ) that was just installed.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Old Component Serial Number *
                </label>
                <input
                  type="text"
                  value={oldSerialNumber}
                  onChange={(e) =>
                    setOldSerialNumber(e.target.value.toUpperCase())
                  }
                  placeholder="Enter old component serial number (e.g., BMS-OLD-001)"
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  disabled={!!returning}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  The old component must currently be installed on the vehicle
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedReturn(null);
                    setOldSerialNumber("");
                  }}
                  disabled={!!returning}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturn}
                  disabled={!!returning || !oldSerialNumber.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {returning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Returning...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Return Component
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
