import dayjs from "dayjs";
import { formatUTCtzHCM } from "../util/formatUTCtzHCM.js";
import { Transaction } from "sequelize";
import db from "../models/index.cjs";

class ComponentReservationService {
  #componentReservationRepository;
  #componentRepository;
  #caselineRepository;
  #warehouseRepository;
  #vehicleProcessingRecordRepository;
  #inventoryService;

  constructor({
    componentReservationRepository,
    componentRepository,
    caselineRepository,
    warehouseRepository,
    vehicleProcessingRecordRepository,
    inventoryService,
  }) {
    this.#componentReservationRepository = componentReservationRepository;
    this.#componentRepository = componentRepository;
    this.#caselineRepository = caselineRepository;
    this.#warehouseRepository = warehouseRepository;
    this.#vehicleProcessingRecordRepository = vehicleProcessingRecordRepository;
    this.#inventoryService = inventoryService;
  }

  #processUpdateStockItem = async (updatedComponent, transaction) => {
    const typeComponentId = updatedComponent?.typeComponentId;
    const warehouseId = updatedComponent?.warehouseId;

    const stockItem = await this.#warehouseRepository.findStockItem(
      { warehouseId, typeComponentId },
      transaction,
      Transaction.LOCK.UPDATE
    );

    if (!stockItem) {
      throw new Error("Stock item not found");
    }

    const newQuantityInStock = stockItem.quantityInStock - 1;
    const newQuantityReserved = stockItem.quantityReserved - 1;

    const updatedStock = await this.#warehouseRepository.updateStockItem(
      {
        warehouseId,
        typeComponentId,
        quantityInStock: newQuantityInStock,
        quantityReserved: newQuantityReserved,
      },
      transaction
    );

    return updatedStock?.stockId || stockItem.stockId || null;
  };

  pickupReservedComponents = async ({
    reservationIds,
    serviceCenterId,
    pickedUpByTechId,
  }) => {
    if (!serviceCenterId) {
      throw new Error("Service center context is required for pickup");
    }

    const uniqueReservationIds = Array.from(new Set(reservationIds));

    const rawResult = await db.sequelize.transaction(async (transaction) => {
      const updatedReservations = [];
      const caseLineIdsForUpdate = new Set();
      const affectedStockIds = new Set();

      for (const reservationId of uniqueReservationIds) {
        const existingReservation =
          await this.#componentReservationRepository.findById(
            reservationId,
            transaction,
            Transaction.LOCK.UPDATE
          );

        if (!existingReservation) {
          throw new Error("Reservation not found");
        }

        if (existingReservation.status !== "RESERVED") {
          throw new Error("Only RESERVED components can be picked up");
        }

        const reservationContext = await this.#caselineRepository.getVinById(
          existingReservation.caseLineId,
          transaction,
          Transaction.LOCK.SHARE
        );

        if (!reservationContext) {
          throw new Error("Caseline not found for reservation");
        }

        const reservationServiceCenterId =
          reservationContext?.guaranteeCase?.vehicleProcessingRecord
            ?.createdByStaff?.serviceCenterId || null;

        if (
          reservationServiceCenterId &&
          reservationServiceCenterId !== serviceCenterId
        ) {
          throw new Error(
            "Reservation does not belong to the current service center"
          );
        }

        const updatedReservation =
          await this.#componentReservationRepository.updateReservationStatusPickUp(
            {
              reservationId,
              serviceCenterId,
              pickedUpByTechId,
              pickedUpAt: formatUTCtzHCM(dayjs()),
              status: "PICKED_UP",
            },
            transaction
          );

        if (!updatedReservation) {
          throw new Error("Failed to update reservation status to PICKED_UP");
        }

        const componentId = updatedReservation?.componentId;

        const componentBeforeUpdate = await this.#componentRepository.findById(
          componentId,
          transaction,
          Transaction.LOCK.UPDATE
        );

        if (!componentBeforeUpdate || !componentBeforeUpdate.warehouseId) {
          throw new Error("Component must have warehouseId before pickup");
        }

        await this.#componentRepository.updateStatusWithTechnician(
          componentId,
          { status: "PICKED_UP" },
          transaction
        );

        const stockId = await this.#processUpdateStockItem(
          componentBeforeUpdate,
          transaction
        );

        if (stockId) {
          affectedStockIds.add(stockId);
        }

        if (updatedReservation.caseLineId) {
          caseLineIdsForUpdate.add(updatedReservation.caseLineId);
        }

        updatedReservations.push(updatedReservation);
      }

      if (caseLineIdsForUpdate.size > 0) {
        await this.#caselineRepository.bulkUpdateStatusByIds(
          {
            caseLineIds: Array.from(caseLineIdsForUpdate),
            status: "IN_REPAIR",
          },
          transaction
        );
      }

      return {
        updatedReservations,
        affectedStockIds: Array.from(affectedStockIds),
      };
    });

    const { updatedReservations, affectedStockIds } = rawResult;

    if (Array.isArray(affectedStockIds) && affectedStockIds.length > 0) {
      await this.#inventoryService.emitLowStockAlerts({
        stockIds: affectedStockIds,
      });
    }

    return updatedReservations;
  };

  installComponent = async ({ reservationId, serviceCenterId }) => {
    const rawResult = await db.sequelize.transaction(async (transaction) => {
      const reservation = await this.#componentReservationRepository.findById(
        reservationId,
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      if (reservation.status !== "PICKED_UP") {
        throw new Error("Only PICKED_UP components can be installed");
      }

      const caseLineId = reservation.caseLineId;

      const caseline = await this.#caselineRepository.getVinById(
        caseLineId,
        transaction,
        Transaction.LOCK.SHARE
      );

      if (!caseline) {
        throw new Error("Caseline not found for reservation");
      }

      const vin = caseline?.guaranteeCase?.vehicleProcessingRecord?.vin;
      const reservationServiceCenterId =
        caseline?.guaranteeCase?.vehicleProcessingRecord?.createdByStaff
          ?.serviceCenterId || null;

      if (!serviceCenterId) {
        throw new Error("Service center context is required for install");
      }

      if (
        reservationServiceCenterId &&
        reservationServiceCenterId !== serviceCenterId
      ) {
        throw new Error(
          "Reservation does not belong to the current service center"
        );
      }

      if (!vin) {
        throw new Error("Vehicle VIN is missing for the reservation");
      }

      const componentId = reservation.componentId;

      const component = await this.#componentRepository.findById(
        componentId,
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!component) {
        throw new Error("Component not found");
      }

      const typeComponentId = component.typeComponentId;
      const now = formatUTCtzHCM(dayjs());

      let updatedReservation;
      const componentInVehicle =
        await this.#componentRepository.findComponentInVehicleProcessingByTypeAndVin(
          {
            typeComponentId,
            vehicleVin: vin,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      let oldComponentSerial = null;

      if (componentInVehicle && componentInVehicle.status === "INSTALLED") {
        oldComponentSerial = componentInVehicle.serialNumber;

        const removedComponent =
          await this.#componentRepository.updateRemovedComponentStatus(
            {
              vehicleVin: vin,
              componentId: componentInVehicle.componentId,
              installedAt: now,
              status: "REMOVED",
              currentHolderId: null,
            },
            transaction
          );

        if (!removedComponent) {
          throw new Error("Failed to flag old component as removed");
        }
      } else if (
        componentInVehicle &&
        componentInVehicle.status !== "INSTALLED"
      ) {
        throw new Error("Existing component must be in INSTALLED status");
      }

      const installedComponent =
        await this.#componentRepository.updateInstalledComponentStatus(
          {
            vehicleVin: vin,
            componentId: componentId,
            installedAt: now,
            status: "INSTALLED",
            currentHolderId: null,
          },
          transaction
        );

      if (!installedComponent) {
        throw new Error("Failed to update component status to INSTALLED");
      }

      updatedReservation =
        await this.#componentReservationRepository.updateReservationStatusInstall(
          {
            reservationId,
            installedAt: now,
            oldComponentSerial,
            status: "INSTALLED",
          },
          transaction
        );

      if (!updatedReservation) {
        throw new Error("Failed to update reservation status to INSTALLED");
      }

      return updatedReservation;
    });

    return rawResult;
  };

  getComponentReservations = async ({
    page = 1,
    limit = 10,
    status,
    warehouseId,
    typeComponentId,
    caseLineId,
    guaranteeCaseId,
    vehicleProcessingRecordId,
    repairTechId,
    repairTechPhone,
    serviceCenterId,
    sortBy,
    sortOrder,
  }) => {
    const result = await this.#componentReservationRepository.findAll(
      {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        warehouseId,
        typeComponentId,
        caseLineId,
        guaranteeCaseId,
        vehicleProcessingRecordId,
        repairTechId,
        repairTechPhone,
        serviceCenterId,
        sortBy,
        sortOrder,
      },
      null
    );

    return result;
  };
}

export default ComponentReservationService;
