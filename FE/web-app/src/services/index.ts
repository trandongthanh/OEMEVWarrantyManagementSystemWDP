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

export { default as caseLineService } from "./caseLineService";
export type {
  CaseLine,
  CaseLineDetailResponse,
  UpdateCaseLineData,
  ApproveCaseLinesData,
  AllocateStockResponse,
  AssignTechnicianData,
  GetCaseLinesListParams,
  GetCaseLinesListResponse,
} from "./caseLineService";

export { default as stockTransferService } from "./stockTransferService";
export type {
  StockTransferRequest,
  StockTransferRequestItem,
  CreateStockTransferRequest,
  StockTransferRequestListResponse,
  StockTransferRequestDetailResponse,
  RejectStockTransferRequest,
  ShipStockTransferRequest,
  CancelStockTransferRequest,
} from "./stockTransferService";

export { default as componentReservationService } from "./componentReservationService";
export type {
  ComponentReservation,
  PickupResponse,
  InstallComponentResponse,
  ReturnComponentRequest,
  ReturnComponentResponse,
} from "./componentReservationService";

export { default as technicianService } from "./technicianService";

// Chat service exports (no default export in chatService)
export {
  startAnonymousChat,
  getConversationMessages,
  acceptConversation,
  getMyConversations,
  closeConversation,
  getOrCreateGuestId,
  getGuestChatSession,
  saveGuestConversationId,
  clearGuestChatSession,
} from "./chatService";
export type {
  GuestChatSession,
  Message,
  Conversation,
  StartChatRequest,
  StartChatResponse,
} from "./chatService";
