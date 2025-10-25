import apiClient from "@/lib/apiClient";
import type { CreateClaimRequest, CreateClaimResponse } from "./types";
import { processingRecordService } from "./index";

/**
 * Create a new warranty claim (Vehicle Processing Record)
 * POST /processing-records
 *
 * Creates a vehicle processing record with guarantee cases.
 *
 * Required payload structure:
 * {
 *   odometer: number,
 *   guaranteeCases: [
 *     { contentGuarantee: string }
 *   ],
 *   vin: string
 * }
 *
 * The backend automatically:
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
    // Backend expects vin in req.body
    const payload = { ...data, vin };
    const response = await apiClient.post(`/processing-records`, payload);

    return response.data;
  } catch (error: unknown) {
    console.error("Error creating claim:", error);
    throw error;
  }
};

const claimService = {
  createClaim,
  assignTechnician: processingRecordService.assignTechnician,
  getClaimDetails: processingRecordService.getRecordById,
};

export default claimService;
