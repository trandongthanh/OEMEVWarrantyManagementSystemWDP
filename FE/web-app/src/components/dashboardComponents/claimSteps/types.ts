// Shared types for warranty claim system

export interface VehicleInfo {
  vin: string;
  model: string;
  year: string;
  purchaseDate: string;
  customer: string;
  phone: string;
  email: string;
  warrantyStatus: "active" | "expired" | "void" | "expiring_soon";
  warrantyStart: string;
  warrantyEnd: string;
  currentMileage: string;
  maxMileage: string;
}

export interface TechnicianInfo {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  status: string;
}

export interface IssueTag {
  id: string;
  label: string;
  color: string;
  category: string;
}

export interface ReplacementPart {
  id: string;
  name: string;
  partNumber: string;
  estimatedCost: string;
  warrantyCoverage: "full" | "partial" | "none";
  priority: "high" | "medium" | "low";
}

export interface ClaimData {
  vehicleInfo?: VehicleInfo;
  issueType?: string;
  description?: string;
  issueTags?: IssueTag[];
  priority?: "low" | "medium" | "high" | "critical";
  urgency?: "routine" | "urgent" | "emergency";
  technician?: TechnicianInfo;
  supportTechnicians?: string[];
  estimatedTime?: string;
  instructions?: string;
  documentation?: File[];
  notes?: string;
  reportType?: string;
  warrantyType?: string;
  replacementParts?: ReplacementPart[];
  reportAssignee?: string;
  odometerReading?: string;
}
