import apiClient from "@/lib/apiClient";
import type {
  CreateClaimRequest,
  CreateClaimResponse,
  ClaimDetailsResponse,
  AssignTechnicianRequest,
  AssignTechnicianResponse,
} from "./types";

/**
 * Claim Service (Vehicle Processing Record)
 *
 * Handles warranty claim operations:
 * - Creating new claims
 * - Assigning technicians
 * - Retrieving claim details
 */

/**
 * Create a new warranty claim (Vehicle Processing Record)
 * POST /vehicleProcessingRecord
 *
 * Creates a vehicle processing record with guarantee cases.
 *
 * Required payload structure:
 * {
 *   odometer: number,
 *   guaranteeCases: [
 *     { contentGuarantee: string }
 *   ]
 * }
 *
 * The backend automatically:
 * - Extracts VIN from route params
 * - Gets createdByStaffId from authenticated user
 * - Validates vehicle and owner existence
 * - Checks for existing active records
 *
 * @param vin - Vehicle Identification Number
 * @param data - Claim creation data
 * @returns Created vehicle processing record with guarantee cases
 */
export const createClaim = async (
  vin: string,
  data: CreateClaimRequest
): Promise<CreateClaimResponse> => {
  try {
    // Backend expects vin in req.params, so we use URL path parameter
    const response = await apiClient.post(`/vehicleProcessingRecord/${vin}`, data);

    return response.data;
  } catch (error: unknown) {
    console.error("Error creating claim:", error);
    throw error;
  }
};

/**
 * Assign main technician to a claim
 * PATCH /vehicleProcessingRecord/:id/assign-technician
 *
 * @param vehicleProcessingRecordId - Record ID
 * @param technicianId - Technician user ID
 * @returns Updated record
 */
export const assignTechnician = async (
  data: AssignTechnicianRequest
): Promise<AssignTechnicianResponse> => {
  try {
    const response = await apiClient.patch(
      `/vehicleProcessingRecord/${data.vehicleProcessingRecordId}/assign-technician`,
      { technicianId: data.technicianId }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error assigning technician:", error);
    throw error;
  }
};

/**
 * Get claim details by ID
 * GET /vehicleProcessingRecord/:id
 *
 * @param id - Vehicle processing record ID
 * @returns Detailed claim information
 */
export const getClaimDetails = async (
  id: string
): Promise<ClaimDetailsResponse> => {
  try {
    const response = await apiClient.get(`/vehicleProcessingRecord/${id}`);

    return response.data;
  } catch (error: any) {
    console.error("Error fetching claim details:", error);
    throw error;
  }
};
