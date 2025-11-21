import { Transaction } from "sequelize";
import dayjs from "dayjs";
import { formatUTCtzHCM } from "../util/formatUTCtzHCM.js";
import { ConflictError, NotFoundError, BadRequestError } from "../error/index.js";

class StockTransferRequestService {
  #stockTransferRequestRepository;
  #stockTransferRequestItemRepository;
  #stockTransferComponentRepository;
  #stockReservationRepository;
  #caselineRepository;
  #warehouseRepository;
  #componentRepository;
  #typeComponentRepository;
  #notificationService;
  #inventoryService;
  #userService;
  #mailService;
  #db;

  constructor({
    stockTransferRequestRepository,
    stockTransferRequestItemRepository,
    stockTransferComponentRepository,
    stockReservationRepository,
    caselineRepository,
    warehouseRepository,
    componentRepository,
    typeComponentRepository,
    notificationService,
    inventoryService,
    userService,
    mailService,
    db,
  }) {
    this.#stockTransferRequestRepository = stockTransferRequestRepository;
    this.#stockTransferRequestItemRepository =
      stockTransferRequestItemRepository;
    this.#stockTransferComponentRepository = stockTransferComponentRepository;
    this.#stockReservationRepository = stockReservationRepository;
    this.#caselineRepository = caselineRepository;
    this.#warehouseRepository = warehouseRepository;
    this.#componentRepository = componentRepository;
    this.#typeComponentRepository = typeComponentRepository;
    this.#notificationService = notificationService;
    this.#inventoryService = inventoryService;
    this.#userService = userService;
    this.#mailService = mailService;
    this.#db = db;
  }

  createStockTransferRequest = async ({
    requestingWarehouseId,
    items,
    requestedByUserId,
    companyId,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const newStockTransferRequest =
        await this.#stockTransferRequestRepository.createStockTransferRequest(
          {
            requestingWarehouseId,
            requestedByUserId,
            requestedAt: formatUTCtzHCM(dayjs()),
            requestType: "CASELINE",
          },
          transaction
        );

      const itemsToCreate = items.map((item) => ({
        ...item,
        requestId: newStockTransferRequest?.id,
      }));

      const caselineIds = items.map((item) => item.caselineId);

      await this.#caselineRepository.bulkUpdateStatusByIds(
        {
          caseLineIds: caselineIds,
          status: "WAITING_FOR_PARTS",
        },
        transaction
      );

      const rawItems =
        await this.#stockTransferRequestItemRepository.createStockTransferRequestItems(
          {
            items: itemsToCreate,
          },
          transaction
        );

      return { newStockTransferRequest, rawItems };
    });

    const formatRawItems = rawResult.rawItems.map((item) => ({
      ...item,
      createdAt: formatUTCtzHCM(item.createdAt),
      updatedAt: formatUTCtzHCM(item.updatedAt),
    }));

    const roomName = `emv_staff_${companyId}`;

    this.#notificationService.sendToRoom(
      roomName,
      "new_stock_transfer_request",
      { request: rawResult.newStockTransferRequest }
    );

    return {
      newStockTransferRequest: {
        ...rawResult.newStockTransferRequest,
        createdAt: formatUTCtzHCM(rawResult.newStockTransferRequest.createdAt),
        updatedAt: formatUTCtzHCM(rawResult.newStockTransferRequest.updatedAt),
      },
      items: formatRawItems,
    };
  };

  getAllStockTransferRequests = async ({
    userId,
    roleName,
    serviceCenterId,
    companyId,
    page,
    limit,
    status,
  }) => {
    const offset = (page - 1) * limit;
    const limitNumber = parseInt(limit);
    const offsetNumber = parseInt(offset);

    const stockTransferRequests =
      await this.#stockTransferRequestRepository.getAllStockTransferRequests({
        userId,
        roleName,
        serviceCenterId,
        companyId,
        offset: offsetNumber,
        limit: limitNumber,
        status: status,
      });

    const formattedRequests = stockTransferRequests.map((request) => ({
      ...request,
      createdAt: formatUTCtzHCM(request.createdAt),
      updatedAt: formatUTCtzHCM(request.updatedAt),
    }));

    return formattedRequests;
  };

  getStockTransferRequestById = async ({
    id,
    userId,
    roleName,
    serviceCenterId,
    companyId,
  }) => {
    const stockTransferRequest =
      await this.#stockTransferRequestRepository.getStockTransferRequestById({
        id,
        userId,
        roleName,
        serviceCenterId,
        companyId,
      });

    return stockTransferRequest;
  };

  approveStockTransferRequest = async ({
    id,
    roleName,
    companyId,
    approvedByUserId,
    sourceWarehouseId,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const approvedStockTransferRequest =
        await this.#stockTransferRequestRepository.getStockTransferRequestById(
          {
            id,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!approvedStockTransferRequest) {
        return null;
      }

      if (approvedStockTransferRequest.status !== "PENDING_APPROVAL") {
        throw new ConflictError(
          `Only requests with status PENDING_APPROVAL can be approved. Current status: ${approvedStockTransferRequest.status}`
        );
      }

      const requestId = approvedStockTransferRequest.id;


      await this.#stockTransferRequestRepository.updateStockTransferRequestStatus(
        { requestId, sourceWarehouseId },
        transaction
      );

      const stockTransferRequestItems =
        await this.#stockTransferRequestItemRepository.getStockTransferRequestItemsByRequestId(
          {
            requestId: requestId,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (
        !stockTransferRequestItems ||
        stockTransferRequestItems.length === 0
      ) {
        throw new Error(`Request ${requestId} has no items.`);
      }

      const typeComponentIdsNeeded = stockTransferRequestItems.map(
        (item) => item.typeComponentId
      );

      const stocks =
        await this.#warehouseRepository.findStocksByTypeComponentAndWarehouse(
          {
            typeComponentIds: typeComponentIdsNeeded,
            warehouseId: sourceWarehouseId,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      const stocksGroupedByType = stocks.reduce((acc, stock) => {
        if (!acc[stock.typeComponent.typeComponentId]) {
          acc[stock.typeComponent.typeComponentId] = [];
        }

        acc[stock.typeComponent.typeComponentId].push(stock);

        return acc;
      }, {});

      const stockReservationsToCreate = [];
      const stockUpdates = [];

      for (const item of stockTransferRequestItems) {
        const stocksForItem = stocksGroupedByType[item.typeComponentId] || [];

        const totalAvailable = stocksForItem.reduce(
          (sum, s) => sum + (s.quantityInStock - s.quantityReserved),
          0
        );

        if (totalAvailable < item.quantityRequested) {
          throw new ConflictError(
            `Not enough available stock in company warehouse for component '${item.typeComponentId}'. ` +
              `Requested: ${item.quantityRequested}, Total available: ${totalAvailable}.`
          );
        }

        const allocations = this.#allocateStock({
          stocks: stocksForItem,
          item: {
            typeComponentId: item.typeComponentId,
            quantityReserved: item.quantityRequested,
          },
        });

        for (const allocation of allocations) {
          stockReservationsToCreate.push({
            stockId: allocation.stockId,
            requestId: requestId,
            typeComponentId: item.typeComponentId,
            quantityReserved: allocation.quantityReserved,
            status: "RESERVED",
          });

          stockUpdates.push({
            stockId: allocation.stockId,
            quantityReserved: allocation.quantityReserved,
          });
        }
      }

      if (stockReservationsToCreate.length > 0) {
        await this.#stockReservationRepository.bulkCreate(
          { reservations: stockReservationsToCreate },
          transaction
        );
      }

      if (stockUpdates.length > 0) {
        await this.#warehouseRepository.bulkUpdateStockQuantities(
          stockUpdates,
          transaction
        );
      }

      const updatedStockTransferRequest =
        await this.#stockTransferRequestRepository.updateStockTransferRequestStatus(
          { requestId, status: "APPROVED", approvedByUserId, sourceWarehouseId },
          transaction
        );

      const requestWithDetails =
        await this.#stockTransferRequestRepository.getStockTransferRequestById(
          { id: requestId },
          transaction
        );

      return {
        stockReservations: stockReservationsToCreate,
        stockUpdates,
        updatedStockTransferRequest,
        requestWithDetails,
      };
    });

    const { requestWithDetails, stockUpdates = [] } = rawResult;

    const roomName = `parts_coordinator_company_${companyId}`;
    const eventName = "stock_transfer_request_approved";
    const data = requestWithDetails;

    this.#notificationService.sendToRoom(roomName, eventName, data);

    const affectedStockIds = stockUpdates
      .map((update) => update.stockId)
      .filter(Boolean);

    if (affectedStockIds.length > 0) {
      await this.#inventoryService.emitLowStockAlerts({
        stockIds: affectedStockIds,
      });
    }

    return rawResult;
  };

  shipStockTransferRequest = async ({
    requestId,
    roleName,
    estimatedDeliveryDate,
    companyId,
    shippedComponents,
  }) => {
    if (!estimatedDeliveryDate || dayjs(estimatedDeliveryDate).isBefore(dayjs())) {
      throw new BadRequestError("Valid estimated delivery date (future) is required");
    }

    if (!Array.isArray(shippedComponents) || shippedComponents.length === 0) {
      throw new BadRequestError("List of shipped components is required");
    }

    let serviceCenterRequest;
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const existingRequest =
        await this.#stockTransferRequestRepository.getStockTransferRequestById(
          { id: requestId, roleName: roleName, companyId: companyId },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!existingRequest) {
        throw new NotFoundError(
          `Stock transfer request with ID ${requestId} not found`
        );
      }

      if (existingRequest.status !== "APPROVED") {
        throw new ConflictError(
          `Only approved requests can be shipped. Current status: ${existingRequest.status}`
        );
      }

      serviceCenterRequest = existingRequest?.requester?.serviceCenterId;

      const reservations =
        await this.#stockReservationRepository.findByRequestId(
          { requestId, status: "RESERVED" },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!reservations || reservations.length === 0) {
        throw new Error(`No stock reservations found for request ${requestId}`);
      }


      const allComponentIds = shippedComponents;
      const uniqueComponentIds = [...new Set(allComponentIds)];

      if (uniqueComponentIds.length !== allComponentIds.length) {
        throw new ConflictError("Duplicate component IDs provided in shipment");
      }

      const componentsDb = await this.#componentRepository.findComponentsByIds(
        uniqueComponentIds,
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (componentsDb.length !== uniqueComponentIds.length) {
        throw new NotFoundError("One or more provided components not found");
      }


      const componentsByType = componentsDb.reduce((acc, comp) => {
        if (!acc[comp.typeComponentId]) acc[comp.typeComponentId] = [];
        acc[comp.typeComponentId].push(comp);
        return acc;
      }, {});


      const reservationsByType = reservations.reduce((acc, r) => {
        if (!acc[r.typeComponentId]) acc[r.typeComponentId] = 0;
        acc[r.typeComponentId] += r.quantityReserved;
        return acc;
      }, {});


      for (const typeId in reservationsByType) {
        const reservedQty = reservationsByType[typeId];
        const providedQty = componentsByType[typeId]?.length || 0;

        if (providedQty !== reservedQty) {
          throw new ConflictError(
            `Mismatch quantity for TypeComponent ${typeId}. Expected: ${reservedQty}, Provided: ${providedQty}`
          );
        }
      }

      // Ensure no extra components from unrequested types
      for (const typeId in componentsByType) {
        if (!reservationsByType[typeId]) {
          throw new ConflictError(
            `Shipped component belongs to TypeComponent ${typeId} which is not in the reservation.`
          );
        }
      }


      for (const comp of componentsDb) {
        if (comp.status !== "IN_STOCK") {
          throw new ConflictError(
            `Component ${comp.componentId} is not IN_STOCK. Current: ${comp.status}`
          );
        }
        if (comp.warehouseId !== existingRequest.sourceWarehouseId) {
          throw new ConflictError(
            `Component ${comp.componentId} does not belong to source warehouse ${existingRequest.sourceWarehouseId}`
          );
        }
      }


      const transferComponentRecords = allComponentIds.map((componentId) => ({
        requestId: requestId,
        componentId: componentId,
      }));

      await this.#stockTransferComponentRepository.bulkCreate(
        { items: transferComponentRecords },
        transaction
      );


      await this.#componentRepository.bulkUpdateStatus(
        {
          componentIds: allComponentIds,
          status: "IN_TRANSIT",
          requestId: null,
        },
        transaction
      );

      const stockUpdates = [];
      for (const reservation of reservations) {
        stockUpdates.push({
          stockId: reservation.stockId,
          quantityInStock: -reservation.quantityReserved,
          quantityReserved: -reservation.quantityReserved,
        });
      }

      await this.#warehouseRepository.bulkUpdateStockQuantities(
        stockUpdates,
        transaction
      );

      const reservationIds = reservations.map((r) => r.reservationId);
      await this.#stockReservationRepository.bulkUpdateStatus(
        { reservationIds, status: "SHIPPED" },
        transaction
      );

      const updatedRequest =
        await this.#stockTransferRequestRepository.updateStockTransferRequestStatus(
          {
            requestId,
            status: "SHIPPED",
            shippedAt: formatUTCtzHCM(dayjs()),
            estimatedDeliveryDate,
          },
          transaction
        );

      return {
        updatedRequest,
        componentCollections: componentsByType,
        stockUpdates,
      };
    });

    const roomNameServiceCenterStaff = `service_center_staff_${serviceCenterRequest}`;
    const roomNameServiceCenterManager = `service_center_manager_${serviceCenterRequest}`;
    const roomNamePartsCoordinatorServiceCenter = `parts_coordinator_service_center_${serviceCenterRequest}`;

    const eventName = "stock_transfer_request_shipped";
    const data = { requestId };

    this.#notificationService.sendToRooms(
      [
        roomNameServiceCenterStaff,
        roomNameServiceCenterManager,
        roomNamePartsCoordinatorServiceCenter,
      ],
      eventName,
      data
    );

    const {
      updatedRequest,
      componentCollections,
      stockUpdates = [],
    } = rawResult;

    const affectedStockIds = stockUpdates
      .map((update) => update.stockId)
      .filter(Boolean);

    if (affectedStockIds.length > 0) {
      await this.#inventoryService.emitLowStockAlerts({
        stockIds: affectedStockIds,
      });
    }

    return {
      updatedRequest,
      componentCollections,
    };
  };

  receiveStockTransferRequest = async ({
    requestId,
    userId,
    roleName,
    serviceCenterId,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const existingRequest =
        await this.#stockTransferRequestRepository.getStockTransferRequestById(
          { id: requestId },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!existingRequest) {
        throw new NotFoundError(
          `Stock transfer request with ID ${requestId} not found`
        );
      }

      if (existingRequest.status !== "SHIPPED") {
        throw new ConflictError(
          `Only shipped requests can be received. Current status: ${existingRequest.status}`
        );
      }

      const warehouseId = existingRequest.requestingWarehouseId;

      const targetWarehouse = await this.#warehouseRepository.findById(
        { warehouseId },
        transaction,
        Transaction.LOCK.UPDATE
      );

      if (!targetWarehouse) {
        throw new NotFoundError(
          `Target warehouse with ID ${warehouseId} not found`
        );
      }


      const transferComponents =
        await this.#stockTransferComponentRepository.findByRequestId(
          { requestId },
          transaction
        );

      if (!transferComponents || transferComponents.length === 0) {
        throw new ConflictError(
          `No components found in transfer history for request ${requestId}`
        );
      }

      const componentsInTransit = transferComponents.map((tc) => tc.component);

      const componentsByType = componentsInTransit.reduce((acc, component) => {
        const typeId = component.typeComponentId;

        if (!acc[typeId]) {
          acc[typeId] = [];
        }

        acc[typeId].push(component);
        return acc;
      }, {});

      const allComponentIds = componentsInTransit.map((c) => c.componentId);

      await this.#componentRepository.bulkUpdateStatus(
        {
          componentIds: allComponentIds,
          status: "IN_STOCK",
          requestId: null,
          warehouseId: warehouseId,
        },
        transaction
      );

      const stockUpdates = [];
      const createdStockIds = [];
      for (const [typeComponentId, components] of Object.entries(
        componentsByType
      )) {
        const existingStock =
          await this.#warehouseRepository.findStockByWarehouseAndTypeComponent(
            {
              warehouseId: warehouseId,
              typeComponentId: typeComponentId,
            },
            transaction,
            Transaction.LOCK.UPDATE
          );

        if (existingStock) {
          stockUpdates.push({
            stockId: existingStock.stockId,
            quantityInStock: components.length,
            quantityReserved: 0,
          });
        } else {
          const createdStock = await this.#warehouseRepository.createStock(
            {
              warehouseId: warehouseId,
              typeComponentId: typeComponentId,
              quantityInStock: components.length,
              quantityReserved: 0,
            },
            transaction
          );

          if (createdStock?.stockId) {
            createdStockIds.push(createdStock.stockId);
          }
        }
      }

      if (stockUpdates.length > 0) {
        await this.#warehouseRepository.bulkUpdateStockQuantities(
          stockUpdates,
          transaction
        );
      }

      const updatedRequest =
        await this.#stockTransferRequestRepository.updateStockTransferRequestStatus(
          {
            requestId,
            status: "RECEIVED",
            receivedAt: formatUTCtzHCM(dayjs()),
          },
          transaction
        );

      const relatedCaseLineIds = existingRequest.items
        ?.map((item) => item.caselineId)
        .filter(Boolean);

      if (relatedCaseLineIds && relatedCaseLineIds.length > 0) {
        await this.#caselineRepository.bulkUpdateStatusByIds(
          {
            caseLineIds: relatedCaseLineIds,
            status: "PARTS_AVAILABLE",
          },
          transaction,
          Transaction.LOCK.UPDATE
        );
      }

      const requestWithDetails =
        await this.#stockTransferRequestRepository.getStockTransferRequestById(
          { id: requestId },
          transaction
        );

      const roomName_service_center_staff = `service_center_staff_${serviceCenterId}`;
      const roomName_service_center_manager = `service_center_manager_${serviceCenterId}`;
      const eventName = "stock_transfer_request_received";
      const data = {
        requestWithDetails,
        updatedCaselineStatus: relatedCaseLineIds?.map((caselineId) => ({
          caselineId,
          status: "PARTS_AVAILABLE",
        })),
      };

      this.#notificationService.sendToRooms(
        [roomName_service_center_staff, roomName_service_center_manager],
        eventName,
        data
      );

      return {
        updatedRequest,
        receivedComponentsCount: allComponentIds.length,
        stockUpdates,
        createdStockIds,
      };
    });

    const {
      updatedRequest,
      receivedComponentsCount,
      stockUpdates = [],
      createdStockIds = [],
    } = rawResult;

    const emittedStockIds = new Set([
      ...stockUpdates.map((update) => update.stockId).filter(Boolean),
      ...createdStockIds.filter(Boolean),
    ]);

    if (emittedStockIds.size > 0) {
      await this.#inventoryService.emitLowStockAlerts({
        stockIds: Array.from(emittedStockIds),
      });
    }

    return {
      updatedRequest,
      receivedComponentsCount,
    };
  };

  rejectStockTransferRequest = async ({
    requestId,
    rejectedByUserId,
    rejectionReason,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const existingRequest =
        await this.#stockTransferRequestRepository.getStockTransferRequestById(
          { id: requestId },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!existingRequest) {
        throw new NotFoundError(
          `Stock transfer request with ID ${requestId} not found`
        );
      }

      if (!["PENDING_APPROVAL", "APPROVED"].includes(existingRequest.status)) {
        throw new ConflictError(
          `Only pending or approved requests can be rejected. Current status: ${existingRequest.status}`
        );
      }

      let releasedStockIds = [];


      if (existingRequest.status === "APPROVED") {
        const reservations =
          await this.#stockReservationRepository.findByRequestId(
            { requestId },
            transaction,
            Transaction.LOCK.UPDATE
          );

        if (reservations && reservations.length > 0) {
          const stockUpdates = [];
          for (const reservation of reservations) {
            stockUpdates.push({
              stockId: reservation.stockId,
              quantityReserved: -reservation.quantityReserved,
            });
          }

          await this.#warehouseRepository.bulkUpdateStockQuantities(
            stockUpdates,
            transaction
          );

          const reservationIds = reservations.map((r) => r.reservationId);
          await this.#stockReservationRepository.bulkUpdateStatus(
            { reservationIds, status: "CANCELLED" },
            transaction
          );

          releasedStockIds = stockUpdates
            .map((update) => update.stockId)
            .filter(Boolean);
        }
      }

      const caselineIds = existingRequest.items.map((item) => item.caselineId);

      await this.#caselineRepository.bulkUpdateStatusByIds(
        {
          caseLineIds: caselineIds,
          status: "CUSTOMER_APPROVED",
          rejectionReason: rejectionReason ?? null,
        },
        transaction
      );

      const updatedRequest =
        await this.#stockTransferRequestRepository.updateStockTransferRequestStatusRejected(
          {
            requestId,
            rejectedByUserId,
            rejectionReason,
          },
          transaction
        );

      return {
        updatedRequest,
        requesterServiceCenterId: existingRequest.requester?.serviceCenterId,
        requesterUserId: existingRequest.requestedByUserId,
        releasedStockIds,
      };
    });

    const { updatedRequest, requesterServiceCenterId, requesterUserId, releasedStockIds = [] } = rawResult;

    if (requesterServiceCenterId) {
      const roomNameServiceCenterStaff = `service_center_staff_${requesterServiceCenterId}`;
      const roomNameServiceCenterManager = `service_center_manager_${requesterServiceCenterId}`;

      const eventName = "stock_transfer_request_rejected";
      const data = { requestId, rejectionReason };

      this.#notificationService.sendToRooms(
        [roomNameServiceCenterStaff, roomNameServiceCenterManager],
        eventName,
        data
      );
    }


    try {
      const requester = await this.#userService.getUserById(requesterUserId);
      if (requester && requester.email) {
        await this.#mailService.sendMail({
          to: requester.email,
          subject: `Stock Transfer Request Rejected - #${requestId}`,
          text: `Your stock transfer request #${requestId} has been rejected.\nReason: ${rejectionReason}`,
        });
      }
    } catch (error) {
      console.error("Failed to send rejection email:", error);

    }

    if (releasedStockIds.length > 0) {
      await this.#inventoryService.emitLowStockAlerts({
        stockIds: Array.from(new Set(releasedStockIds)),
      });
    }

    return updatedRequest;
  };

  cancelStockTransferRequest = async ({
    requestId,
    cancelledByUserId,
    cancellationReason,
    roleName,
    companyId,
  }) => {
    const rawResult = await this.#db.sequelize.transaction(async (transaction) => {
      const existingRequest =
        await this.#stockTransferRequestRepository.getStockTransferRequestById(
          { id: requestId },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (!existingRequest) {
        throw new NotFoundError(
          `Stock transfer request with ID ${requestId} not found`
        );
      }


      if (existingRequest.status === "SHIPPED") {
        throw new ConflictError(
          "Cannot cancel a request that has already been SHIPPED. Please use the Return process."
        );
      }

      if (roleName === "service_center_manager") {
        if (existingRequest.status !== "PENDING_APPROVAL") {
          throw new ConflictError(
            `Service Center Manager can only cancel pending requests. Current status: ${existingRequest.status}`
          );
        }
      }

      let releasedStockIds = [];

      if (roleName === "emv_staff") {
        if (
          !["PENDING_APPROVAL", "APPROVED"].includes(existingRequest.status)
        ) {
          throw new ConflictError(
            `EMV Staff can only cancel pending or approved requests. Current status: ${existingRequest.status}`
          );
        }

        if (existingRequest.status === "APPROVED") {
          const reservations =
            await this.#stockReservationRepository.findByRequestId(
              { requestId },
              transaction,
              Transaction.LOCK.UPDATE
            );

          if (reservations && reservations.length > 0) {
            const stockUpdates = [];
            for (const reservation of reservations) {
              stockUpdates.push({
                stockId: reservation.stockId,
                quantityReserved: -reservation.quantityReserved,
              });
            }

            await this.#warehouseRepository.bulkUpdateStockQuantities(
              stockUpdates,
              transaction
            );

            const reservationIds = reservations.map((r) => r.reservationId);
            await this.#stockReservationRepository.bulkUpdateStatus(
              { reservationIds, status: "CANCELLED" },
              transaction
            );

            releasedStockIds = stockUpdates
              .map((update) => update.stockId)
              .filter(Boolean);
          }
        }
      }

      await this.#stockTransferComponentRepository.deleteByRequestId(
        { requestId },
        transaction
      );

      const updatedRequest =
        await this.#stockTransferRequestRepository.updateStockTransferRequestStatusCancelled(
          {
            requestId,
            cancelledByUserId,
            cancellationReason,
          },
          transaction
        );

      return { updatedRequest, releasedStockIds };
    });

    const { updatedRequest, releasedStockIds = [] } = rawResult;

    const roomName = `emv_staff_${companyId}`;

    const eventName = "stock_transfer_request_cancelled";
    const data = { updatedRequest };

    this.#notificationService.sendToRooms([roomName], eventName, data);

    if (releasedStockIds.length > 0) {
      await this.#inventoryService.emitLowStockAlerts({
        stockIds: Array.from(new Set(releasedStockIds)),
      });
    }

    return rawResult;
  };

  #collectComponentsFromReservations = async ({
    reservations,
    item,
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
            typeComponentId: item.typeComponentId,
            warehouseId: stock.warehouse.warehouseId,
            limit: reservation.quantityReserved,
          },
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (components.length < reservation.quantityReserved) {
        throw new ConflictError(
          `Insufficient available components in warehouse ${stock.warehouseId}. ` +
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

  #allocateStock = ({ stocks, item }) => {
    const reservations = [];

    let remainingQuantity = item.quantityReserved;

    for (const stock of stocks) {
      const availableQuantity = stock.quantityInStock - stock.quantityReserved;

      if (availableQuantity <= 0) {
        continue;
      }

      const quantityToAllocate = Math.min(availableQuantity, remainingQuantity);

      reservations.push({
        stockId: stock.stockId,
        quantityReserved: quantityToAllocate,
      });

      stock.quantityReserved += quantityToAllocate;
      remainingQuantity -= quantityToAllocate;

      if (remainingQuantity === 0) {
        break;
      }
    }

    if (remainingQuantity > 0) {
      throw new Error(
        `Unable to allocate the requested quantity from available stocks for item: ${item.id} with type-component: ${item.typeComponentId} of request ${item.requestId}`
      );
    }

    return reservations;
  };
}

export default StockTransferRequestService;
