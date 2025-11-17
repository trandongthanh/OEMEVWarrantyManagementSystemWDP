import db from "../models/index.cjs";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../error/index.js";

import { formatUTCtzHCM } from "../util/formatUTCtzHCM.js";
import { Transaction } from "sequelize";
import dayjs from "dayjs";

class VehicleProcessingRecordService {
  #notificationService;
  #vehicleProcessingRecordRepository;
  #guaranteeCaseRepository;
  #vehicleRepository;
  #taskAssignmentRepository;
  #userRepository;
  #caselineRepository;
  #workScheduleRepository;
  #vehicleService;
  #mailService;

  constructor({
    vehicleProcessingRecordRepository,
    guaranteeCaseRepository,
    vehicleRepository,
    notificationService,
    userRepository,
    taskAssignmentRepository,
    caselineRepository,
    workScheduleRepository,
    vehicleService,
    mailService,
  }) {
    this.#vehicleProcessingRecordRepository = vehicleProcessingRecordRepository;
    this.#guaranteeCaseRepository = guaranteeCaseRepository;
    this.#vehicleRepository = vehicleRepository;
    this.#taskAssignmentRepository = taskAssignmentRepository;
    this.#notificationService = notificationService;
    this.#userRepository = userRepository;
    this.#caselineRepository = caselineRepository;
    this.#workScheduleRepository = workScheduleRepository;
    this.#vehicleService = vehicleService;
    this.#mailService = mailService;
  }

  createRecord = async (params) => {
    const { createdByStaffId, companyId, vin, odometer, serviceCenterId } =
      params;

    if (!createdByStaffId || !companyId) {
      throw new ForbiddenError("You don't have permission to create record");
    }

    if (!serviceCenterId) {
      throw new BadRequestError("serviceCenterId is required to create record");
    }

    if (
      !Array.isArray(params?.guaranteeCases) ||
      params.guaranteeCases.length === 0
    ) {
      throw new BadRequestError(
        "At least one guarantee case is required to create a record"
      );
    }

    const parsedOdometer = Number(odometer);
    if (!Number.isFinite(parsedOdometer) || parsedOdometer < 0) {
      throw new BadRequestError("Odometer must be a non-negative number");
    }

    await this.#validateWarrantyStatus(vin, companyId, parsedOdometer);

    const normalizedParams = {
      ...params,
      odometer: parsedOdometer,
    };

    const { newRecord, newGuaranteeCases, owner } =
      await db.sequelize.transaction(async (t) => {
        const vehicle = await this.#validateVehicleForCreation(
          vin,
          companyId,
          t
        );
        await this.#validateOdometerProgression({
          vin,
          odometer: parsedOdometer,
          transaction: t,
        });
        const { newRecord, newGuaranteeCases } =
          await this.#createRecordAndGuaranteeCases(normalizedParams, t);
        return { newRecord, newGuaranteeCases, owner: vehicle.owner };
      });

    this.#sendNotifications(
      owner,
      vin,
      newRecord,
      serviceCenterId,
      newRecord.trackingToken
    );

    return this.#formatCreateRecordResponse(newRecord, newGuaranteeCases);
  };

  #validateWarrantyStatus = async (vin, companyId, odometer) => {
    const warrantyStatus =
      await this.#vehicleService.findVehicleByVinWithWarranty({
        vin,
        companyId,
        odometer,
      });

    const generalDurationStatus =
      warrantyStatus?.generalWarranty?.duration?.status;
    const generalMileageStatus =
      warrantyStatus?.generalWarranty?.mileage?.status;
    const hasGeneralWarranty =
      generalDurationStatus === "ACTIVE" && generalMileageStatus === "ACTIVE";

    const hasComponentWarranty = (
      warrantyStatus?.componentWarranties ?? []
    ).some(
      (cw) =>
        cw?.duration?.status === "ACTIVE" && cw?.mileage?.status === "ACTIVE"
    );

    if (!hasGeneralWarranty && !hasComponentWarranty) {
      throw new ConflictError(
        "Vehicle and all components are out of warranty, cannot create a record"
      );
    }
  };

  #validateVehicleForCreation = async (vin, companyId, transaction) => {
    const existingVehicle = await this.#vehicleRepository.findByVinAndCompany(
      { vin, companyId },
      transaction,
      Transaction.LOCK.SHARE
    );

    if (!existingVehicle) {
      throw new NotFoundError(`Cannot find vehicle with ${vin}`);
    }

    if (!existingVehicle?.owner) {
      throw new NotFoundError(
        `Vehicle with ${vin} does not have an owner, cannot create a record`
      );
    }

    const existingRecord =
      await this.#vehicleProcessingRecordRepository.findRecordIsNotCompleted(
        { vin },
        transaction,
        Transaction.LOCK.SHARE
      );

    if (existingRecord) {
      throw new ConflictError("Vehicle already has an active record");
    }

    return existingVehicle;
  };

  #validateOdometerProgression = async ({ vin, odometer, transaction }) => {
    const latestRecord =
      await this.#vehicleProcessingRecordRepository.findLatestRecordByVin(
        { vin },
        transaction,
        Transaction.LOCK.SHARE
      );

    if (!latestRecord) {
      return;
    }

    const previousOdometer = Number(latestRecord.odometer);
    const currentOdometer = Number(odometer);

    if (Number.isNaN(currentOdometer)) {
      throw new BadRequestError("Odometer must be a valid number");
    }

    if (
      !Number.isNaN(previousOdometer) &&
      currentOdometer <= previousOdometer
    ) {
      throw new ConflictError(
        `New odometer (${currentOdometer}) must be greater than the last record odometer (${previousOdometer})`
      );
    }
  };

  #createRecordAndGuaranteeCases = async (
    { odometer, createdByStaffId, vin, visitorInfo, guaranteeCases },
    transaction
  ) => {
    const newRecord =
      await this.#vehicleProcessingRecordRepository.createRecord(
        {
          odometer,
          createdByStaffId,
          vin,
          visitorInfo,
          checkInDate: dayjs(),
        },
        transaction
      );

    if (!newRecord) {
      throw new Error("Failed to create vehicle processing record");
    }

    const dataGuaranteeCaseToCreate = guaranteeCases.map((guaranteeCase) => ({
      ...guaranteeCase,
      vehicleProcessingRecordId: newRecord.vehicleProcessingRecordId,
    }));

    const newGuaranteeCases =
      await this.#guaranteeCaseRepository.createGuaranteeCases(
        { guaranteeCases: dataGuaranteeCaseToCreate },
        transaction
      );

    if (!newGuaranteeCases || newGuaranteeCases.length === 0) {
      throw new Error("Failed to create guarantee cases");
    }

    return { newRecord, newGuaranteeCases };
  };

  #sendNotifications = (
    owner,
    vin,
    newRecord,
    serviceCenterId,
    trackingToken
  ) => {
    if (owner && owner.email && trackingToken) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const trackingUrl = `${frontendUrl}/track?token=${trackingToken}`;
      const subject = `Your Vehicle Service Tracking Link for VIN ${vin}`;
      const html = `
        <p>Dear ${owner.fullName},</p>
        <p>Thank you for bringing your vehicle (VIN: ${vin}) for service. You can track the status of your service request using the link below:</p>
        <p><a href="${trackingUrl}">${trackingUrl}</a></p>
        <p>Thank you,</p>
        <p>EMV-OEM Service Team</p>
      `;
      this.#mailService
        .sendMail(
          owner.email,
          subject,
          `Your tracking link is: ${trackingUrl}`,
          html
        )
        .catch((err) => {
          console.error("Failed to send tracking email:", err);
        });
    }

    const room = `service_center_manager_${serviceCenterId}`;
    const event = "new_record_notification";
    const payload = {
      message: "A new vehicle processing record has been created",
      record: {
        ...newRecord,
        createdAt: formatUTCtzHCM(newRecord.createdAt),
      },
      room: room,
      sendAt: dayjs(),
    };

    this.#notificationService.sendToRoom(room, event, payload);
  };

  #formatCreateRecordResponse = (newRecord, newGuaranteeCases) => {
    const formatGuaranteeCases = newGuaranteeCases.map((guaranteeCase) => ({
      ...guaranteeCase,
      createdAt: formatUTCtzHCM(newRecord.createdAt),
    }));

    return {
      ...newRecord,
      createdAt: formatUTCtzHCM(newRecord.createdAt),
      guaranteeCases: formatGuaranteeCases,
    };
  };

  cancelRecord = async ({
    vehicleProcessingRecordId,
    reason,
    serviceCenterId,
    roleName,
    userId,
  }) => {
    const ALLOWED_RECORD_STATUSES = new Set([
      "CHECKED_IN",
      "IN_DIAGNOSIS",
      "WAITING_CUSTOMER_APPROVAL",
      "PROCESSING",
    ]);

    const PROHIBITED_CASELINE_STATUSES = new Set([
      "READY_FOR_REPAIR",
      "PARTS_AVAILABLE",
      "IN_REPAIR",
      "COMPLETED",
    ]);

    const FINAL_CASELINE_STATUSES = new Set([
      "COMPLETED",
      "CANCELLED",
      "REJECTED_BY_OUT_OF_WARRANTY",
      "REJECTED_BY_TECH",
      "REJECTED_BY_CUSTOMER",
    ]);

    const rawResult = await db.sequelize.transaction(async (transaction) => {
      const record =
        await this.#vehicleProcessingRecordRepository.findDetailById(
          {
            id: vehicleProcessingRecordId,
            roleName,
            userId,
            serviceCenterId,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!record) {
        throw new NotFoundError("Vehicle processing record not found");
      }

      if (record.status === "CANCELLED") {
        throw new ConflictError("Record has already been cancelled");
      }

      if (
        record.status === "READY_FOR_PICKUP" ||
        record.status === "COMPLETED"
      ) {
        throw new ConflictError(
          "Record cannot be cancelled once repair has been completed"
        );
      }

      if (!ALLOWED_RECORD_STATUSES.has(record.status)) {
        throw new ConflictError(
          `Record with status ${record.status} cannot be cancelled`
        );
      }

      const guaranteeCases = record.guaranteeCases || [];

      const caseLineIdsToCancel = [];
      const guaranteeCaseIds = [];

      for (const guaranteeCase of guaranteeCases) {
        if (guaranteeCase?.guaranteeCaseId) {
          guaranteeCaseIds.push(guaranteeCase.guaranteeCaseId);
        }

        const caseLines = guaranteeCase?.caseLines || [];

        for (const caseLine of caseLines) {
          const status = caseLine?.status;

          if (PROHIBITED_CASELINE_STATUSES.has(status)) {
            throw new ConflictError(
              `Cannot cancel record because caseline ${caseLine.id} is ${status}`
            );
          }

          if (!FINAL_CASELINE_STATUSES.has(status)) {
            caseLineIdsToCancel.push(caseLine.id);
          }
        }
      }

      let cancelledCaseLines = [];
      if (caseLineIdsToCancel.length > 0) {
        cancelledCaseLines =
          await this.#caselineRepository.bulkUpdateStatusByIds(
            {
              caseLineIds: caseLineIdsToCancel,
              status: "CANCELLED",
            },
            transaction,
            Transaction.LOCK.UPDATE
          );
      }

      let cancelledGuaranteeCases = [];
      if (guaranteeCaseIds.length > 0) {
        cancelledGuaranteeCases =
          await this.#guaranteeCaseRepository.bulkUpdateStatus(
            {
              guaranteeCaseIds,
              status: "CANCELLED",
            },
            transaction,
            Transaction.LOCK.UPDATE
          );
      }

      await this.#taskAssignmentRepository.cancelDiagnosisTaskByRecordId(
        { vehicleProcessingRecordId },
        transaction
      );

      const updatedRecord =
        await this.#vehicleProcessingRecordRepository.updateStatus(
          {
            vehicleProcessingRecordId,
            status: "CANCELLED",
          },
          transaction
        );

      return {
        record: updatedRecord,
        cancelledCaseLines,
        cancelledGuaranteeCases,
      };
    });

    const roomName = `service_center_staff_${serviceCenterId}`;
    const eventName = "vehicleProcessingRecordStatusUpdated";
    const notificationPayload = {
      roomName,
      record: rawResult.record,
      status: "CANCELLED",
      reason: reason ?? null,
    };

    await this.#notificationService.sendToRoom(
      roomName,
      eventName,
      notificationPayload
    );

    return {
      vehicleProcessingRecordId: rawResult.record.vehicleProcessingRecordId,
      status: rawResult.record.status,
      cancelledCaseLineIds: rawResult.cancelledCaseLines.map((cl) => cl.id),
      cancelledGuaranteeCaseIds: rawResult.cancelledGuaranteeCases.map(
        (gc) => gc.guaranteeCaseId
      ),
      reason: reason ?? null,
    };
  };

  updateMainTechnician = async ({
    vehicleProcessingRecordId,
    technicianId,
    serviceCenterId,
    roleName,
    userId,
  }) => {
    let oldTechnicianId = null;

    const rawResult = await db.sequelize.transaction(async (t) => {
      const technician = await this.#userRepository.findUserById(
        { userId: technicianId },
        t
      );
      if (!technician) {
        throw new NotFoundError("Technician not found");
      }

      await this.#canAssignTask({
        serviceCenterId: serviceCenterId,
        technician: technician,
        vehicleProcessingRecordId: vehicleProcessingRecordId,
        transaction: t,
        lock: Transaction.LOCK.UPDATE,
      });

      const existingRecord =
        await this.#vehicleProcessingRecordRepository.findDetailById(
          {
            id: vehicleProcessingRecordId,
            roleName,
            userId,
            serviceCenterId: serviceCenterId,
          },
          t,
          Transaction.LOCK.UPDATE
        );

      if (!existingRecord) {
        throw new NotFoundError("Record not found.");
      }

      oldTechnicianId = existingRecord?.mainTechnician?.userId;

      if (oldTechnicianId === technicianId) {
        throw new ConflictError(
          "Technician is already assigned to this record as main technician"
        );
      }

      const schedule = await this.#workScheduleRepository.getMySchedule({
        technicianId: technicianId,
        workDate: dayjs().format("YYYY-MM-DD"),
      });

      if (!schedule) {
        throw new ConflictError(
          "Technician does not have a work schedule for today. Please create a schedule first."
        );
      }

      if (schedule.status !== "AVAILABLE") {
        throw new ConflictError(
          `Technician is not available on the work date. Current status: ${schedule.status}`
        );
      }

      const activeTaskCount =
        await this.#taskAssignmentRepository.countActiveTasksByTechnician(
          technicianId,
          t
        );
      if (activeTaskCount >= technician.role.maxTasks) {
        throw new ConflictError(
          `Technician has reached the maximum limit of ${technician.role.maxTasks} active tasks.`
        );
      }

      if (oldTechnicianId && oldTechnicianId !== technicianId) {
        const affectedRows =
          await this.#taskAssignmentRepository.cancelDiagnosisTaskByRecordId(
            {
              vehicleProcessingRecordId: vehicleProcessingRecordId,
            },
            t
          );

        if (affectedRows === 0) {
          throw new ConflictError(
            `No active diagnosis task found for old technician ${oldTechnicianId}. Data may be inconsistent or the task was already cancelled.`
          );
        }
      }

      const [updatedRecord, updatedGuaranteeCases, newTaskAssignment] =
        await Promise.all([
          this.#vehicleProcessingRecordRepository.updateMainTechnician(
            {
              vehicleProcessingRecordId: vehicleProcessingRecordId,
              technicianId: technicianId,
            },
            t
          ),

          this.#guaranteeCaseRepository.updateMainTechnician(
            {
              vehicleProcessingRecordId: vehicleProcessingRecordId,
              technicianId: technicianId,
            },
            t
          ),

          this.#taskAssignmentRepository.createDiagnosisTaskForRecord(
            {
              vehicleProcessingRecordId: vehicleProcessingRecordId,
              technicianId: technicianId,
            },
            t
          ),
        ]);

      return { updatedRecord, updatedGuaranteeCases, newTaskAssignment };
    });

    const { updatedRecord, updatedGuaranteeCases, newTaskAssignment } =
      rawResult;

    if (updatedRecord === 0) {
      throw new NotFoundError("Record not found or not updated.");
    }

    if (updatedGuaranteeCases === 0) {
      throw new Error("Guarantee cases were not updated.");
    }

    if (!newTaskAssignment) {
      throw new Error(
        "Failed to create a task assignment for the technician. Please try again."
      );
    }

    const formatUpdatedRecord = {
      recordId: updatedRecord?.vehicleProcessingRecordId,
      vin: updatedRecord?.vin,
      status: updatedRecord?.status,
      technician: updatedRecord?.mainTechnician,
      updatedCases: updatedGuaranteeCases.map((guaranteeCase) => ({
        caseId: guaranteeCase?.guaranteeCaseId,
        status: guaranteeCase?.status,
        leadTech: guaranteeCase?.leadTechId,
      })),
      assignment: {
        assignmentId: newTaskAssignment?.taskAssignmentId,
        vehicleProcessingRecordId: newTaskAssignment?.vehicleProcessingRecordId,
        technicianId: newTaskAssignment?.technicianId,
        taskType: newTaskAssignment?.taskType,
        assignedAt: formatUTCtzHCM(newTaskAssignment?.assignedAt),
      },
    };

    if (oldTechnicianId && oldTechnicianId !== technicianId) {
      const oldTechRoom = `user_${oldTechnicianId}`;
      const unassignPayload = {
        message: "You have been unassigned from a diagnosis task.",
        recordId: updatedRecord?.vehicleProcessingRecordId,
        vin: updatedRecord?.vin,
        reason: "Reassigned to another technician",
        timestamp: formatUTCtzHCM(dayjs()),
        room: oldTechRoom,
      };

      this.#notificationService.sendToRoom(
        oldTechRoom,
        "task_unassigned_notification",
        unassignPayload
      );
    }

    const room = `user_${technicianId}`;
    const event = "new_task_assignment_notification";
    const payload = {
      message: "You have been assigned a new diagnosis task.",
      assignmentDetails: formatUpdatedRecord,
      timestamp: dayjs(),
      room: room,
    };

    this.#notificationService.sendToRoom(room, event, payload);

    return formatUpdatedRecord;
  };

  findDetailById = async ({ id, userId, roleName, serviceCenterId }) => {
    if (!id) {
      throw new BadRequestError("RecordId is required");
    }

    const record = await this.#vehicleProcessingRecordRepository.findDetailById(
      {
        id,
        roleName,
        userId,
        serviceCenterId,
      }
    );

    if (!record) {
      throw new NotFoundError("Record not found");
    }

    return record;
  };

  getAllRecords = async ({
    serviceCenterId,
    userId,
    roleName,
    page,
    limit,
    status,
    startDate,
    endDate,
  }) => {
    if (!serviceCenterId) {
      throw new BadRequestError("serviceCenterId is required");
    }

    const offset = (page - 1) * limit;

    const limitNumber = parseInt(limit);
    const offsetNumber = parseInt(offset);

    const records = await this.#vehicleProcessingRecordRepository.findAll({
      serviceCenterId: serviceCenterId,
      limit: limitNumber,
      offset: offsetNumber,
      status: status,
      userId: userId,
      roleName: roleName,
      startDate: startDate,
      endDate: endDate,
    });

    if (!records || records.length === 0) {
      return [];
    }

    return records;
  };

  completeRecord = async ({ vehicleProcessingRecordId }) => {
    const completedRecord = await db.sequelize.transaction(
      async (transaction) => {
        await this.#findAndValidateRecord(
          vehicleProcessingRecordId,
          transaction
        );

        await this.#validateGuaranteeCases(
          vehicleProcessingRecordId,

          transaction
        );

        await this.#validateCaseLines(vehicleProcessingRecordId, transaction);

        return this.#vehicleProcessingRecordRepository.completeRecord(
          {
            vehicleProcessingRecordId,

            status: "COMPLETED",

            checkOutDate: new Date(),
          },

          transaction
        );
      }
    );

    if (!completedRecord) {
      return null;
    }

    return {
      ...completedRecord,

      checkOutDate: completedRecord.checkOutDate
        ? formatUTCtzHCM(completedRecord.checkOutDate)
        : null,
    };
  };

  #findAndValidateRecord = async (vehicleProcessingRecordId, transaction) => {
    const record = await this.#vehicleProcessingRecordRepository.findByPk(
      vehicleProcessingRecordId,
      transaction,
      Transaction.LOCK.UPDATE
    );

    if (!record) {
      throw new NotFoundError(
        `Processing record with ID ${vehicleProcessingRecordId} not found`
      );
    }

    const validStatuses = ["READY_FOR_PICKUP"];
    if (!validStatuses.includes(record.status)) {
      throw new ConflictError(
        `Cannot complete record with status ${
          record.status
        }. Record must be in one of these statuses: ${validStatuses.join(", ")}`
      );
    }

    return record;
  };

  #validateGuaranteeCases = async (vehicleProcessingRecordId, transaction) => {
    const guaranteeCases = await this.#guaranteeCaseRepository.findByRecordId(
      { vehicleProcessingRecordId },
      transaction
    );

    if (!guaranteeCases || guaranteeCases.length === 0) {
      throw new NotFoundError("No guarantee cases found for this record");
    }

    for (const gc of guaranteeCases) {
      if (gc.status !== "DIAGNOSED") {
        throw new ConflictError(
          `Cannot complete record because guarantee case with ID ${gc.guaranteeCaseId} is in status ${gc.status}. All guarantee cases must be DIAGNOSED before completing the record.`
        );
      }
    }
  };

  #validateCaseLines = async (vehicleProcessingRecordId, transaction) => {
    const allCaseLines =
      await this.#caselineRepository.findByProcessingRecordId(
        { vehicleProcessingRecordId },
        transaction,
        Transaction.LOCK.UPDATE
      );

    for (const caseLine of allCaseLines) {
      const finalStatuses = [
        "COMPLETED",
        "CANCELLED",
        "REJECTED_BY_OUT_OF_WARRANTY",
        "REJECTED_BY_TECH",
        "REJECTED_BY_CUSTOMER",
      ];
      if (!finalStatuses.includes(caseLine.status)) {
        throw new ConflictError(
          `Cannot complete record because case line with ID ${
            caseLine.id
          } is in status ${
            caseLine.status
          }. All case lines must be in a final state (${finalStatuses.join(
            ", "
          )}) before completing the record.`
        );
      }
    }
  };

  makeDiagnosisCompleted = async ({
    userId,
    roleName,
    serviceCenterId,
    vehicleProcessingRecordId,
  }) => {
    const rawResult = await db.sequelize.transaction(async (transaction) => {
      const vehicleProcessingRecord =
        await this.#vehicleProcessingRecordRepository.findDetailById(
          {
            id: vehicleProcessingRecordId,
            roleName,
            userId,
            serviceCenterId: serviceCenterId,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!vehicleProcessingRecord) {
        throw new NotFoundError("Vehicle processing record not found");
      }

      const guaranteeCases = vehicleProcessingRecord?.guaranteeCases || [];

      const allCaseLines = guaranteeCases.flatMap(
        (guaranteeCase) => guaranteeCase.caseLines || []
      );
      const hasCaseLines = allCaseLines.length > 0;
      const allRejectedByTech =
        hasCaseLines &&
        allCaseLines.every(
          (caseLine) => caseLine.status === "REJECTED_BY_TECH"
        );

      if (allRejectedByTech) {
        const guaranteeCaseIds = guaranteeCases
          .map((guaranteeCase) => guaranteeCase.guaranteeCaseId)
          .filter(Boolean);

        let cancelledGuaranteeCases = [];
        if (guaranteeCaseIds.length > 0) {
          cancelledGuaranteeCases =
            await this.#guaranteeCaseRepository.bulkUpdateStatus(
              {
                guaranteeCaseIds,
                status: "CANCELLED",
              },
              transaction,
              Transaction.LOCK.UPDATE
            );
        }

        const cancelledRecord =
          await this.#vehicleProcessingRecordRepository.updateStatus(
            {
              vehicleProcessingRecordId: vehicleProcessingRecordId,
              status: "CANCELLED",
            },
            transaction
          );

        const recordDetail =
          await this.#vehicleProcessingRecordRepository.findDetailById(
            {
              id: vehicleProcessingRecordId,
              roleName,
              userId,
              serviceCenterId,
            },
            transaction
          );

        return {
          record: recordDetail,
          updatedGuaranteeCases: cancelledGuaranteeCases,
          updatedCaseLines: [],
          updatedRecord: cancelledRecord,
        };
      }

      for (const guaranteeCase of guaranteeCases) {
        if (guaranteeCase.status !== "IN_DIAGNOSIS") {
          throw new BadRequestError("Guarantee case is not in diagnosis");
        }

        const caseLines = guaranteeCase.caseLines || [];

        for (const caseLine of caseLines) {
          const validStatuses = [
            "DRAFT",
            "REJECTED_BY_OUT_OF_WARRANTY",
            "REJECTED_BY_TECH",
          ];
          if (!validStatuses.includes(caseLine.status)) {
            throw new BadRequestError(
              `Case line ${caseLine.id} has invalid status ${
                caseLine.status
              }. Must be one of: ${validStatuses.join(", ")}`
            );
          }
        }
      }

      const updatedRecord =
        await this.#vehicleProcessingRecordRepository.updateStatus(
          {
            vehicleProcessingRecordId: vehicleProcessingRecordId,
            status: "WAITING_CUSTOMER_APPROVAL",
          },
          transaction
        );

      const updatedGuaranteeCases = [];

      let caseLineIds = [];
      for (const guaranteeCase of guaranteeCases) {
        const updatedCase = await this.#guaranteeCaseRepository.updateStatus(
          {
            guaranteeCaseId: guaranteeCase.guaranteeCaseId,
            status: "DIAGNOSED",
          },
          transaction
        );

        updatedGuaranteeCases.push(updatedCase);

        for (const caseLine of guaranteeCase.caseLines) {
          if (caseLine.status === "DRAFT") {
            caseLineIds.push(caseLine.id);
          }
        }
      }

      const updatedCaseLines =
        await this.#caselineRepository.bulkUpdateStatusByIds(
          { caseLineIds: caseLineIds, status: "PENDING_APPROVAL" },
          transaction
        );

      const record =
        await this.#vehicleProcessingRecordRepository.findDetailById(
          {
            id: vehicleProcessingRecordId,
            roleName,
            userId,
            serviceCenterId,
          },
          transaction
        );

      return { record, updatedGuaranteeCases, updatedCaseLines, updatedRecord };
    });

    const roomName = `service_center_staff_${serviceCenterId}`;
    const eventName = "vehicleProcessingRecordStatusUpdated";
    const data = {
      roomName,
      record: rawResult.record,
    };

    await this.#notificationService.sendToRoom(roomName, eventName, data);

    return {
      record: rawResult.record,
      updatedGuaranteeCases: rawResult.updatedGuaranteeCases,
      updatedCaseLines: rawResult.updatedCaseLines,
      updatedRecord: rawResult.updatedRecord,
    };
  };

  #canAssignTask = async ({
    serviceCenterId: managerServiceCenterId,
    technician,
    vehicleProcessingRecordId,
    transaction = null,
    lock = null,
  }) => {
    const record = await this.#vehicleProcessingRecordRepository.findDetailById(
      {
        id: vehicleProcessingRecordId,
        serviceCenterId: managerServiceCenterId,
      },
      transaction,
      lock
    );

    if (!record) {
      throw new NotFoundError("Record not found.");
    }

    const ASSIGNABLE_STATUSES = ["CHECKED_IN", "IN_DIAGNOSIS"];

    if (!ASSIGNABLE_STATUSES.includes(record.status)) {
      throw new ForbiddenError(
        "Task can only be assigned to checked-in records or records in diagnosis."
      );
    }

    if (technician.role?.roleName !== "service_center_technician") {
      throw new ForbiddenError(
        "Assigned user must have role service_center_technician"
      );
    }

    if (record.createdByStaff?.serviceCenterId !== managerServiceCenterId) {
      throw new ForbiddenError(
        "You can only assign tasks for records in your own service center."
      );
    }

    if (technician.serviceCenterId !== managerServiceCenterId) {
      throw new ForbiddenError(
        "You can only assign technicians from your own service center."
      );
    }
  };

  getServiceHistory = async ({ vin, companyId, page, limit, statusFilter }) => {
    const offset = (page - 1) * limit;

    const rawResult = await db.sequelize.transaction(async (transaction) => {
      const vehicle = await this.#vehicleRepository.findByVinAndCompany({
        vin: vin,
        companyId: companyId,
      });

      if (!vehicle) {
        throw new NotFoundError("Vehicle not found");
      }

      const recorsdsByVin =
        await this.#vehicleProcessingRecordRepository.getServiceHistoryByVin(
          {
            vin: vin,
            statusFilter,
            limit,
            offset,
          },
          transaction
        );

      return { recorsdsByVin, vehicle };
    });

    const { vehicle, recorsdsByVin } = rawResult;

    const formatResult = {
      vehicle: vehicle,
      serviceHistory: recorsdsByVin.map((record) => ({
        ...record,
        createdAt: formatUTCtzHCM(record?.createdAt),
        checkInDate: formatUTCtzHCM(record?.checkInDate),
        checkOutDate: record?.checkOutDate
          ? formatUTCtzHCM(record?.checkOutDate)
          : null,
      })),
    };

    return formatResult;
  };
}

export default VehicleProcessingRecordService;
