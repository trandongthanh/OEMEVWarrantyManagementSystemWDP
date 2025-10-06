/**
 * Claim Steps Types
 *
 * Type definitions for the 4-step warranty claim creation process
 * These types are used internally by the NewClaimModal and step components
 */

// ==================== Vehicle Information ====================

export interface VehicleInfo {
  vin: string;
  dateOfManufacture: string;
  placeOfManufacture: string;
  licensePlate: string;
  purchaseDate: string;
  model: string;
  company: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
}

// ==================== Warranty Status ====================

export interface ComponentWarrantyStatus {
  name: string;
  status: boolean;
  remainingDays: number;
}

export interface WarrantyCheckResult {
  vin: string;
  dateOfManufacture: string;
  placeOfManufacture: string;
  licensePlate: string;
  purchaseDate: string;
  generalWarrantyDuration: {
    status: boolean;
    remainingDays: number;
  };
  generalWarrantyMileage: boolean;
  componetWarranty: ComponentWarrantyStatus[];
}

// ==================== Guarantee Case ====================

export interface GuaranteeCaseInput {
  contentGuarantee: string;
  description?: string; // Additional description for UI
}

// ==================== Claim Data State ====================

/**
 * Main state object for the claim creation flow
 * Accumulates data from all 4 steps
 */
export interface ClaimData {
  // Step 1: Vehicle Validation
  vehicleInfo?: VehicleInfo;

  // Step 2: Odometer Reading
  odometer?: number;
  warrantyCheck?: WarrantyCheckResult;

  // Step 3: Warranty Issues
  guaranteeCases?: GuaranteeCaseInput[];

  // Step 4: Review & Submit (no additional data, just reviews above)
}

// ==================== API Request Payload ====================

/**
 * Final payload structure for creating a claim
 * Matches backend POST /vehicleProcessingRecord requirements
 */
export interface CreateClaimPayload {
  odometer: number;
  guaranteeCases: Array<{
    contentGuarantee: string;
  }>;
}
