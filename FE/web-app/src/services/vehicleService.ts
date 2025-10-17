import apiClient from "@/lib/apiClient";
import type {
  VehicleResponse,
  VehicleWarrantyCheckRequest,
  VehicleWarrantyCheckResponse,
  RegisterOwnerRequest,
  RegisterOwnerResponse,
} from "./types";

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
  } catch (error: any) {
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
  } catch (error: any) {
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

const vehicleService = {
  findVehicleByVin,
  checkVehicleWarranty,
  previewVehicleWarranty,
  registerVehicleOwner,
};

export default vehicleService;
