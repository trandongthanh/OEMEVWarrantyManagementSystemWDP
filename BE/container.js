import {
  createContainer,
  asClass,
  asFunction,
  asValue,
  Lifetime,
} from "awilix";
import db from "./src/models/index.cjs";
import redisClient from "./src/util/redisClient.js";
import mailTransporter from "./src/util/emailTransporter.js";

// Import repositories
import UserRepository from "./src/repository/user.repository.js";
import VehicleRepository from "./src/repository/vehicle.repository.js";
import CustomerRepository from "./src/repository/customer.repository.js";
import VehicleProcessingRecordRepository from "./src/repository/vehicleProcessingRecord.repository.js";
import GuaranteeCaseRepository from "./src/repository/guaranteeCase.repository.js";
import ConversationRepository from "./src/repository/conversation.repository.js";
import MessageRepository from "./src/repository/message.repository.js";
import GuestRepository from "./src/repository/guest.repository.js";
import CaselineRepository from "./src/repository/caseline.repository.js";
import ComponentReservationRepository from "./src/repository/componentReservation.repository.js";
import ComponentRepository from "./src/repository/component.repository.js";
import WarehouseRepository from "./src/repository/warehouse.repository.js";
import InventoryAdjustmentRepository from "./src/repository/inventoryAdjustment.repository.js";
import StockTransferRequestRepository from "./src/repository/stockTransferRequest.repository.js";
import StockTransferRequestItemRepository from "./src/repository/stockTransferRequestItem.repository.js";
import WorkScheduleRepository from "./src/repository/workSchedule.repository.js";
import InventoryRepository from "./src/repository/inventory.repository.js";
import StockReservationRepository from "./src/repository/stockReservation.repository.js";
import TaskAssignmentRepository from "./src/repository/taskAssignment.repository.js";
import OemVehicleModelRepository from "./src/repository/oemVehicleModel.repository.js";
import WarrantyComponentRepository from "./src/repository/warrantyComponent.repository.js";
import TypeComponentRepository from "./src/repository/typeComponent.repository.js";
import RecallRepository from "./src/repository/recall.repository.js";
import RoleRepository from "./src/repository/role.repository.js";
import ServiceCenterRepository from "./src/repository/serviceCenter.repository.js";
import NotificationRepository from "./src/repository/notification.repository.js"; // New import

// Import services
import UserService from "./src/service/user.service.js";
import HashService from "./src/service/hash.service.js";
import AuthService from "./src/service/auth.service.js";
import TokenService from "./src/service/token.service.js";
import VehicleService from "./src/service/vehicle.service.js";
import CustomerService from "./src/service/customer.service.js";
import VehicleProcessingRecordService from "./src/service/vehicleProcessingRecord.service.js";
import ChatService from "./src/service/chat.service.js";
import NotificationService from "./src/service/notification.service.js";
import CaseLineService from "./src/service/caseLine.service.js";
import ComponentReservationService from "./src/service/componentReservation.service.js";
import WarehouseService from "./src/service/warehouse.service.js";
import StockTransferRequestService from "./src/service/stockTransferRequest.service.js";
import WorkScheduleService from "./src/service/workSchedule.service.js";
import MailService from "./src/service/mail.service.js";
import InventoryService from "./src/service/inventory.service.js";
import TaskAssignmentService from "./src/service/taskAssignment.service.js";
import OemVehicleModelService from "./src/service/oemVehicleModel.service.js";
import RecallService from "./src/service/recall.service.js";
import RoleService from "./src/service/role.service.js";
import ServiceCenterService from "./src/service/serviceCenter.service.js";
import WarrantyComponentService from "./src/service/warrantyComponent.service.js";
import PublicService from "./src/service/public.service.js";

// Import controllers
import AuthController from "./src/api/controller/auth.controller.js";
import UserController from "./src/api/controller/user.controller.js";
import VehicleController from "./src/api/controller/vehicle.controller.js";
import CustomerController from "./src/api/controller/customer.controller.js";
import VehicleProcessingRecordController from "./src/api/controller/vehicleProcessingRecord.controller.js";
import ChatController from "./src/api/controller/chat.controller.js";
import CaseLineController from "./src/api/controller/caseLine.controller.js";
import ComponentReservationsController from "./src/api/controller/componentReservations.controller.js";
import WarrantyComponentController from "./src/api/controller/warrantyComponent.controller.js";
import WarehouseController from "./src/api/controller/warehouse.controller.js";
import StockTransferRequestController from "./src/api/controller/stockTransferRequest.controller.js";
import WorkScheduleController from "./src/api/controller/workSchedule.controller.js";
import MailController from "./src/api/controller/mail.controller.js";
import InventoryController from "./src/api/controller/inventory.controller.js";
import TaskAssignmentController from "./src/api/controller/taskAssignment.controller.js";
import OemVehicleModelController from "./src/api/controller/oemVehicleModel.controller.js";
import RecallController from "./src/api/controller/recall.controller.js";
import RoleController from "./src/api/controller/role.controller.js";
import PublicController from "./src/api/controller/public.controller.js";
import NotificationController from "./src/api/controller/notification.controller.js";

const container = createContainer();

export const setupContainer = (socket) => {
  container.register({
    // Sockets
    io: asValue(socket.io),
    notificationNamespace: asValue(socket.notificationNamespace),
    chatNamespace: asValue(socket.chatNamespace),

    // Models
    db: asValue(db),
    redis: asValue(redisClient),
    transporter: asValue(mailTransporter),

    // Repositories
    userRepository: asClass(UserRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    vehicleRepository: asClass(VehicleRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    customerRepository: asClass(CustomerRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    vehicleProcessingRecordRepository: asClass(
      VehicleProcessingRecordRepository,
      {
        lifetime: Lifetime.SCOPED,
      }
    ),
    guaranteeCaseRepository: asClass(GuaranteeCaseRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    conversationRepository: asClass(ConversationRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    messageRepository: asClass(MessageRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    guestRepository: asClass(GuestRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    caselineRepository: asClass(CaselineRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    componentReservationRepository: asClass(ComponentReservationRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    componentRepository: asClass(ComponentRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    warehouseRepository: asClass(WarehouseRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    inventoryAdjustmentRepository: asClass(InventoryAdjustmentRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    stockTransferRequestRepository: asClass(StockTransferRequestRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    stockTransferRequestItemRepository: asClass(
      StockTransferRequestItemRepository,
      {
        lifetime: Lifetime.SCOPED,
      }
    ),
    workScheduleRepository: asClass(WorkScheduleRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    inventoryRepository: asClass(InventoryRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    stockReservationRepository: asClass(StockReservationRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    taskAssignmentRepository: asClass(TaskAssignmentRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    oemVehicleModelRepository: asClass(OemVehicleModelRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    warrantyComponentRepository: asClass(WarrantyComponentRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    typeComponentRepository: asClass(TypeComponentRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    recallRepository: asClass(RecallRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    roleRepository: asClass(RoleRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    serviceCenterRepository: asClass(ServiceCenterRepository, {
      lifetime: Lifetime.SCOPED,
    }),
    notificationRepository: asClass(NotificationRepository, {
      // New registration
      lifetime: Lifetime.SCOPED,
    }),

    // Services
    userService: asClass(UserService, { lifetime: Lifetime.SCOPED }),
    hashService: asClass(HashService, { lifetime: Lifetime.SCOPED }),
    authService: asClass(AuthService, { lifetime: Lifetime.SCOPED }),
    tokenService: asClass(TokenService, { lifetime: Lifetime.SCOPED }),
    vehicleService: asClass(VehicleService, {
      lifetime: Lifetime.SCOPED,
    }),
    customerService: asClass(CustomerService, {
      lifetime: Lifetime.SCOPED,
    }),
    vehicleProcessingRecordService: asClass(VehicleProcessingRecordService, {
      lifetime: Lifetime.SCOPED,
    }),
    chatService: asClass(ChatService, { lifetime: Lifetime.SCOPED }),
    notificationService: asClass(NotificationService, {
      lifetime: Lifetime.SCOPED,
    }),
    caseLineService: asClass(CaseLineService, {
      lifetime: Lifetime.SCOPED,
    }),
    componentReservationService: asClass(ComponentReservationService, {
      lifetime: Lifetime.SCOPED,
    }),
    warehouseService: asClass(WarehouseService, {
      lifetime: Lifetime.SCOPED,
    }),
    stockTransferRequestService: asClass(StockTransferRequestService, {
      lifetime: Lifetime.SCOPED,
    }),
    workScheduleService: asClass(WorkScheduleService, {
      lifetime: Lifetime.SCOPED,
    }),
    mailService: asClass(MailService, { lifetime: Lifetime.SCOPED }),
    inventoryService: asClass(InventoryService, {
      lifetime: Lifetime.SCOPED,
    }),
    taskAssignmentService: asClass(TaskAssignmentService, {
      lifetime: Lifetime.SCOPED,
    }),
    oemVehicleModelService: asClass(OemVehicleModelService, {
      lifetime: Lifetime.SCOPED,
    }),
    recallService: asClass(RecallService, {
      lifetime: Lifetime.SCOPED,
    }),
    roleService: asClass(RoleService, {
      lifetime: Lifetime.SCOPED,
    }),
    serviceCenterService: asClass(ServiceCenterService, {
      lifetime: Lifetime.SCOPED,
    }),
    warrantyComponentService: asClass(WarrantyComponentService, {
      lifetime: Lifetime.SCOPED,
    }),
    publicService: asClass(PublicService, { lifetime: Lifetime.SCOPED }),

    // Controllers
    authController: asClass(AuthController, {
      lifetime: Lifetime.SCOPED,
    }),
    userController: asClass(UserController, {
      lifetime: Lifetime.SCOPED,
    }),
    vehicleController: asClass(VehicleController, {
      lifetime: Lifetime.SCOPED,
    }),
    customerController: asClass(CustomerController, {
      lifetime: Lifetime.SCOPED,
    }),
    vehicleProcessingRecordController: asClass(
      VehicleProcessingRecordController,
      {
        lifetime: Lifetime.SCOPED,
      }
    ),
    chatController: asClass(ChatController, {
      lifetime: Lifetime.SCOPED,
    }),
    caseLineController: asClass(CaseLineController, {
      lifetime: Lifetime.SCOPED,
    }),
    componentReservationsController: asClass(ComponentReservationsController, {
      lifetime: Lifetime.SCOPED,
    }),
    warrantyComponentController: asClass(WarrantyComponentController, {
      lifetime: Lifetime.SCOPED,
    }),
    warehouseController: asClass(WarehouseController, {
      lifetime: Lifetime.SCOPED,
    }),
    stockTransferRequestController: asClass(StockTransferRequestController, {
      lifetime: Lifetime.SCOPED,
    }),
    workScheduleController: asClass(WorkScheduleController, {
      lifetime: Lifetime.SCOPED,
    }),
    mailController: asClass(MailController, {
      lifetime: Lifetime.SCOPED,
    }),
    inventoryController: asClass(InventoryController, {
      lifetime: Lifetime.SCOPED,
    }),
    taskAssignmentController: asClass(TaskAssignmentController, {
      lifetime: Lifetime.SCOPED,
    }),
    oemVehicleModelController: asClass(OemVehicleModelController, {
      lifetime: Lifetime.SCOPED,
    }),
    recallController: asClass(RecallController, {
      lifetime: Lifetime.SCOPED,
    }),
    roleController: asClass(RoleController, {
      lifetime: Lifetime.SCOPED,
    }),
    publicController: asClass(PublicController, {
      lifetime: Lifetime.SCOPED,
    }),
    notificationController: asClass(NotificationController, {
      lifetime: Lifetime.SCOPED,
    }),
  });
};

export default container;
