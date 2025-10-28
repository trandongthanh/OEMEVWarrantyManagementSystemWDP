import apiClient from "@/lib/apiClient";
import type {
  VehicleResponse,
  VehicleWarrantyCheckResponse,
  RegisterOwnerRequest,
  RegisterOwnerResponse,
} from "./types";

/**
 * Types for vehicle components and history
 */
export interface VehicleComponent {
  componentId: string;
  serialNumber: string;
  status: "IN_STOCK" | "RESERVED" | "INSTALLED" | "RETURNED" | "DEFECTIVE";
  vehicleVin: string;
  installedAt: string;
  currentHolderId?: string;
  typeComponent: {
    typeComponentId: string;
    name: string;
    category: string;
    price: number;
  };
}

export interface VehicleComponentsResponse {
  status: "success";
  data: {
    components: VehicleComponent[];
  };
}

export interface VehicleHistoryItem {
  recordId: string;
  checkInDate: string;
  completionDate?: string;
  status: string;
  odometer: number;
  description?: string;
  serviceCenter: {
    serviceCenterId: string;
    name: string;
    address: string;
  };
  guaranteeCases?: Array<{
    guaranteeCaseId: string;
    caseNumber: string;
    status: string;
    createdAt: string;
  }>;
}

export interface VehicleHistoryResponse {
  status: "success";
  data: {
    history: VehicleHistoryItem[];
  };
}

/**
 * Vehicle Service
 *
 * Handles all vehicle-related API calls:
 * - Vehicle lookup by VIN
 * - Warranty status checking
 * - Owner registration
 */

/**
 * Find vehicle by VIN
 * GET /vehicles/{vin}
 *
 * @param vin - Vehicle Identification Number
 * @returns Vehicle information with owner and model details
 */
export const findVehicleByVin = async (
  vin: string
): Promise<VehicleResponse> => {
  try {
    const response = await apiClient.get(`/vehicles/${vin}`);

    return response.data;
  } catch (error: unknown) {
    console.error("Error finding vehicle by VIN:", error);
    throw error;
  }
};

/**
 * Check vehicle warranty status
 * GET /vehicles/{vin}/warranty
 *
 * Checks warranty eligibility based on:
 * - Purchase date and warranty duration
 * - Current odometer reading vs mileage limits
 * - Component-specific warranties
 *
 * @param vin - Vehicle Identification Number
 * @param odometer - Current odometer reading
 * @returns Warranty status for vehicle and components
 */
export const checkVehicleWarranty = async (
  vin: string,
  odometer: number
): Promise<VehicleWarrantyCheckResponse> => {
  try {
    const response = await apiClient.get(`/vehicles/${vin}/warranty`, {
      params: { odometer },
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Error checking vehicle warranty:", error);
    throw error;
  }
};

/**
 * Preview warranty status before purchase
 * POST /vehicles/{vin}/warranty/preview
 *
 * Previews warranty eligibility for a vehicle before it's purchased.
 * Used to check warranty coverage based on hypothetical purchase date and odometer.
 *
 * @param vin - Vehicle Identification Number
 * @param data - Preview data with odometer and purchase date
 * @returns Warranty status preview
 */
export const previewVehicleWarranty = async (
  vin: string,
  data: { odometer: number; purchaseDate: string }
): Promise<VehicleWarrantyCheckResponse> => {
  try {
    const response = await apiClient.post(
      `/vehicles/${vin}/warranty/preview`,
      data
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error previewing vehicle warranty:", error);
    throw error;
  }
};

/**
 * Register owner for vehicle
 * PATCH /vehicles/{vin}
 *
 * Registers a customer as the owner of a vehicle.
 * Can either use existing customer ID or create new customer.
 *
 * @param vin - Vehicle Identification Number
 * @param data - Owner registration data
 * @returns Updated vehicle with owner information
 */
export const registerVehicleOwner = async (
  vin: string,
  data: RegisterOwnerRequest
): Promise<RegisterOwnerResponse> => {
  // Validate that either customerId or customer is provided
  if (!data.customerId && !data.customer) {
    throw new Error(
      "Client must provide customer or customerId to register for owner for vehicle"
    );
  }

  try {
    const response = await apiClient.patch(`/vehicles/${vin}`, data);

    return response.data;
  } catch (error: unknown) {
    console.error("Error registering vehicle owner:", error);
    throw error;
  }
};

/**
 * Get all components installed on vehicle
 * GET /vehicles/{vin}/components
 *
 * Returns all components that are currently installed on the vehicle,
 * including component details and installation dates.
 *
 * @param vin - Vehicle Identification Number
 * @param status - Optional filter by component status (ALL, INSTALLED, RETURNED, DEFECTIVE)
 * @returns List of components installed on the vehicle
 */
export const getVehicleComponents = async (
  vin: string,
  status?: "ALL" | "INSTALLED" | "RETURNED" | "DEFECTIVE"
): Promise<VehicleComponentsResponse> => {
  try {
    const response = await apiClient.get(`/vehicles/${vin}/components`, {
      params: status ? { status } : undefined,
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching vehicle components:", error);
    throw error;
  }
};

/**
 * Get vehicle service and warranty history
 * GET /vehicles/{vin}/history
 *
 * Returns the complete service history for a vehicle, including:
 * - All processing records (check-ins)
 * - Guarantee cases
 * - Service center information
 * - Status and dates
 *
 * @param vin - Vehicle Identification Number
 * @returns Complete service and warranty history
 */
export const getVehicleHistory = async (
  vin: string
): Promise<VehicleHistoryResponse> => {
  try {
    const response = await apiClient.get(`/vehicles/${vin}/history`);

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching vehicle history:", error);
    throw error;
  }
};

const vehicleService = {
  findVehicleByVin,
  checkVehicleWarranty,
  previewVehicleWarranty,
  registerVehicleOwner,
  getVehicleComponents,
  getVehicleHistory,
};

export default vehicleService;
