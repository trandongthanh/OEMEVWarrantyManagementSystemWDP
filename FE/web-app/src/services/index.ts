// Export services from this file
export { default as authService } from "./authService";
export type {
  LoginCredentials,
  LoginResponse,
  DecodedToken,
} from "./authService";

export { default as userService } from "./userService";
export type { User, CreateUserData, Technician } from "./userService";

export { default as warehouseService } from "./warehouseService";
export type {
  Warehouse,
  Stock,
  WarehouseQueryParams,
} from "./warehouseService";

export { default as customerService } from "./customerService";
export type { Customer } from "./customerService";

export { default as vehicleService } from "./vehicleService";

export { default as claimService } from "./claimService";

export { default as processingRecordService } from "./processingRecordService";
export type {
  ProcessingRecord,
  ProcessingRecordListResponse,
  CompatibleComponent,
} from "./processingRecordService";
