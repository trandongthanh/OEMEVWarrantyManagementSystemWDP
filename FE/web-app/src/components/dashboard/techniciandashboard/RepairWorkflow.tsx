"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Wrench,
  CheckCircle,
  X,
  Eye,
  AlertCircle,
  Search,
  Filter,
  Warehouse,
  MapPin,
} from "lucide-react";
import caseLineService, { CaseLine } from "@/services/caseLineService";
import componentReservationService, {
  ComponentReservation,
} from "@/services/componentReservationService";
import {
  getVehicleComponents,
  VehicleComponent,
} from "@/services/vehicleService";
import { toast } from "sonner";
import { usePolling } from "@/hooks/usePolling";
import { getCurrentUser } from "@/services/authService";

interface ComponentWithReservation extends CaseLine {
  pickedUpReservations?: Array<{
    reservationId: string;
    status: string;
    component?: {
      serialNumber: string;
      componentId: string;
      warehouseId?: string;
      status?: string;
      warehouse?: {
        warehouseId: string;
        name: string;
        address?: string;
      };
      transferHistory?: Array<{
        requestId: string;
        componentId: string;
        request?: {
          id: string;
          sourceWarehouseId: string;
          requestingWarehouseId: string;
          shippedAt: string;
          receivedAt: string;
          status: string;
          sourceWarehouse?: {
            warehouseId: string;
            name: string;
            vehicleCompanyId?: string;
          };
          requestingWarehouse?: {
            warehouseId: string;
            name: string;
            serviceCenterId?: string;
            address?: string;
          };
        };
      }>;
    };
  }>;
}

type ViewMode = "pickup" | "install" | "complete";

export function RepairWorkflow() {
  const [activeView, setActiveView] = useState<ViewMode>("pickup");
  const [componentsToPickup, setComponentsToPickup] = useState<
    ComponentWithReservation[]
  >([]);
  const [componentsToInstall, setComponentsToInstall] = useState<
    ComponentWithReservation[]
  >([]);
  const [repairsToComplete, setRepairsToComplete] = useState<CaseLine[]>([]);
  const [allCaseLines, setAllCaseLines] = useState<CaseLine[]>([]); // Store all fetched caselines
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<CaseLine | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  // Image upload for repair completion
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedCaseLineForCompletion, setSelectedCaseLineForCompletion] =
    useState<CaseLine | null>(null);
  const [installationImages, setInstallationImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Old component serial number for quantity > 1 installations
  const [showOldSerialModal, setShowOldSerialModal] = useState(false);
  const [oldComponentSerial, setOldComponentSerial] = useState("");
  const [pendingInstallReservation, setPendingInstallReservation] = useState<{
    reservationId: string;
    component: ComponentWithReservation;
  } | null>(null);
  const [vehicleComponents, setVehicleComponents] = useState<
    Array<{
      componentId: string;
      serialNumber: string;
      typeComponentId?: string;
      status: string;
      typeComponent?: {
        typeComponentId: string;
        name: string;
      };
    }>
  >([]);
  const [loadingVehicleComponents, setLoadingVehicleComponents] =
    useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Status filters - default to show all statuses for complete history view
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "READY_FOR_REPAIR",
    "IN_REPAIR",
    "PARTS_PENDING",
    "PARTS_AVAILABLE",
    "COMPLETED",
    "CLOSED",
  ]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const availableStatuses = [
    { value: "READY_FOR_REPAIR", label: "Ready for Repair", color: "blue" },
    { value: "IN_REPAIR", label: "In Repair", color: "purple" },
    { value: "PARTS_PENDING", label: "Parts Pending", color: "yellow" },
    { value: "PARTS_AVAILABLE", label: "Parts Available", color: "green" },
    { value: "COMPLETED", label: "Completed", color: "gray" },
    { value: "CLOSED", label: "Closed", color: "gray" },
  ];

  const loadComponentsToInstall = async () => {
    try {
      const currentUser = getCurrentUser();

      // Fetch ALL caselines for the repair tech without status filter
      const response = await caseLineService.getCaseLinesList({
        repairTechId: currentUser?.userId,
        limit: 100, // Increased limit to get more records
      });

      const fetchedCaseLines = response.data.caseLines || [];
      setAllCaseLines(fetchedCaseLines);

      // Apply frontend status filtering - show ALL caselines with selected statuses
      const filteredByStatus = fetchedCaseLines.filter((cl: CaseLine) =>
        selectedStatuses.includes(cl.status || "")
      );

      // For install view: show all filtered items (no reservation status filtering)
      // This allows viewing complete history of all repairs
      setComponentsToInstall(filteredByStatus as ComponentWithReservation[]);
    } catch (error) {
      console.error("Failed to load components to install:", error);
    }
  };

  const loadComponentsToPickup = async () => {
    try {
      const currentUser = getCurrentUser();
      const response =
        await componentReservationService.getComponentReservations({
          status: "RESERVED",
          repairTechId: currentUser?.userId,
          limit: 100,
        });

      // Group reservations by case line
      const caseLineMap = new Map<string, ComponentWithReservation>();

      response.data.reservations.forEach(
        (reservation: ComponentReservation) => {
          const caseLineId = reservation.caseLine?.id;
          if (!caseLineId) return;

          if (!caseLineMap.has(caseLineId)) {
            caseLineMap.set(caseLineId, {
              ...reservation.caseLine,
              reservations: [],
            } as ComponentWithReservation);
          }

          caseLineMap.get(caseLineId)?.reservations?.push(reservation as never);
        }
      );

      setComponentsToPickup(Array.from(caseLineMap.values()));
    } catch (error) {
      console.error("Failed to load components to pickup:", error);
    }
  };

  const loadRepairsToComplete = async () => {
    try {
      // Use already fetched caselines and apply frontend status filtering
      const filteredByStatus = allCaseLines.filter((cl: CaseLine) =>
        selectedStatuses.includes(cl.status || "")
      );

      // Show all filtered caselines for complete view (complete history)
      setRepairsToComplete(filteredByStatus);
    } catch (error) {
      console.error("Failed to load repairs to complete:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadComponentsToPickup(),
        loadComponentsToInstall(),
        loadRepairsToComplete(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  usePolling(
    async () => {
      await Promise.all([
        loadComponentsToPickup(),
        loadComponentsToInstall(),
        loadRepairsToComplete(),
      ]);
    },
    {
      interval: 120000,
      enabled: !loading && !showDetailModal,
      onError: (err) => console.error("❌ Repair workflow polling error:", err),
    }
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload data when status filters change
  useEffect(() => {
    if (selectedStatuses.length > 0 && allCaseLines.length > 0) {
      // Re-apply filtering on already loaded data
      const filteredByStatus = allCaseLines.filter((cl: CaseLine) =>
        selectedStatuses.includes(cl.status || "")
      );

      // Show all filtered caselines in both views (complete history)
      setComponentsToInstall(filteredByStatus as ComponentWithReservation[]);
      setRepairsToComplete(filteredByStatus);
    }
  }, [selectedStatuses, allCaseLines]);

  const handleInstall = async (component: ComponentWithReservation) => {
    const reservation = component.reservations?.find(
      (res) => res.status === "PICKED_UP"
    );

    if (!reservation || !reservation.reservationId) {
      toast.error("No reservation found for this component");
      return;
    }

    // Check if warranty component has quantity > 1 (multiple components of same type)
    // If quantity > 1, we need to collect the old component serial number
    if (requiresOldSerial(component)) {
      // Show modal to collect old component serial
      setPendingInstallReservation({
        reservationId: reservation.reservationId,
        component,
      });
      setOldComponentSerial("");
      setShowManualEntry(false);
      setVehicleComponents([]);

      // Fetch vehicle's installed components if VIN is available
      const vin = component.guaranteeCase?.vehicleProcessingRecord?.vin;
      const typeComponentId = component.typeComponentId;
      if (vin && typeComponentId) {
        fetchVehicleComponents(vin, typeComponentId);
      }

      setShowOldSerialModal(true);
      return;
    }

    // Proceed with installation without old serial
    await performInstall(reservation.reservationId);
  };

  const performInstall = async (reservationId: string, oldSerial?: string) => {
    setProcessingItem(reservationId);

    try {
      await componentReservationService.installComponent(
        reservationId,
        oldSerial
      );
      toast.success("Component installed successfully!");
      await loadData();

      // Close modal if open
      setShowOldSerialModal(false);
      setOldComponentSerial("");
      setPendingInstallReservation(null);
    } catch (error: unknown) {
      console.error("Failed to install component:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to install component");
    } finally {
      setProcessingItem(null);
    }
  };

  const confirmInstallWithOldSerial = async () => {
    if (!oldComponentSerial.trim()) {
      toast.error("Please enter the old component serial number");
      return;
    }

    if (!pendingInstallReservation) {
      toast.error("No pending installation found");
      return;
    }

    await performInstall(
      pendingInstallReservation.reservationId,
      oldComponentSerial.trim()
    );
  };

  // Helper function to check if component requires old serial number
  const requiresOldSerial = (component: ComponentWithReservation): boolean => {
    const componentName = component.typeComponent?.name?.toLowerCase() || "";
    const hasNumbersInName = component.typeComponent?.name
      ? /\d+/.test(component.typeComponent.name)
      : false;
    return (
      componentName.includes("tire") ||
      componentName.includes("wheel") ||
      componentName.includes("seat") ||
      componentName.includes("battery") ||
      hasNumbersInName
    );
  };

  // Fetch vehicle's installed components of the same type
  const fetchVehicleComponents = async (
    vin: string,
    typeComponentId: string
  ) => {
    setLoadingVehicleComponents(true);
    try {
      // Fetch components installed on this vehicle using the vehicle endpoint
      const response = await getVehicleComponents(vin, "INSTALLED");
      // Filter by typeComponentId to get only the same component type
      const filteredComponents = (response.data || []).filter(
        (comp: VehicleComponent) =>
          comp.typeComponent?.typeComponentId === typeComponentId
      );
      setVehicleComponents(filteredComponents);
    } catch (error) {
      console.error("Error fetching vehicle components:", error);
      setVehicleComponents([]);
    } finally {
      setLoadingVehicleComponents(false);
    }
  };

  const handleMarkComplete = async (caseLine: CaseLine) => {
    // Open image upload modal instead of directly completing
    setSelectedCaseLineForCompletion(caseLine);
    setShowImageUploadModal(true);
  };

  const confirmMarkComplete = async () => {
    if (!selectedCaseLineForCompletion) return;

    // Validate that at least one image is uploaded
    if (installationImages.length === 0) {
      toast.error(
        "Please upload at least one installation image before completing the repair"
      );
      return;
    }

    const caseLineId =
      selectedCaseLineForCompletion.id ||
      selectedCaseLineForCompletion.caseLineId ||
      "";
    setProcessingItem(caseLineId);
    setUploadingImages(true);

    try {
      const imageUrls: string[] = [];

      // Upload images to Cloudinary
      if (installationImages.length > 0) {
        toast.info(`Uploading ${installationImages.length} image(s)...`);

        for (const imageFile of installationImages) {
          const formData = new FormData();
          formData.append("file", imageFile);

          try {
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to upload image");
            }

            const data = await response.json();
            imageUrls.push(data.url);
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            toast.error("Failed to upload one or more images");
            setUploadingImages(false);
            setProcessingItem(null);
            return;
          }
        }
      }

      // Mark repair as complete with image URLs
      await caseLineService.markRepairComplete(caseLineId, imageUrls);

      toast.success(
        `Repair marked as complete with ${imageUrls.length} installation image(s)!`
      );

      // Reset state
      setInstallationImages([]);
      setSelectedCaseLineForCompletion(null);
      setShowImageUploadModal(false);

      await loadData();
    } catch (error: unknown) {
      console.error("Failed to mark repair complete:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to mark repair complete"
      );
    } finally {
      setProcessingItem(null);
      setUploadingImages(false);
    }
  };

  const showDetails = (data: CaseLine) => {
    setSelectedItem(data);
    setShowDetailModal(true);
  };

  const filteredPickupComponents = componentsToPickup.filter((comp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comp.typeComponent?.name?.toLowerCase().includes(query) ||
      comp.guaranteeCaseId?.toLowerCase().includes(query) ||
      comp.guaranteeCase?.vehicleProcessingRecord?.vin
        ?.toLowerCase()
        .includes(query)
    );
  });

  const filteredInstallComponents = componentsToInstall
    .filter((comp) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        comp.typeComponent?.name?.toLowerCase().includes(query) ||
        comp.guaranteeCaseId?.toLowerCase().includes(query) ||
        comp.guaranteeCase?.vehicleProcessingRecord?.vin
          ?.toLowerCase()
          .includes(query)
      );
    })
    .sort((a, b) => {
      // Sort by status priority: IN_REPAIR > PARTS_AVAILABLE > others
      const statusPriority: Record<string, number> = {
        IN_REPAIR: 1,
        PARTS_AVAILABLE: 2,
        READY_FOR_REPAIR: 3,
        PARTS_PENDING: 4,
        COMPLETED: 5,
        CLOSED: 6,
      };
      const priorityA = statusPriority[a.status || ""] || 999;
      const priorityB = statusPriority[b.status || ""] || 999;
      return priorityA - priorityB;
    });

  const filteredCompleteRepairs = repairsToComplete
    .filter((repair) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        repair.typeComponent?.name?.toLowerCase().includes(query) ||
        repair.guaranteeCaseId?.toLowerCase().includes(query) ||
        repair.guaranteeCase?.vehicleProcessingRecord?.vin
          ?.toLowerCase()
          .includes(query)
      );
    })
    .sort((a, b) => {
      // Sort by status priority: IN_REPAIR > PARTS_AVAILABLE > others
      const statusPriority: Record<string, number> = {
        IN_REPAIR: 1,
        PARTS_AVAILABLE: 2,
        READY_FOR_REPAIR: 3,
        PARTS_PENDING: 4,
        COMPLETED: 5,
        CLOSED: 6,
      };
      const priorityA = statusPriority[a.status || ""] || 999;
      const priorityB = statusPriority[b.status || ""] || 999;
      return priorityA - priorityB;
    });

  const currentList =
    activeView === "pickup"
      ? filteredPickupComponents
      : activeView === "install"
      ? filteredInstallComponents
      : filteredCompleteRepairs;

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Repair Workflow
            </h2>
            <p className="text-gray-600 mt-1">
              Install components and complete repairs
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Tabs & Search */}
            <div className="p-6 border-b border-gray-200">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveView("pickup")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeView === "pickup"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Warehouse className="w-4 h-4" />
                  Pickup Required
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeView === "pickup"
                        ? "bg-orange-700 text-orange-100"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {componentsToPickup.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveView("install")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeView === "install"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Install Components
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeView === "install"
                        ? "bg-purple-700 text-purple-100"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {componentsToInstall.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveView("complete")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeView === "complete"
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Mark Repair Complete
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeView === "complete"
                        ? "bg-green-700 text-green-100"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {repairsToComplete.length}
                  </span>
                </button>
              </div>

              {/* Active Status Filters Summary */}
              {selectedStatuses.length > 0 &&
                selectedStatuses.length < availableStatuses.length && (
                  <div className="flex items-center gap-2 flex-wrap mb-4 pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">
                      Showing:
                    </span>
                    {selectedStatuses.map((statusValue) => {
                      const statusConfig = availableStatuses.find(
                        (s) => s.value === statusValue
                      );
                      if (!statusConfig) return null;

                      return (
                        <span
                          key={statusValue}
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            statusConfig.color === "blue"
                              ? "bg-blue-100 text-blue-700"
                              : statusConfig.color === "purple"
                              ? "bg-purple-100 text-purple-700"
                              : statusConfig.color === "yellow"
                              ? "bg-yellow-100 text-yellow-700"
                              : statusConfig.color === "green"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusConfig.label}
                        </span>
                      );
                    })}
                  </div>
                )}

              {/* Search Bar */}
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Search & Filter</h3>
              </div>

              {/* Status Filter */}
              <div className="mb-3 relative">
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 font-medium"
                >
                  <Filter className="w-4 h-4" />
                  Status Filter
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {selectedStatuses.length}
                  </span>
                </button>

                {/* Status Filter Dropdown */}
                <AnimatePresence>
                  {showStatusFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          Filter by Status
                        </h4>
                        <button
                          onClick={() => setShowStatusFilter(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {availableStatuses.map((status) => {
                          const isSelected = selectedStatuses.includes(
                            status.value
                          );
                          const statusColorMap: Record<
                            string,
                            { bg: string; text: string; border: string }
                          > = {
                            blue: {
                              bg: "bg-blue-50",
                              text: "text-blue-700",
                              border: "border-blue-300",
                            },
                            purple: {
                              bg: "bg-purple-50",
                              text: "text-purple-700",
                              border: "border-purple-300",
                            },
                            yellow: {
                              bg: "bg-yellow-50",
                              text: "text-yellow-700",
                              border: "border-yellow-300",
                            },
                            green: {
                              bg: "bg-green-50",
                              text: "text-green-700",
                              border: "border-green-300",
                            },
                            gray: {
                              bg: "bg-gray-50",
                              text: "text-gray-700",
                              border: "border-gray-300",
                            },
                          };
                          const colors =
                            statusColorMap[status.color] || statusColorMap.gray;

                          return (
                            <button
                              key={status.value}
                              onClick={() => {
                                if (isSelected) {
                                  // Don't allow deselecting if it's the only one
                                  if (selectedStatuses.length > 1) {
                                    setSelectedStatuses(
                                      selectedStatuses.filter(
                                        (s) => s !== status.value
                                      )
                                    );
                                  }
                                } else {
                                  setSelectedStatuses([
                                    ...selectedStatuses,
                                    status.value,
                                  ]);
                                }
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? `${colors.bg} ${colors.border}`
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? `${colors.border} ${colors.bg}`
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle
                                    className={`w-4 h-4 ${colors.text}`}
                                  />
                                )}
                              </div>
                              <span
                                className={`font-medium ${
                                  isSelected ? colors.text : "text-gray-700"
                                }`}
                              >
                                {status.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedStatuses(
                              availableStatuses.map((s) => s.value)
                            );
                          }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStatuses(["IN_REPAIR"]);
                          }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by component, case ID, or VIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-colors text-gray-900"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="divide-y divide-gray-200">
              {currentList.length === 0 ? (
                <div className="p-12 text-center">
                  {activeView === "pickup" ? (
                    <>
                      <Warehouse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Components to Pickup
                      </h3>
                      <p className="text-gray-500">
                        Components requiring pickup will appear here
                      </p>
                    </>
                  ) : activeView === "install" ? (
                    <>
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Components to Install
                      </h3>
                      <p className="text-gray-500">
                        Components will appear here after you pick them up from
                        the warehouse
                      </p>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Repairs to Complete
                      </h3>
                      <p className="text-gray-500">
                        Repairs will appear here after components are installed
                      </p>
                    </>
                  )}
                </div>
              ) : (
                currentList.map((item) => {
                  const itemId = item.id || item.caseLineId || "";
                  const isProcessing = processingItem === itemId;
                  const pickedUpReservation =
                    activeView === "install"
                      ? (item as ComponentWithReservation).reservations?.find(
                          (res) =>
                            res.status === "PICKED_UP" ||
                            (res.status === "INSTALLED" &&
                              res.component?.status !== "INSTALLED" &&
                              res.component?.status !== "REMOVED")
                        )
                      : null;

                  const reservedReservation =
                    activeView === "pickup"
                      ? (item as ComponentWithReservation).reservations?.find(
                          (res) => res.status === "RESERVED"
                        )
                      : null;

                  // Check if this case line has multiple reservations (quantity > 1)
                  const hasMultipleReservations =
                    activeView === "install" &&
                    item.quantity &&
                    item.quantity > 1;
                  const installedReservationsCount =
                    (item as ComponentWithReservation).reservations?.filter(
                      (r) =>
                        r.status === "INSTALLED" &&
                        r.component?.status === "INSTALLED"
                    ).length || 0;

                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 flex items-start justify-between gap-6">
                          {/* Left: Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg flex-shrink-0 ${
                                  activeView === "pickup"
                                    ? "bg-orange-100"
                                    : activeView === "install"
                                    ? "bg-purple-100"
                                    : "bg-green-100"
                                }`}
                              >
                                {activeView === "pickup" ? (
                                  <Warehouse className="w-5 h-5 text-orange-600" />
                                ) : activeView === "install" ? (
                                  <Package className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <Wrench className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-gray-900">
                                    {item.typeComponent?.name || "Component"}
                                  </h3>

                                  {/* Status Badge */}
                                  {item.status && (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        item.status === "READY_FOR_REPAIR"
                                          ? "bg-blue-100 text-blue-700"
                                          : item.status === "IN_REPAIR"
                                          ? "bg-purple-100 text-purple-700"
                                          : item.status === "PARTS_PENDING"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : item.status === "PARTS_AVAILABLE"
                                          ? "bg-green-100 text-green-700"
                                          : item.status === "COMPLETED"
                                          ? "bg-gray-100 text-gray-700"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {item.status.replace(/_/g, " ")}
                                    </span>
                                  )}

                                  {hasMultipleReservations && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                                      <AlertCircle className="w-3 h-3" />
                                      {installedReservationsCount > 0
                                        ? `${installedReservationsCount}/${item.quantity} installed`
                                        : "Only 1 can be installed"}
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">
                                      Case ID:
                                    </span>{" "}
                                    {item.guaranteeCaseId || "N/A"}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Quantity:
                                    </span>{" "}
                                    {item.quantity || 1}
                                  </div>

                                  {activeView === "pickup" &&
                                    reservedReservation && (
                                      <>
                                        {reservedReservation.component
                                          ?.serialNumber && (
                                          <div className="col-span-2">
                                            <span className="font-medium">
                                              Serial Number:
                                            </span>{" "}
                                            <span className="font-mono">
                                              {
                                                reservedReservation.component
                                                  .serialNumber
                                              }
                                            </span>
                                          </div>
                                        )}
                                        {(() => {
                                          // Try to get warehouse from transfer request or direct warehouse
                                          const transferRequest =
                                            reservedReservation.component
                                              ?.transferHistory?.[0]?.request;
                                          const warehouse =
                                            transferRequest?.requestingWarehouse ||
                                            reservedReservation.component
                                              ?.warehouse;

                                          if (warehouse) {
                                            return (
                                              <div className="col-span-2">
                                                <div className="inline-flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100 max-w-fit">
                                                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-orange-900 mb-1">
                                                      📍 Pickup Location
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                      {warehouse.name}
                                                    </p>
                                                    {warehouse.address && (
                                                      <p className="text-xs text-gray-600 mt-1">
                                                        {warehouse.address}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                                {activeView === "pickup" && (
                                                  <div className="col-span-2 mt-2">
                                                    <span className="font-medium">
                                                      VIN:
                                                    </span>{" "}
                                                    {item.guaranteeCase
                                                      ?.vehicleProcessingRecord
                                                      ?.vin || "N/A"}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </>
                                    )}
                                  {activeView === "install" &&
                                    pickedUpReservation?.warehouse && (
                                      <div className="col-span-2 flex items-start gap-2">
                                        <Warehouse className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="font-medium">
                                            Warehouse:
                                          </span>{" "}
                                          {pickedUpReservation.warehouse.name ||
                                            pickedUpReservation.warehouse
                                              .warehouseName ||
                                            "N/A"}
                                          {pickedUpReservation.warehouse
                                            .address && (
                                            <span className="block text-xs text-gray-500 mt-0.5">
                                              {
                                                pickedUpReservation.warehouse
                                                  .address
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  {activeView === "install" &&
                                    pickedUpReservation?.component
                                      ?.serialNumber && (
                                      <div className="col-span-2">
                                        <span className="font-medium">
                                          Serial Number:
                                        </span>{" "}
                                        <span className="font-mono">
                                          {
                                            pickedUpReservation.component
                                              .serialNumber
                                          }
                                        </span>
                                      </div>
                                    )}
                                  {item.diagnosisText && (
                                    <div className="col-span-2">
                                      <span className="font-medium">
                                        Diagnosis:
                                      </span>{" "}
                                      {item.diagnosisText}
                                    </div>
                                  )}
                                  {item.correctionText && (
                                    <div className="col-span-2">
                                      <span className="font-medium">
                                        Correction:
                                      </span>{" "}
                                      {item.correctionText}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-3">
                            {activeView !== "pickup" && (
                              <button
                                onClick={() => showDetails(item)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            )}
                            {activeView === "pickup" ? (
                              <div className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg flex items-center gap-2 font-medium border border-orange-300">
                                <Warehouse className="w-4 h-4" />
                                Pickup Required
                              </div>
                            ) : item.status === "IN_REPAIR" ||
                              item.status === "PARTS_AVAILABLE" ? (
                              // Show Install Component button for IN_REPAIR status
                              item.status === "IN_REPAIR" ? (
                                <button
                                  onClick={() =>
                                    handleInstall(
                                      item as ComponentWithReservation
                                    )
                                  }
                                  disabled={isProcessing}
                                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                                >
                                  <Package className="w-4 h-4" />
                                  {isProcessing
                                    ? "Installing..."
                                    : "Install Component"}
                                </button>
                              ) : (
                                // Show Mark Repair Complete button for PARTS_AVAILABLE status
                                <button
                                  onClick={() => handleMarkComplete(item)}
                                  disabled={isProcessing}
                                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {isProcessing
                                    ? "Completing..."
                                    : "Mark Repair Complete"}
                                </button>
                              )
                            ) : // For COMPLETED, CLOSED, READY_FOR_REPAIR, PARTS_PENDING - no action buttons
                            item.status === "COMPLETED" ||
                              item.status === "CLOSED" ? (
                              <div className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2 font-medium border border-gray-300">
                                <CheckCircle className="w-4 h-4" />
                                {item.status === "COMPLETED"
                                  ? "Completed"
                                  : "Closed"}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activeView === "install"
                        ? "bg-purple-100"
                        : "bg-green-100"
                    }`}
                  >
                    {activeView === "install" ? (
                      <Package className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Wrench className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {activeView === "install"
                        ? "Component Installation Details"
                        : "Repair Completion Details"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {selectedItem.typeComponent?.name || "Component"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Component Type</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.typeComponent?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.quantity || 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Case ID</p>
                      <p className="font-medium text-gray-900 truncate">
                        {selectedItem.guaranteeCaseId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Correction */}
                {(selectedItem.diagnosisText ||
                  selectedItem.correctionText) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Diagnosis & Correction
                    </h3>
                    {selectedItem.diagnosisText && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          Diagnosis
                        </p>
                        <p className="text-sm text-blue-800">
                          {selectedItem.diagnosisText}
                        </p>
                      </div>
                    )}
                    {selectedItem.correctionText && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs font-medium text-green-900 mb-1">
                          Correction
                        </p>
                        <p className="text-sm text-green-800">
                          {selectedItem.correctionText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reservation Details for Install */}
                {activeView === "install" &&
                  (selectedItem as ComponentWithReservation).reservations && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">
                        Reservation Details
                      </h3>
                      {(() => {
                        const pickedUpReservations = (
                          selectedItem as ComponentWithReservation
                        ).reservations?.filter(
                          (res) => res.status === "PICKED_UP"
                        );

                        if (
                          !pickedUpReservations ||
                          pickedUpReservations.length === 0
                        ) {
                          return (
                            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                              No reservation details available
                            </div>
                          );
                        }

                        return pickedUpReservations.map((res, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-green-50 rounded-lg space-y-3 text-sm border border-green-200"
                          >
                            {res.component?.serialNumber && (
                              <div>
                                <p className="text-gray-500 mb-1">
                                  Serial Number
                                </p>
                                <p className="font-medium text-gray-900">
                                  {res.component.serialNumber}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500 mb-1">Status</p>
                              <p className="font-medium text-green-600">
                                ✓ Ready to Install
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">
                                Picked Up From
                              </p>
                              <div className="flex items-start gap-2">
                                <Warehouse className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  {(() => {
                                    const warehouse =
                                      res.component?.transferHistory?.[0]
                                        ?.request?.requestingWarehouse;

                                    if (warehouse) {
                                      return (
                                        <>
                                          <p className="font-medium text-gray-900">
                                            {warehouse.name}
                                          </p>
                                          {warehouse.address && (
                                            <p className="text-xs text-gray-600 mt-1">
                                              📍 {warehouse.address}
                                            </p>
                                          )}
                                        </>
                                      );
                                    }
                                    return (
                                      <p className="font-medium text-gray-500 italic">
                                        Warehouse information not available
                                      </p>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                💡 Component has been picked up from warehouse
                                and is ready for installation on the vehicle.
                              </p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}

                {/* Alternative: Show for RESERVED status components */}
                {activeView === "install" &&
                  (selectedItem as ComponentWithReservation).reservations
                    ?.filter((res) => res.status === "RESERVED")
                    .map((res, idx) => (
                      <div key={idx} className="space-y-3 mt-3">
                        <h3 className="font-semibold text-gray-900">
                          ⚠️ Pickup Required - Warehouse Location
                        </h3>
                        <div className="p-4 bg-yellow-50 rounded-lg space-y-3 text-sm border border-yellow-200">
                          {res.component?.serialNumber && (
                            <div>
                              <p className="text-gray-500 mb-1">
                                Serial Number
                              </p>
                              <p className="font-medium text-gray-900">
                                {res.component.serialNumber}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500 mb-1">
                              📍 Pickup Location
                            </p>
                            <div className="flex items-start gap-2">
                              <Warehouse className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div>
                                {(() => {
                                  // Try to get warehouse from transferHistory (requesting warehouse)
                                  const requestingWarehouse =
                                    res.component?.transferHistory?.[0]?.request
                                      ?.requestingWarehouse;
                                  // Fallback to component's current warehouse
                                  const currentWarehouse =
                                    res.component?.warehouse;
                                  const warehouse =
                                    requestingWarehouse || currentWarehouse;

                                  if (warehouse) {
                                    return (
                                      <>
                                        <p className="font-medium text-gray-900">
                                          {warehouse.name}
                                        </p>
                                        {warehouse.address && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            📍 {warehouse.address}
                                          </p>
                                        )}
                                      </>
                                    );
                                  }
                                  return (
                                    <p className="font-medium text-gray-500 italic">
                                      Warehouse information not available
                                    </p>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Status</p>
                            <p className="font-medium text-yellow-600">
                              ⏳ Please pick up this component from the
                              warehouse above
                            </p>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-orange-800">
                              💡 Go to the warehouse location above to pick up
                              this component. After pickup, notify the Parts
                              Coordinator to mark it as picked up in the system.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                {/* Vehicle Info */}
                {selectedItem.guaranteeCase?.vehicleProcessingRecord?.vin && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Vehicle Information
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">VIN</p>
                      <p className="font-medium text-gray-900">
                        {selectedItem.guaranteeCase.vehicleProcessingRecord.vin}
                      </p>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">
                      {activeView === "install"
                        ? "Installation Instructions"
                        : "Completion Instructions"}
                    </p>
                    <p className="text-blue-700">
                      {activeView === "install"
                        ? "Verify component serial number and warehouse location before installation. Once installed, the old component will automatically be marked as removed."
                        : "Ensure all repair work is complete and tested before marking as complete. This will finalize the repair status for this case line."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {/* Only show action buttons for appropriate statuses */}
                {selectedItem.status === "IN_REPAIR" && (
                  <button
                    onClick={() => {
                      handleInstall(selectedItem as ComponentWithReservation);
                      setShowDetailModal(false);
                    }}
                    disabled={processingItem !== null}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                  >
                    <Package className="w-4 h-4" />
                    Install Component
                  </button>
                )}
                {selectedItem.status === "PARTS_AVAILABLE" && (
                  <button
                    onClick={() => {
                      handleMarkComplete(selectedItem);
                      setShowDetailModal(false);
                    }}
                    disabled={processingItem !== null}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Installation Image Upload Modal */}
      <AnimatePresence>
        {showImageUploadModal && selectedCaseLineForCompletion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploadingImages && setShowImageUploadModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Upload Installation Images
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedCaseLineForCompletion.typeComponent?.name}
                  </p>
                </div>
                <button
                  onClick={() =>
                    !uploadingImages && setShowImageUploadModal(false)
                  }
                  disabled={uploadingImages}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Instructions */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">
                      Installation Photo Guidelines:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Take clear photos of the installed component</li>
                      <li>Include serial number if visible</li>
                      <li>Show component properly connected/mounted</li>
                      <li>Optional but recommended for quality assurance</li>
                    </ul>
                  </div>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Installation Images <span className="text-red-600">*</span>
                  </label>
                  <p className="text-sm text-gray-500">
                    At least one image is required to document the repair work
                  </p>

                  {/* Selected Images Preview */}
                  {installationImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {installationImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Installation ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => {
                              const newImages = installationImages.filter(
                                (_, i) => i !== index
                              );
                              setInstallationImages(newImages);
                            }}
                            disabled={uploadingImages}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <label
                    className={`
                    block w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors
                    ${
                      installationImages.length > 0
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }
                    ${uploadingImages ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          setInstallationImages([
                            ...installationImages,
                            ...newFiles,
                          ]);
                        }
                      }}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Click to select installation photos
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {installationImages.length > 0
                        ? `${installationImages.length} image(s) selected`
                        : "PNG, JPG up to 10MB each"}
                    </p>
                  </label>
                </div>

                {/* Vehicle Info */}
                {selectedCaseLineForCompletion.guaranteeCase
                  ?.vehicleProcessingRecord?.vin && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Vehicle VIN</p>
                    <p className="font-medium text-gray-900">
                      {
                        selectedCaseLineForCompletion.guaranteeCase
                          .vehicleProcessingRecord.vin
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowImageUploadModal(false)}
                  disabled={uploadingImages}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkComplete}
                  disabled={uploadingImages || installationImages.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  title={
                    installationImages.length === 0
                      ? "Please upload at least one image"
                      : ""
                  }
                >
                  {uploadingImages ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mark Repair Complete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Old Component Serial Number Modal */}
      <AnimatePresence>
        {showOldSerialModal && pendingInstallReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOldSerialModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Old Component Serial Number
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {pendingInstallReservation.component.typeComponent?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowOldSerialModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">
                      Multiple Component Installation
                    </p>
                    <p className="text-xs">
                      This component type has multiple units per vehicle. Please
                      select the component being replaced.
                    </p>
                  </div>
                </div>

                {/* Vehicle Info */}
                {pendingInstallReservation.component.guaranteeCase
                  ?.vehicleProcessingRecord?.vin && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Vehicle VIN</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {
                        pendingInstallReservation.component.guaranteeCase
                          .vehicleProcessingRecord.vin
                      }
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {loadingVehicleComponents && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Installed Components Selection */}
                {!loadingVehicleComponents &&
                  vehicleComponents.length > 0 &&
                  !showManualEntry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Component Being Replaced{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {vehicleComponents.map((comp) => (
                          <button
                            key={comp.componentId}
                            onClick={() =>
                              setOldComponentSerial(comp.serialNumber)
                            }
                            className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:border-blue-400 hover:bg-blue-50 $\{
                            oldComponentSerial === comp.serialNumber
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 bg-white"
                          }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-mono text-sm font-semibold text-gray-900">
                                  {comp.serialNumber}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Currently Installed
                                </p>
                              </div>
                              {oldComponentSerial === comp.serialNumber && (
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Manual Entry Toggle */}
                      <button
                        onClick={() => {
                          setShowManualEntry(true);
                          setOldComponentSerial("");
                        }}
                        className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        or Enter Serial Manually
                      </button>
                    </div>
                  )}

                {/* Manual Entry or No Components Found */}
                {!loadingVehicleComponents &&
                  (vehicleComponents.length === 0 || showManualEntry) && (
                    <div>
                      {vehicleComponents.length === 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                          <p className="text-xs text-yellow-700">
                            No installed components found. Please enter the
                            serial number manually.
                          </p>
                        </div>
                      )}

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Old Component Serial Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={oldComponentSerial}
                        onChange={(e) => setOldComponentSerial(e.target.value)}
                        placeholder="Enter serial number..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        autoFocus
                      />

                      {/* Back to Selection */}
                      {showManualEntry && vehicleComponents.length > 0 && (
                        <button
                          onClick={() => {
                            setShowManualEntry(false);
                            setOldComponentSerial("");
                          }}
                          className="mt-3 w-full text-sm text-gray-600 hover:text-gray-700 font-medium py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          ← Back to Component Selection
                        </button>
                      )}
                    </div>
                  )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowOldSerialModal(false);
                    setOldComponentSerial("");
                    setPendingInstallReservation(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmInstallWithOldSerial}
                  disabled={!oldComponentSerial.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  <Wrench className="w-4 h-4" />
                  Install Component
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
