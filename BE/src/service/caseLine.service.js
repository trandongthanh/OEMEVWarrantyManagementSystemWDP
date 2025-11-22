import { Transaction } from "sequelize";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../error/index.js";
import { formatUTCtzHCM } from "../util/formatUTCtzHCM.js";
import dayjs from "dayjs";

class CaseLineService {
  #caselineRepository;
  #componentReservationRepository;
  #guaranteeCaseRepository;
  #warehouseRepository;
  #componentRepository;
  #taskAssignmentRepository;
  #userRepository;
  #warehouseService;
  #vehicleProcessingRecordRepository;
  #notificationService;
  #inventoryService;
  #db;

  constructor({
    caselineRepository,
    componentReservationRepository,
    guaranteeCaseRepository,
    warehouseRepository,
    componentRepository,
    taskAssignmentRepository,
    userRepository,
    warehouseService,
    vehicleProcessingRecordRepository,
    notificationService,
    inventoryService,
    db,
  }) {
    this.#caselineRepository = caselineRepository;
    this.#componentReservationRepository = componentReservationRepository;
    this.#guaranteeCaseRepository = guaranteeCaseRepository;
    this.#warehouseRepository = warehouseRepository;
    this.#componentRepository = componentRepository;
    this.#taskAssignmentRepository = taskAssignmentRepository;
    this.#userRepository = userRepository;
    this.#warehouseService = warehouseService;
    this.#vehicleProcessingRecordRepository = vehicleProcessingRecordRepository;
    this.#notificationService = notificationService;
    this.#inventoryService = inventoryService;
    this.#db = db;
  }

  createCaseLines = async ({
    guaranteeCaseId,
    caselines,
    serviceCenterId,
    roleName,
    techId,
    companyId,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const guaranteeCase =
        await this.#validateInputGuaranteeCaseAndTechnicianForCaseLines(
          guaranteeCaseId,
          transaction,
          techId
        );

      const typeComponents =
        await this.#warehouseService.searchCompatibleComponentsInStock({
          serviceCenterId: serviceCenterId,
          modelId:
            guaranteeCase?.vehicleProcessingRecord?.vehicle?.vehicleModelId,
          vin: guaranteeCase?.vehicleProcessingRecord?.vehicle?.vin,
          odometer: guaranteeCase?.vehicleProcessingRecord?.odometer,
          companyId: companyId,
        });

      const typeComponentsMap =
        this.#buildTypeComponentWarrantyMap(typeComponents);

      const normalizedCaselines = caselines.map((caseline) => ({
        ...caseline,
        evidenceImageUrls: this.#normalizeEvidenceImageUrls(
          caseline.evidenceImageUrls
        ),
      }));

      this.#validateWarrantyConsistency(typeComponentsMap, normalizedCaselines);

      const processedCaselines = this.#assignInitialCaseLineStatuses(
        typeComponentsMap,
        normalizedCaselines
      );

      for (const caseline of processedCaselines) {
        if (
          caseline.status === "REJECTED_BY_TECH" &&
          !caseline.rejectionReason
        ) {
          throw new ConflictError(
            `Technician must provide a rejection reason if caseline with typeComponentId ${caseline.typeComponentId} is marked as REJECTED_BY_TECH`
          );
        }
      }

      const dataCaselines = processedCaselines.map((caseline) => ({
        ...caseline,
        guaranteeCaseId: guaranteeCaseId,
        diagnosticTechId: techId,
      }));

      const newCaseLines = await this.#caselineRepository.bulkCreate(
        dataCaselines,
        transaction
      );

      if (!newCaseLines) {
        throw new ConflictError("Failed to create case lines");
      }

      return newCaseLines;
    });

    return rawResult;
  };

  createCaseLine = async ({
    guaranteeCaseId,
    typeComponentId,
    quantity,
    diagnosisText,
    correctionText,
    warrantyStatus,
    serviceCenterId,
    techId,
    companyId,
    evidenceImageUrls,
    rejectionReason,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const guaranteeCase = await this.#guaranteeCaseRepository.findDetailById(
        { guaranteeCaseId: guaranteeCaseId },
        transaction
      );

      if (!guaranteeCase) {
        throw new NotFoundError("Guarantee case not found");
      }

      if (guaranteeCase.vehicleProcessingRecord.status !== "IN_DIAGNOSIS") {
        throw new BadRequestError("Record is WAITING_CUSTOMER_APPROVAL");
      }

      if (guaranteeCase.status !== "IN_DIAGNOSIS") {
        throw new BadRequestError(
          "Guarantee case is not in IN_DIAGNOSIS status"
        );
      }

      const typeComponents =
        await this.#warehouseService.searchCompatibleComponentsInStock({
          serviceCenterId: serviceCenterId,
          modelId:
            guaranteeCase?.vehicleProcessingRecord?.vehicle?.vehicleModelId,
          vin: guaranteeCase?.vehicleProcessingRecord?.vehicle?.vin,
          odometer: guaranteeCase?.vehicleProcessingRecord?.odometer,
          companyId: companyId,
        });

      const typeComponentsMap =
        this.#buildTypeComponentWarrantyMap(typeComponents);

      const normalizedImageUrls =
        this.#normalizeEvidenceImageUrls(evidenceImageUrls);

      const inputCaseline = {
        typeComponentId,
        quantity,
        diagnosisText,
        correctionText,
        warrantyStatus,
        rejectionReason:
          typeof rejectionReason === "string" ? rejectionReason : null,
        evidenceImageUrls: normalizedImageUrls,
      };

      this.#validateWarrantyConsistency(typeComponentsMap, [inputCaseline]);

      const [processedCaseline] = this.#assignInitialCaseLineStatuses(
        typeComponentsMap,
        [inputCaseline]
      );

      if (
        processedCaseline.status === "REJECTED_BY_TECH" &&
        !processedCaseline.rejectionReason
      ) {
        throw new ConflictError(
          `Technician must provide a rejection reason if caseline with typeComponentId ${processedCaseline.typeComponentId} is marked as REJECTED_BY_TECH`
        );
      }

      const newCaseLine = await this.#caselineRepository.createCaseLine(
        {
          guaranteeCaseId: guaranteeCaseId,
          typeComponentId: processedCaseline.typeComponentId,
          quantity: processedCaseline.quantity,
          diagnosisText: processedCaseline.diagnosisText,
          correctionText: processedCaseline.correctionText,
          status: processedCaseline.status,
          warrantyStatus: processedCaseline.warrantyStatus,
          rejectionReason: processedCaseline.rejectionReason,
          diagnosticTechId: techId,
          evidenceImageUrls: processedCaseline.evidenceImageUrls,
        },
        transaction
      );

      if (!newCaseLine) {
        throw new ConflictError("Failed to create case line");
      }

      return newCaseLine;
    });

    return rawResult;
  };

  getCaseLineById = async (
    { userId, roleName, caselineId, companyId, serviceCenterId },
    transaction = null,
    lock = null
  ) => {
    const caseLine = await this.#caselineRepository.findDetailById(
      caselineId,
      transaction,
      lock
    );

    if (!caseLine) {
      throw new NotFoundError("Case line not found");
    }

    const diagnosticTechId = caseLine?.diagnosticTechnician?.userId || null;
    const repairTechId = caseLine?.repairTechnician?.userId || null;

    if (roleName === "service_center_technician") {
      if (diagnosticTechId !== userId && repairTechId !== userId) {
        throw new ForbiddenError(
          "User does not have permission to access this case line"
        );
      }
    }

    const createdByStaff =
      caseLine.guaranteeCase?.vehicleProcessingRecord?.createdByStaff;

    const recordServiceCenterId = createdByStaff?.serviceCenterId || null;
    const recordCompanyId =
      createdByStaff?.vehicleCompanyId ||
      createdByStaff?.serviceCenter?.vehicleCompanyId ||
      null;

    const serviceCenterRoles = [
      "service_center_technician",
      "service_center_staff",
      "service_center_manager",
    ];

    if (serviceCenterRoles.includes(roleName)) {
      if (!serviceCenterId || !recordServiceCenterId) {
        throw new ForbiddenError(
          "Unable to verify service center ownership for this case line"
        );
      }

      if (recordServiceCenterId !== serviceCenterId) {
        throw new ForbiddenError(
          "User does not have permission to access this case line"
        );
      }
    }

    if (companyId && recordCompanyId && recordCompanyId !== companyId) {
      throw new ForbiddenError(
        "User does not have permission to access this case line"
      );
    }

    return caseLine;
  };

  getCaseLines = async ({
    page = 1,
    limit = 10,
    status,
    guaranteeCaseId,
    warrantyStatus,
    vehicleProcessingRecordId,
    diagnosticTechId,
    repairTechId,
    sortBy = "createdAt",
    sortOrder = "DESC",
    serviceCenterId,
  }) => {
    const result = await this.#caselineRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      guaranteeCaseId,
      warrantyStatus,
      vehicleProcessingRecordId,
      diagnosticTechId,
      repairTechId,
      sortBy,
      sortOrder,
      serviceCenterId,
    });

    return {
      caseLines: result.caseLines,
      pagination: result.pagination,
    };
  };

  allocateStockForCaseline = async ({
    caseId,
    caselineId,
    userId,
    serviceCenterId,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const { caseline } = await this.#validateCaseLine(
        caselineId,
        transaction
      );

      const guaranteeCaseIdFromCaseline =
        caseline.guaranteeCase?.guaranteeCaseId || caseline.guaranteeCaseId;

      if (
        caseId &&
        guaranteeCaseIdFromCaseline &&
        guaranteeCaseIdFromCaseline !== caseId
      ) {
        throw new ConflictError(
          "Caseline does not belong to the provided guarantee case"
        );
      }

      const resolvedGuaranteeCaseId = caseId || guaranteeCaseIdFromCaseline;

      if (!resolvedGuaranteeCaseId) {
        throw new NotFoundError(
          "Associated guarantee case not found for the caseline"
        );
      }

      const guaranteeCase = await this.#guaranteeCaseRepository.findDetailById(
        { guaranteeCaseId: resolvedGuaranteeCaseId },
        transaction
      );

      if (!guaranteeCase) {
        throw new NotFoundError("Guarantee case not found");
      }

      const serviceCenter =
        guaranteeCase.vehicleProcessingRecord?.createdByStaff?.serviceCenterId;

      if (!serviceCenter) {
        throw new BadRequestError(
          "Service center information is missing for the guarantee case"
        );
      }

      if (serviceCenter !== serviceCenterId) {
        throw new ForbiddenError(
          "User does not have permission to allocate stock for this case line"
        );
      }

      const existingReservations =
        await this.#componentReservationRepository.findByCaselineId(
          caselineId,
          transaction,
          Transaction.LOCK.UPDATE
        );

      const activeReservation = existingReservations.find((reservation) =>
        ["RESERVED", "PICKED_UP", "INSTALLED"].includes(reservation.status)
      );

      if (activeReservation) {
        throw new ConflictError(
          "An active reservation already exists for this caseline"
        );
      }

      const stocks =
        await this.#warehouseRepository.findStocksByTypeComponentOrderByWarehousePriority(
          {
            typeComponentIds: [caseline.typeComponentId],
            context: "SERVICE_CENTER",
            entityId:
              guaranteeCase.vehicleProcessingRecord?.createdByStaff
                ?.serviceCenterId,
            vehicleModelId:
              guaranteeCase?.vehicleProcessingRecord?.vehicle?.vehicleModelId,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      const stocksMap = new Map();
      for (const stock of stocks) {
        stocksMap.set(stock.stockId, stock);
      }

      await this.#validateStockAvailability(stocks, caseline);

      const reservations = this.#allocateStock({
        stocks,
        quantity: caseline.quantity,
      });

      if (!Array.isArray(reservations) || reservations.length === 0) {
        throw new ConflictError(
          "Unable to determine stock reservations for this caseline"
        );
      }

      const componentIds = await this.#collectComponentsFromReservations({
        reservations,
        caseline,
        stocksMap,
        transaction,
      });

      if (!Array.isArray(componentIds) || componentIds.length === 0) {
        throw new ConflictError(
          "Unable to collect components for the requested caseline"
        );
      }

      if (componentIds.length !== caseline.quantity) {
        throw new ConflictError(
          "Collected component quantity does not match requested caseline quantity"
        );
      }

      const componentReservationsToCreate = componentIds.map((componentId) => ({
        caseLineId: caselineId,
        componentId: componentId,
      }));

      if (componentReservationsToCreate.length === 0) {
        throw new ConflictError(
          "No component reservations generated for the requested caseline"
        );
      }

      const uniqueStockIds = [
        ...new Set(reservations.map((item) => item.stockId)),
      ];

      const [
        componentReservations,
        stockUpdates,
        componentStatusUpdates,
        caselineStatusUpdate,
      ] = await Promise.all([
        this.#componentReservationRepository.bulkCreate(
          { componentReservations: componentReservationsToCreate },
          transaction
        ),

        this.#warehouseRepository.bulkUpdateStockQuantities(
          reservations,
          transaction
        ),

        this.#componentRepository.bulkUpdateStatus(
          {
            componentIds: componentIds,
            status: "RESERVED",
          },
          transaction
        ),

        this.#caselineRepository.bulkUpdateStatusByIds(
          {
            caseLineIds: [caselineId],
            status: "READY_FOR_REPAIR",
          },
          transaction
        ),
      ]);

      if (
        !Array.isArray(componentReservations) ||
        componentReservations.length !== componentReservationsToCreate.length
      ) {
        throw new ConflictError(
          "Failed to create component reservations for this caseline"
        );
      }

      if (
        !Array.isArray(stockUpdates) ||
        stockUpdates.length !== uniqueStockIds.length
      ) {
        throw new ConflictError("Failed to update stock quantities");
      }

      if (componentStatusUpdates !== componentIds.length) {
        throw new ConflictError("Failed to update component statuses");
      }

      if (
        !Array.isArray(caselineStatusUpdate) ||
        caselineStatusUpdate.length === 0
      ) {
        throw new ConflictError("Failed to update caseline status");
      }

      return {
        componentReservations,
        stockUpdates,
        componentStatusUpdates,
        caselineStatusUpdate,
      };
    });

    const {
      componentReservations,
      stockUpdates,
      componentStatusUpdates,
      caselineStatusUpdate,
    } = rawResult;

    const stockIds = [
      ...new Set((stockUpdates || []).map((stock) => stock.stockId)),
    ];

    if (stockIds.length > 0) {
      await this.#inventoryService.emitLowStockAlerts({ stockIds });
    }

    const formattedCaselineStatus = caselineStatusUpdate.map((cl) => ({
      caselineId: cl.id,
      status: cl.status,
      updatedAt: formatUTCtzHCM(cl.updatedAt),
    }));

    return {
      componentReservations,
      stockUpdates,
      componentStatusUpdates,
      formattedCaselineStatus,
    };
  };

  approveCaseline = async ({
    approvedCaseLineIds,
    rejectedCaseLineIds,
    serviceCenterId,
  }) => {
    const arrayApproveIds = (approvedCaseLineIds ?? []).map((item) => item?.id);
    const arrayRejectIds = (rejectedCaseLineIds ?? []).map((item) => item?.id);

    const arrayIds = [...arrayApproveIds, ...arrayRejectIds];

    if (arrayIds.length === 0) {
      throw new ConflictError("No caselines provided for approval process");
    }

    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const caselines = await this.#caselineRepository.findByIds(
        { caseLineIds: arrayIds },
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!caselines || caselines.length === 0) {
        throw new NotFoundError("Caselines not found");
      }

      const firstCaselineDetail = await this.#caselineRepository.findDetailById(
        arrayIds[0],
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!firstCaselineDetail) {
        throw new NotFoundError("Caseline not found");
      }

      const vehicleProcessingRecordId =
        firstCaselineDetail.guaranteeCase?.vehicleProcessingRecord
          ?.vehicleProcessingRecordId;

      if (!vehicleProcessingRecordId) {
        throw new ConflictError(
          "Caseline is not associated with any vehicle processing record"
        );
      }

      const pendingApprovalIds =
        await this.#caselineRepository.findPendingApprovalIdsByVehicleProcessingRecordId(
          { vehicleProcessingRecordId },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (pendingApprovalIds.length === 0) {
        throw new ConflictError("No caselines awaiting customer approval");
      }

      const pendingSet = new Set(pendingApprovalIds);
      const providedSet = new Set(arrayIds);

      const missingIds = pendingApprovalIds.filter(
        (pendingId) => !providedSet.has(pendingId)
      );

      if (missingIds.length > 0) {
        throw new ConflictError(
          "All pending caselines for this record must be approved or rejected"
        );
      }

      const exceptionIds = arrayIds.filter((id) => !pendingSet.has(id));

      if (exceptionIds.length > 0) {
        throw new ConflictError(
          "Some caselines are not part of this record or not pending approval"
        );
      }

      for (const caseline of caselines) {
        if (caseline.status !== "PENDING_APPROVAL") {
          throw new ConflictError(
            `Caseline with ID ${caseline.id} is not in PENDING_APPROVAL status`
          );
        }

        if (caseline.warrantyStatus === "INELIGIBLE") {
          throw new ConflictError(
            `Caseline with ID ${caseline.id} has INELIGIBLE warranty status and cannot be actioned by customer`
          );
        }
      }

      const [updatedApprovedCaseLines, updatedRejectedCaseLines] =
        await Promise.all([
          arrayApproveIds.length > 0
            ? this.#caselineRepository.bulkUpdateStatusByIds(
                {
                  caseLineIds: arrayApproveIds,
                  status: "CUSTOMER_APPROVED",
                },
                transaction
              )
            : null,

          arrayRejectIds.length > 0
            ? this.#caselineRepository.bulkUpdateStatusByIds(
                {
                  caseLineIds: arrayRejectIds,
                  status: "REJECTED_BY_CUSTOMER",
                },
                transaction
              )
            : null,
        ]);

      const pendingCount =
        await this.#vehicleProcessingRecordRepository.countPendingApprovalByVehicleProcessingRecordId(
          vehicleProcessingRecordId,
          transaction
        );

      if (pendingCount === 0) {
        await this.#vehicleProcessingRecordRepository.updateStatus(
          {
            vehicleProcessingRecordId: vehicleProcessingRecordId,
            status: "PROCESSING",
          },
          transaction
        );

        const roomName = `service_center_manager_${serviceCenterId}`;
        const eventName = "vehicleProcessingRecordStatusUpdated";
        const data = {
          vehicleProcessingRecordId,
          status: "PROCESSING",
        };

        await this.#notificationService.sendToRoom(roomName, eventName, data);
      }

      return { updatedApprovedCaseLines, updatedRejectedCaseLines };
    });

    const { updatedApprovedCaseLines, updatedRejectedCaseLines } = rawResult;

    const formattedApprovedCaselines = updatedApprovedCaseLines
      ? this.#formatConfirmedCaseline(updatedApprovedCaseLines)
      : [];

    const formattedRejectedCaselines = updatedRejectedCaseLines
      ? this.#formatConfirmedCaseline(updatedRejectedCaseLines)
      : [];

    return {
      formattedApprovedCaselines,
      formattedRejectedCaselines,
    };
  };

  updateCaseLine = async ({
    guaranteeCaseId,
    caselineId,
    diagnosisText,
    correctionText,
    typeComponentId,
    quantity,
    warrantyStatus,
    rejectionReason,
    serviceCenterId,
    companyId,
    userId,
    evidenceImageUrls,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const caseline = await this.#caselineRepository.findById(
        caselineId,
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!caseline) {
        throw new NotFoundError("Caseline not found");
      }

      let updatedCaseline;

      if (caseline.status === "DRAFT") {
        const guaranteeCase =
          await this.#guaranteeCaseRepository.findDetailById(
            { guaranteeCaseId: guaranteeCaseId },
            transaction
          );

        if (!guaranteeCase) {
          throw new NotFoundError("Guarantee case not found");
        }

        const typeComponents =
          await this.#warehouseService.searchCompatibleComponentsInStock({
            serviceCenterId: serviceCenterId,
            modelId:
              guaranteeCase?.vehicleProcessingRecord?.vehicle?.vehicleModelId,
            vin: guaranteeCase?.vehicleProcessingRecord?.vehicle?.vin,
            odometer: guaranteeCase?.vehicleProcessingRecord?.odometer,
            companyId: companyId,
          });

        const typeComponentsMap =
          this.#buildTypeComponentWarrantyMap(typeComponents);

        if (typeComponentId) {
          const normalizedId = String(typeComponentId).toLowerCase();

          if (typeComponentsMap.has(normalizedId)) {
            const isUnderWarrantyByTech =
              warrantyStatus === "ELIGIBLE" ? true : false;

            const isUnderWarrantyBySystem = typeComponentsMap.get(normalizedId);

            if (!isUnderWarrantyBySystem && isUnderWarrantyByTech) {
              throw new ConflictError(
                "Component is marked as under warranty by technician but is out of warranty in system"
              );
            }
          }
        }

        if (warrantyStatus === "INELIGIBLE" && !rejectionReason) {
          throw new ConflictError(
            `Technician must provide a rejection reason if caseline with typeComponentId ${caseline.typeComponentId} is marked as REJECTED_BY_TECH`
          );
        }

        const initialStatus = "DRAFT";

        const normalizedEvidenceImageUrls =
          typeof evidenceImageUrls === "undefined"
            ? undefined
            : this.#normalizeEvidenceImageUrls(evidenceImageUrls);

        const updatePayload = {
          caselineId,
          diagnosisText,
          correctionText,
          typeComponentId,
          quantity,
          status: initialStatus,
          warrantyStatus,
          rejectionReason,
        };

        if (typeof normalizedEvidenceImageUrls !== "undefined") {
          updatePayload.evidenceImageUrls = normalizedEvidenceImageUrls;
        }

        updatedCaseline = await this.#caselineRepository.updateCaseline(
          updatePayload,
          transaction
        );

        if (!updatedCaseline) {
          throw new ConflictError("Failed to update caseline");
        }
      } else {
        throw new ConflictError(
          "Caseline can only be updated when it is in DRAFT status"
        );
      }

      if (caseline.diagnosticTechId !== userId) {
        throw new ForbiddenError("You are not allowed to update this caseline");
      }

      return updatedCaseline;
    });

    return rawResult;
  };

  assignTechnicianToRepairCaseline = async ({
    caselineId,
    technicianId,
    serviceCenterId,
  }) => {
    return await this.#db.sequelize.transaction(async (transaction) => {
      const caseline = await this.#caselineRepository.findById(
        caselineId,
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!caseline) {
        throw new NotFoundError("Caseline not found");
      }

      if (caseline.status !== "READY_FOR_REPAIR") {
        throw new ConflictError(
          `Caseline must be READY_FOR_REPAIR to assign technician. Current status: ${caseline.status}`
        );
      }

      const existingAssignment =
        await this.#taskAssignmentRepository.findByCaselineId(
          caselineId,
          transaction
        );

      if (existingAssignment) {
        throw new ConflictError(
          `Technician already assigned to this caseline. Current assignee: ${existingAssignment.technicianId}`
        );
      }

      const technician = await this.#userRepository.findUserById(
        { userId: technicianId },
        transaction
      );

      if (!technician) {
        throw new NotFoundError("Technician not found");
      }

      if (technician.serviceCenterId !== serviceCenterId) {
        throw new ConflictError(
          "Technician does not belong to this service center"
        );
      }

      if (technician.role.roleName !== "service_center_technician") {
        throw new ConflictError(
          "User is not a technician. Role must be service_center_technician"
        );
      }

      const activeTaskCount =
        await this.#taskAssignmentRepository.countActiveTasksByTechnician(
          technicianId,
          transaction
        );

      if (activeTaskCount >= technician.role.maxTasks) {
        throw new ConflictError(
          `Technician has reached the maximum limit of ${technician.role.maxTasks} active tasks.`
        );
      }

      const [taskAssignment, updatedCaseline] = await Promise.all([
        this.#taskAssignmentRepository.createTaskAssignmentForCaseline(
          {
            caseLineId: caselineId,
            technicianId,
            taskType: "REPAIR",
          },
          transaction
        ),

        this.#caselineRepository.assignTechnicianToRepairCaseline({
          caselineId,
          technicianId,
          transaction,
        }),
      ]);

      if (!taskAssignment) {
        throw new ConflictError("Failed to create task assignment");
      }

      if (!updatedCaseline) {
        throw new ConflictError(
          "Failed to update caseline with technician assignment"
        );
      }

      const roomName = `user_${technicianId}`;
      const eventName = "newRepairTaskAssigned";
      const data = {
        taskAssignment,
        caseline: updatedCaseline,
      };

      await this.#notificationService.sendToRoom(roomName, eventName, data);

      return {
        caseline: {
          caselineId: updatedCaseline.id,
          repairTechId: updatedCaseline.repairTechId,
          status: updatedCaseline.status,
          updatedAt: formatUTCtzHCM(updatedCaseline.updatedAt),
        },
        assignment: {
          taskAssignmentId: taskAssignment.taskAssignmentId,
          technicianId: taskAssignment.technicianId,
          technicianName: technician.name,
          taskType: taskAssignment.taskType,
          status: taskAssignment.status,
        },
      };
    });
  };

  markRepairCompleted = async (
    caselineId,
    userId,
    roleName,
    serviceCenterId,
    installationImageUrls
  ) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const caseline = await this.#caselineRepository.findById(
        caselineId,
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!caseline) {
        throw new NotFoundError("Caseline not found");
      }

      if (caseline.status !== "IN_REPAIR") {
        throw new ConflictError(
          `Caseline must be IN_REPAIR to be marked as completed. Current status: ${caseline.status}`
        );
      }

      if (caseline.repairTechId !== userId) {
        throw new ForbiddenError(
          "Only the assigned repair technician can mark this repair as complete"
        );
      }

      const guaranteeCase = caseline.guaranteeCase;
      const recordServiceCenterId =
        guaranteeCase?.vehicleProcessingRecord?.createdByStaff?.serviceCenterId;

      if (!recordServiceCenterId) {
        throw new ConflictError(
          "Cannot determine service center for this caseline"
        );
      }

      if (recordServiceCenterId !== serviceCenterId) {
        throw new ForbiddenError(
          "This caseline does not belong to your service center"
        );
      }

      const reservations =
        await this.#componentReservationRepository.findByCaselineId(
          caselineId,
          transaction,
          Transaction.LOCK.SHARE
        );

      if (reservations && reservations.length > 0) {
        for (const reservation of reservations) {
          const component = await this.#componentRepository.findById(
            reservation.componentId,
            transaction,
            Transaction.LOCK.SHARE
          );

          if (!component) {
            throw new NotFoundError(
              `Component ${reservation.componentId} not found`
            );
          }

          if (
            component.status !== "INSTALLED" ||
            !component.vehicleVin ||
            !component.installedAt
          ) {
            throw new ConflictError(
              `Component ${component.serialNumber} must be in INSTALLED status with valid vehicle VIN and installed date`
            );
          }

          if (reservation.status !== "INSTALLED") {
            throw new ConflictError(
              `Component reservation for ${component.serialNumber} must be in INSTALLED status`
            );
          }
        }
      }

      const updatedCaseline =
        await this.#caselineRepository.bulkUpdateStatusByIds(
          {
            caseLineIds: [caselineId],
            status: "COMPLETED",
          },
          transaction
        );

      if (!updatedCaseline) {
        throw new ConflictError(
          "Failed to update caseline status to COMPLETED"
        );
      }

      if (installationImageUrls && installationImageUrls.length > 0) {
        await this.#caselineRepository.updateInstallationImages(
          { caselineId, installationImageUrls },
          transaction
        );
      }

      const updatedTaskAssignment =
        await this.#taskAssignmentRepository.completeTaskByCaselineId(
          {
            caseLineId: caselineId,
            completedAt: formatUTCtzHCM(dayjs()),
            isActive: false,
          },
          transaction
        );

      if (!updatedTaskAssignment) {
        throw new ConflictError("Failed to complete task assignment");
      }

      const vehicleProcessingRecordId =
        guaranteeCase.vehicleProcessingRecord.vehicleProcessingRecordId;

      const allCaseLinesInRecord =
        await this.#caselineRepository.findByProcessingRecordId(
          { vehicleProcessingRecordId },
          transaction,
          Transaction.LOCK.UPDATE
        );

      const allCaseLinesCompleted =
        allCaseLinesInRecord.length > 0 &&
        allCaseLinesInRecord.every((cl) =>
          this.#isFinalCaseLineStatus(cl.status)
        );

      if (allCaseLinesCompleted) {
        const updatedRecord =
          await this.#vehicleProcessingRecordRepository.updateStatus(
            {
              vehicleProcessingRecordId,
              status: "READY_FOR_PICKUP",
            },
            transaction
          );

        const roomName = `service_center_staff_${serviceCenterId}`;
        const eventName = "vehicleProcessingRecordStatusUpdated";
        const data = {
          roomName,
          updatedRecord,
        };

        await this.#notificationService.sendToRoom(roomName, eventName, data);
      }

      return { updatedCaseline, updatedTaskAssignment };
    });

    return rawResult;
  };

  #formatConfirmedCaseline = (caselines) => {
    return caselines.map((cl) => ({
      caselineId: cl.id,
      status: cl.status,
      updatedAt: formatUTCtzHCM(cl.updatedAt),
    }));
  };

  #buildTypeComponentWarrantyMap = (typeComponents) => {
    const map = new Map();

    if (!Array.isArray(typeComponents)) {
      return map;
    }

    for (const component of typeComponents) {
      const typeComponentId = component?.typeComponentId;

      if (!typeComponentId) {
        continue;
      }

      const normalizedId = String(typeComponentId).toLowerCase();
      const isUnderWarranty = Boolean(component?.isUnderWarranty);
      const quantityLimit = component?.quantityLimit || null;

      if (!map.has(normalizedId)) {
        map.set(normalizedId, { isUnderWarranty, quantityLimit });
        continue;
      }

      const existing = map.get(normalizedId);
      if (isUnderWarranty) {
        existing.isUnderWarranty = true;
      }
      // Prefer non-null quantity limit if duplicate
      if (quantityLimit !== null) {
        existing.quantityLimit = quantityLimit;
      }
    }

    return map;
  };

  #isFinalCaseLineStatus = (status) => {
    const FINAL_STATUSES = new Set([
      "COMPLETED",
      "CANCELLED",
      "REJECTED_BY_OUT_OF_WARRANTY",
      "REJECTED_BY_TECH",
      "REJECTED_BY_CUSTOMER",
    ]);

    return FINAL_STATUSES.has(status);
  };

  #allocateStock = ({ stocks, quantity }) => {
    let quantityNeed = quantity;
    const reservations = [];
    for (const stock of stocks) {
      const quantityCantake = Math.min(quantityNeed, stock.quantityAvailable);

      if (quantityCantake) {
        reservations.push({
          stockId: stock.stockId,
          quantityReserved: quantityCantake,
        });

        quantityNeed -= quantityCantake;
      }

      if (quantityNeed <= 0) {
        return reservations;
      }
    }

    if (reservations.length === 0) {
      throw new ConflictError("No stock available for allocation");
    }

    return reservations;
  };

  #validateInputGuaranteeCaseAndTechnicianForCaseLines = async (
    guaranteeCaseId,
    transaction,
    techId
  ) => {
    const guaranteeCase = await this.#guaranteeCaseRepository.findDetailById(
      { guaranteeCaseId: guaranteeCaseId },
      transaction
    );

    if (!guaranteeCase) {
      throw new NotFoundError("Guarantee case not found");
    }

    const isTechMain = techId === guaranteeCase.leadTechId;

    if (!isTechMain) {
      throw new ConflictError(
        "Technician is not the main technician for caselines"
      );
    }

    return guaranteeCase;
  };

  #validateWarrantyConsistency = (typeComponentsMap, caselines) => {
    if (
      !typeComponentsMap ||
      !(typeComponentsMap instanceof Map) ||
      !Array.isArray(caselines)
    ) {
      throw new Error("Invalid arguments for validateWarrantyConsistency");
    }

    for (const caseline of caselines) {
      if (!caseline?.typeComponentId) continue;

      const normalizedId = String(caseline.typeComponentId).toLowerCase();

      if (typeComponentsMap.has(normalizedId)) {
        const isUnderWarrantyByTech =
          caseline.warrantyStatus === "ELIGIBLE" ? true : false;

        const componentInfo = typeComponentsMap.get(normalizedId);
        const isUnderWarrantyBySystem = componentInfo?.isUnderWarranty;
        const quantityLimit = componentInfo?.quantityLimit;

        if (
          quantityLimit !== null &&
          quantityLimit !== undefined &&
          caseline.quantity > quantityLimit
        ) {
          throw new ConflictError(
            `Quantity ${caseline.quantity} exceeds the limit of ${quantityLimit} for this component`
          );
        }

        if (!isUnderWarrantyBySystem && isUnderWarrantyByTech) {
          throw new ConflictError(
            "Component is marked as under warranty by technician but is out of warranty in system"
          );
        }
      }
    }
  };

  #assignInitialCaseLineStatuses = (typeComponentsMap, caselines) => {
    const processedCaselines = [];

    for (const caseline of caselines) {
      const newCaseline = { ...caseline };

      const warrantyStatusByTech = newCaseline.warrantyStatus;

      const normalizedId = newCaseline.typeComponentId
        ? String(newCaseline.typeComponentId).toLowerCase()
        : null;

      const componentInfo = normalizedId
        ? typeComponentsMap.get(normalizedId)
        : undefined;
      const systemWarrantyStatus = componentInfo?.isUnderWarranty;

      let initialStatus;

      if (systemWarrantyStatus && warrantyStatusByTech === "ELIGIBLE") {
        initialStatus = "DRAFT";
      } else if (
        systemWarrantyStatus &&
        warrantyStatusByTech === "INELIGIBLE"
      ) {
        initialStatus = "REJECTED_BY_TECH";
      } else {
        initialStatus = "REJECTED_BY_OUT_OF_WARRANTY";
      }

      newCaseline.status = initialStatus;
      processedCaselines.push(newCaseline);
    }

    return processedCaselines;
  };

  #normalizeEvidenceImageUrls = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((url) => (typeof url === "string" ? url.trim() : null))
        .filter((url) => Boolean(url));
    }

    return [];
  };

  #validateCaseLine = async (caselineId, transaction) => {
    const caseline = await this.#caselineRepository.findById(
      caselineId,
      transaction,
      Transaction.LOCK.UPDATE
    );

    if (!caseline) {
      throw new NotFoundError("Caseline not found");
    }

    const allowedStatuses = [
      "CUSTOMER_APPROVED",
      "WAITING_FOR_PARTS",
      "PARTS_AVAILABLE",
    ];

    if (!allowedStatuses.includes(caseline.status)) {
      throw new ConflictError(
        "Caseline must be in CUSTOMER_APPROVED, WAITING_FOR_PARTS, or PARTS_AVAILABLE status to allocate stock"
      );
    }

    const guaranteeCase = caseline?.guaranteeCase;

    if (!guaranteeCase) {
      throw new NotFoundError(
        "Associated guarantee case not found for the caseline"
      );
    }

    return { caseline };
  };

  #validateStockAvailability = async (stocks, caseline) => {
    const totalAvailable =
      stocks?.reduce((total, stock) => total + stock.quantityAvailable, 0) || 0;

    if (totalAvailable < caseline.quantity) {
      const missingQuantity = caseline.quantity - totalAvailable;
      throw new ConflictError(
        `Insufficient stock available for allocation. Missing ${missingQuantity} units.`
      );
    }
  };

  #collectComponentsFromReservations = async ({
    reservations,
    caseline,
    stocksMap,
    transaction,
  }) => {
    const allComponents = [];
    for (const reservation of reservations) {
      const stock = stocksMap.get(reservation.stockId);

      if (!stock) {
        throw new NotFoundError(
          `Stock with ID ${reservation.stockId} not found`
        );
      }

      const components =
        await this.#componentRepository.findAvailableComponents(
          {
            typeComponentId: caseline.typeComponentId,
            warehouseId: stock.warehouse.warehouseId,
            limit: reservation.quantityReserved,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (components.length < reservation.quantityReserved) {
        throw new ConflictError(
          `Insufficient available components in warehouse ${stock.warehouse?.warehouseId}. ` +
            `Requested: ${reservation.quantityReserved}, Available: ${components.length}`
        );
      }

      allComponents.push(...components);
    }

    if (allComponents.length === 0) {
      throw new ConflictError("No components collected from reservations");
    }

    const componentIds = allComponents.map(
      (component) => component.componentId
    );

    return componentIds;
  };
}

export default CaseLineService;
