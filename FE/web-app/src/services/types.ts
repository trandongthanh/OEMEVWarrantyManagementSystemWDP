/**
 * API Service Types
 *
 * Type definitions matching backend models and API responses
 */

// ==================== Customer Types ====================

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// ==================== Vehicle Types ====================

export interface VehicleModel {
  modelName: string;
  generalWarrantyDuration: number; // months
  generalWarrantyMileage: number;
  company: {
    name: string;
  };
  typeComponents?: TypeComponent[];
}

export interface TypeComponent {
  name: string;
  WarrantyComponent?: {
    durationMonth: number;
    mileageLimit: number;
  };
}

export interface Vehicle {
  vin: string;
  dateOfManufacture: string;
  placeOfManufacture: string;
  licensePlate?: string;
  purchaseDate?: string;
  owner?: Customer;
  model: string;
  company: string;
}

export interface VehicleResponse {
  status: "success";
  data: {
    vehicle: Vehicle;
  };
  message?: string;
}

// ==================== Warranty Check Types ====================

export interface ComponentWarranty {
  name: string;
  status: boolean;
  remainingDays: number;
}

export interface GeneralWarrantyStatus {
  status: boolean;
  remainingDays: number;
}

export interface VehicleWarrantyCheck {
  vin: string;
  dateOfManufacture: string;
  placeOfManufacture: string;
  licensePlate: string;
  purchaseDate: string;
  generalWarrantyDuration: GeneralWarrantyStatus;
  generalWarrantyMileage: boolean;
  componetWarranty: ComponentWarranty[];
}

export interface VehicleWarrantyCheckRequest {
  odometer: number;
}

export interface WarrantyPolicy {
  durationMonths: number;
  mileageLimit: number;
}

export interface WarrantyDuration {
  status: string | boolean;
  endDate: string;
  remainingDays: number;
}

export interface WarrantyMileage {
  status: string;
  remainingMileage: number;
}

export interface GeneralWarranty {
  policy: WarrantyPolicy;
  duration: WarrantyDuration;
  mileage: WarrantyMileage;
}

export interface ComponentWarranty {
  componentName: string;
  policy: WarrantyPolicy;
  duration: WarrantyDuration;
  mileage: WarrantyMileage;
}

export interface VehicleWarrantyData {
  vin: string;
  purchaseDate: string;
  currentOdometer: number;
  generalWarranty: GeneralWarranty;
  componentWarranties: ComponentWarranty[];
}

export interface VehicleWarrantyCheckResponse {
  status: "success";
  data: {
    vehicle: VehicleWarrantyData;
  };
  message?: string;
}

export interface WarrantyPreviewRequest {
  odometer: number;
  purchaseDate: string;
}

// ==================== Register Owner Types ====================

export interface RegisterOwnerRequest {
  customerId?: string;
  customer?: CustomerInput;
  dateOfManufacture: string;
  licensePlate: string;
  purchaseDate: string;
}

export interface RegisterOwnerResponse {
  status: "success";
  data: {
    vehicle: Vehicle;
  };
}

// ==================== Guarantee Case Types ====================

export interface GuaranteeCase {
  guaranteeCaseId: string;
  vehicleProcessingRecordId: string;
  status: "pending_diagnosis" | "in_progress" | "completed" | "closed";
  contentGuarantee: string;
  leadTechId?: string;
  expectedCompletionDate?: string;
  openedAt: string;
  closeAt?: string;
}

export interface GuaranteeCaseInput {
  contentGuarantee: string;
  leadTechId?: string;
  expectedCompletionDate?: string;
}

// ==================== Vehicle Processing Record Types ====================

export interface VehicleProcessingRecord {
  vehicleProcessingRecordId: string;
  vin: string;
  checkInDate: string;
  odometer: number;
  status:
    | "processing"
    | "waiting_customer_approval"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";
  createdByStaffId: string;
  mainTechnicianId?: string;
  diagnosticFee?: number;
  isDiagnosticFeeApproved: boolean;
}

export interface CreateClaimRequest {
  odometer: number;
  guaranteeCases: GuaranteeCaseInput[];
}

export interface CreateClaimResponse {
  status: "success";
  data: {
    record: VehicleProcessingRecord & {
      case: GuaranteeCase[];
      createdAt: string;
      updatedAt: string;
    };
  };
}

// ==================== Technician Assignment Types ====================

export interface AssignTechnicianRequest {
  vehicleProcessingRecordId: string;
  technicianId: string;
}

export interface AssignTechnicianResponse {
  status: "success";
  data: {
    updatedRecord: VehicleProcessingRecord;
  };
}

// ==================== Claim Details Types ====================

export interface ClaimDetailsResponse {
  status: "success";
  data: {
    record: VehicleProcessingRecord & {
      vehicle?: Vehicle;
      guaranteeCases?: GuaranteeCase[];
      createdByStaff?: any;
      mainTechnician?: any;
    };
  };
}

// ==================== API Error Types ====================

export interface ApiError {
  status: "error";
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
