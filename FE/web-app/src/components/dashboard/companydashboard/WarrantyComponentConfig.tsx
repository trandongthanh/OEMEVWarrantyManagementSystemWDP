"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Clock,
  Gauge,
  Package,
  Car,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import warrantyComponentService, {
  type WarrantyComponent,
} from "@/services/warrantyComponentService";
import { Pagination } from "@/components/ui/Pagination";

export default function WarrantyComponentConfig() {
  const [components, setComponents] = useState<WarrantyComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleModel, setSelectedVehicleModel] =
    useState<string>("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComponent, setSelectedComponent] =
    useState<WarrantyComponent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Check URL parameters on mount to pre-filter by vehicle model
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleModelId = urlParams.get("vehicleModelId");
    if (vehicleModelId) {
      setSelectedVehicleModel(vehicleModelId);
    }
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const response = await warrantyComponentService.getWarrantyComponents({
        page: currentPage,
        limit: 10,
        vehicleModelId:
          selectedVehicleModel !== "all" ? selectedVehicleModel : undefined,
      });
      setComponents((response.data.items || []) as WarrantyComponent[]);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error("Error loading warranty components:", error);
      toast.error("Failed to load warranty components");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedVehicleModel]);

  const handleEdit = (component: WarrantyComponent) => {
    setSelectedComponent(component);
    setShowEditModal(true);
  };

  const handleDelete = (component: WarrantyComponent) => {
    setSelectedComponent(component);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedComponent) return;

    try {
      const id =
        selectedComponent.warrantyComponentId ||
        (selectedComponent as { id?: string }).id;
      if (!id) {
        toast.error("Invalid component ID");
        return;
      }
      await warrantyComponentService.deleteWarrantyComponent(id);
      toast.success("Warranty component deleted successfully");
      setShowDeleteModal(false);
      setSelectedComponent(null);
      loadComponents();
    } catch (error) {
      console.error("Error deleting warranty component:", error);
      toast.error("Failed to delete warranty component");
    }
  };

  const filteredComponents = components.filter((comp) => {
    const matchesSearch =
      comp.typeComponent?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comp.typeComponent?.sku
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comp.vehicleModel?.vehicleModelName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Get unique vehicle models for filter
  const uniqueVehicleModels = Array.from(
    new Map(
      components
        .filter((c) => c.vehicleModel)
        .map((c) => [c.vehicleModelId, c.vehicleModel])
    ).values()
  );

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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Warranty Component Configuration
                  </h1>
                </div>
                <p className="text-gray-600">
                  Manage warranty terms for components across vehicle models
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Component List */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Warranty Components ({components.length})
                    </h3>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by component name, SKU, or vehicle model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      />
                    </div>
                    <select
                      value={selectedVehicleModel}
                      onChange={(e) => {
                        setSelectedVehicleModel(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[250px] text-sm"
                    >
                      <option value="all">All Vehicle Models</option>
                      {uniqueVehicleModels.map((model) => (
                        <option
                          key={model?.vehicleModelId}
                          value={model?.vehicleModelId}
                        >
                          {model?.vehicleModelName} ({model?.makeBrand})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : filteredComponents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">
                        {searchQuery || selectedVehicleModel !== "all"
                          ? "No warranty components found"
                          : "No warranty components configured"}
                      </p>
                      <p className="text-sm mt-1">
                        {searchQuery || selectedVehicleModel !== "all"
                          ? "Try adjusting your filters"
                          : "Configure warranty components through Vehicle Management"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredComponents.map((component) => (
                        <motion.div
                          key={
                            component.warrantyComponentId ||
                            (component as { id?: string }).id
                          }
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Vehicle Model */}
                              <div className="flex items-center gap-2 mb-3">
                                <Car className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-gray-900">
                                    {component.vehicleModel?.vehicleModelName}
                                  </span>
                                  {component.vehicleModel?.makeBrand && (
                                    <span className="text-gray-500 text-sm ml-2">
                                      ({component.vehicleModel.makeBrand})
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Component Info */}
                              <div className="flex items-start gap-4 mb-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 truncate">
                                      {component.typeComponent?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                      <Hash className="w-3 h-3" />
                                      {component.typeComponent?.sku}
                                    </p>
                                  </div>
                                </div>

                                {/* Warranty Terms */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Package className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">
                                      Qty: {component.quantity}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                    <Clock className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                      {component.durationMonth} months
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                                    <Gauge className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-700">
                                      {component.mileageLimit.toLocaleString()}{" "}
                                      km
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(component)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit warranty terms"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(component)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete warranty component"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={10}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <EditWarrantyComponentModal
        isOpen={showEditModal}
        component={selectedComponent}
        onClose={() => {
          setShowEditModal(false);
          setSelectedComponent(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedComponent(null);
          loadComponents();
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedComponent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Confirm Deletion
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedComponent(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to remove the warranty configuration
                  for:
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <p className="font-semibold text-gray-900">
                    {selectedComponent.typeComponent?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    from{" "}
                    <span className="font-medium">
                      {selectedComponent.vehicleModel?.vehicleModelName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedComponent(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface EditWarrantyComponentModalProps {
  isOpen: boolean;
  component: WarrantyComponent | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EditWarrantyComponentModal({
  isOpen,
  component,
  onClose,
  onSuccess,
}: EditWarrantyComponentModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [durationMonth, setDurationMonth] = useState(12);
  const [mileageLimit, setMileageLimit] = useState(100000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (component) {
      setQuantity(component.quantity);
      setDurationMonth(component.durationMonth);
      setMileageLimit(component.mileageLimit);
    }
  }, [component]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!component) return;

    try {
      setLoading(true);
      const id =
        component.warrantyComponentId || (component as { id?: string }).id;
      if (!id) {
        toast.error("Invalid component ID");
        return;
      }
      await warrantyComponentService.updateWarrantyComponent(id, {
        quantity,
        durationMonth,
        mileageLimit,
      });
      toast.success("Warranty component updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating warranty component:", error);
      toast.error("Failed to update warranty component");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !component) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header - Fixed */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Warranty Terms
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Update warranty configuration
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Component Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {component.vehicleModel?.vehicleModelName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {component.vehicleModel?.makeBrand}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {component.typeComponent?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      SKU: {component.typeComponent?.sku}
                    </p>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Quantity
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration (Months)
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationMonth}
                    onChange={(e) =>
                      setDurationMonth(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      Mileage Limit (km)
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={mileageLimit}
                    onChange={(e) =>
                      setMileageLimit(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Warranty Terms"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
