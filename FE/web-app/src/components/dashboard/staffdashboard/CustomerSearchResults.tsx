"use client";

import { Customer } from "@/services";

interface CustomerSearchResultsProps {
  searchResult: Customer | null;
  onNewClaimClick: () => void;
}

export function CustomerSearchResults({
  searchResult,
  onNewClaimClick,
}: CustomerSearchResultsProps) {
  if (!searchResult) return null;

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
