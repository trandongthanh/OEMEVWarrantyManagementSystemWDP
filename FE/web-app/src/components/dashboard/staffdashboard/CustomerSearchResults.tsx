"use client";

import { Customer } from "@/services";
import { Car } from "lucide-react";

interface CustomerSearchResultsProps {
  searchResult: Customer | null;
  onNewClaimClick: () => void;
}

export function CustomerSearchResults({
  searchResult,
  onNewClaimClick,
}: CustomerSearchResultsProps) {
  if (!searchResult) return null;

  const vehicles = searchResult.vehicles || [];

  return (
    <div className="p-4 max-h-96 overflow-y-auto">
      {/* Customer Info */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Customer Information
        </h4>
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {searchResult.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-gray-900">
              {searchResult.fullName}
            </h5>
            <p className="text-sm text-gray-600">{searchResult.email}</p>
            <p className="text-sm text-gray-600">{searchResult.phone}</p>
            {searchResult.address && (
              <p className="text-xs text-gray-500 mt-1">
                {searchResult.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Owned Vehicles */}
      {vehicles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Registered Vehicles ({vehicles.length})
          </h4>
          <div className="space-y-2">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.vin}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 text-sm">
                    {vehicle.vehicleModel?.modelName || "Unknown Model"}
                  </h5>
                  <p className="text-xs text-gray-600">VIN: {vehicle.vin}</p>
                  {vehicle.licensePlate && (
                    <p className="text-xs text-gray-600">
                      Plate: {vehicle.licensePlate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Vehicles Message */}
      {vehicles.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No vehicles registered for this customer yet.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onNewClaimClick}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          Create New Claim
        </button>
      </div>
    </div>
  );
}
