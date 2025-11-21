import dayjs from "dayjs";
import { Transaction } from "sequelize";
import db from "../models/index.cjs";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../error/index.js";

class InventoryService {
  #inventoryRepository;
  #inventoryAdjustmentRepository;
  #warehouseRepository;
  #userRepository;
  #notificationService;
  #caselineRepository;
  #componentRepository;
  #stockReservationRepository;
  #stockTransferRequestItemRepository;

  constructor({
    inventoryRepository,
    inventoryAdjustmentRepository,
    warehouseRepository,
    userRepository,
    notificationService,
    caselineRepository,
    componentRepository,
    stockReservationRepository,
    stockTransferRequestItemRepository,
  }) {
    this.#inventoryRepository = inventoryRepository;
    this.#inventoryAdjustmentRepository = inventoryAdjustmentRepository;
    this.#warehouseRepository = warehouseRepository;
    this.#userRepository = userRepository;
    this.#notificationService = notificationService;
    this.#caselineRepository = caselineRepository;
    this.#componentRepository = componentRepository;
    this.#stockReservationRepository = stockReservationRepository;
    this.#stockTransferRequestItemRepository =
      stockTransferRequestItemRepository;
  }

  getInventorySummary = async ({
    serviceCenterId,
    roleName,
    companyId,
    filters = {},
  }) => {
    const warehouseWhere = {};

    if (roleName === "parts_coordinator_service_center") {
      if (!serviceCenterId) {
        throw new Error("Service center context is required for this role");
      }
      warehouseWhere.serviceCenterId = serviceCenterId;
    } else if (roleName === "parts_coordinator_company") {
      if (!companyId) {
        throw new Error("Company context is required for this role");
      }
      warehouseWhere.vehicleCompanyId = companyId;
      if (filters?.serviceCenterId) {
        warehouseWhere.serviceCenterId = filters.serviceCenterId;
      }
    } else if (serviceCenterId) {
      warehouseWhere.serviceCenterId = serviceCenterId;
    }

    const summary = await this.#inventoryRepository.getInventorySummary({
      warehouseWhereClause: warehouseWhere,
    });

    return summary;
  };

  getInventoryTypeComponents = async ({
    serviceCenterId,
    roleName,
    companyId,
    filters = {},
  }) => {
    const { page, limit, typeComponentId } = filters;
    const warehouseWhere = {};

    if (roleName === "parts_coordinator_service_center") {
      if (!serviceCenterId) {
        throw new Error("Service center context is required for this role");
      }
      warehouseWhere.serviceCenterId = serviceCenterId;
    } else if (roleName === "parts_coordinator_company") {
      if (!companyId) {
        throw new Error("Company context is required for this role");
      }
      warehouseWhere.vehicleCompanyId = companyId;
      if (filters?.serviceCenterId) {
        warehouseWhere.serviceCenterId = filters.serviceCenterId;
      }
    }

    const limitParse = Number.parseInt(limit, 10) || 10;
    const pageParse = Number.parseInt(page, 10) || 1;
    const offset = (pageParse - 1) * limitParse;

    const { rows, count } =
      await this.#inventoryRepository.getInventoryTypeComponents({
        warehouseWhereClause: warehouseWhere,
        typeComponentId,
        limit: limitParse,
        offset,
      });

    const pages = Math.ceil(count / limitParse);
    const components = {
      typeComponents: rows,
      pagination: {
        total: count,
        pages: pageParse,
        limit: limitParse,
        totalPages: pages,
      },
    };

    return components;
  };

  createBulkAdjustments = async (adjustmentData) => {
    const {
      warehouseId,
      adjustmentType,
      reason,
      note,
      componentsBySku,
      adjustedByUserId,
      roleName,
      companyId,
    } = adjustmentData;

    const results = await db.sequelize.transaction(async (transaction) => {
      const adjustments = [];
      for (const sku in componentsBySku) {
        const components = componentsBySku[sku];
        const stock = await this.#warehouseRepository.findStockBySku(
          sku,
          warehouseId,
          transaction
        );

        if (!stock) {
          throw new NotFoundError(
            `Stock item with SKU ${sku} not found in warehouse ${warehouseId}`
          );
        }

        const result = await this.#performAdjustment({
          stockId: stock.stockId,
          adjustmentType,
          reason,
          note,
          components,
          adjustedByUserId,
          roleName,
          companyId,
          transaction,
        });
        adjustments.push(result);
      }
      return adjustments;
    });

    const stockIds = Array.from(
      new Set(
        results.map((result) => result?.updatedStock?.stockId).filter(Boolean)
      )
    );

    if (stockIds.length > 0) {
      await this.emitLowStockAlerts({ stockIds });
    }

    return results;
  };

  #performAdjustment = async ({
    stockId,
    adjustmentType,
    reason,
    note,
    components,
    adjustedByUserId,
    roleName,
    companyId,
    transaction,
  }) => {
    const stock = await this.#warehouseRepository.findStockByStockId(
      stockId,
      transaction,
      Transaction.LOCK.UPDATE
    );

    if (!stock) throw new NotFoundError("Stock item not found");

    const existingUser = await this.#userRepository.findUserById(
      { userId: adjustedByUserId },
      transaction,
      Transaction.LOCK.SHARE
    );

    if (!existingUser) throw new NotFoundError("Adjusting user not found");

    let quantity = components.length;

    if (quantity === 0) {
      throw new BadRequestError("Components list cannot be empty.");
    }

    const serialNumbers = components.map((c) => c.serialNumber);

    if (adjustmentType === "IN") {
      const existingComponents =
        await this.#componentRepository.findBySerialNumbers(
          serialNumbers,
          transaction,
          Transaction.LOCK.UPDATE
        );
      if (existingComponents.length > 0) {
        throw new ConflictError(
          `Serial numbers already exist: ${existingComponents
            .map((c) => c.serialNumber)
            .join(", ")}`
        );
      }

      const componentsToCreate = components.map((c) => ({
        ...c,
        typeComponentId: stock.typeComponentId,
        warehouseId: stock.warehouseId,
        status: "IN_STOCK",
      }));
      await this.#componentRepository.bulkCreate(
        componentsToCreate,
        transaction
      );
    } else if (adjustmentType === "OUT") {
      if (stock.quantityAvailable < quantity) {
        throw new ConflictError(
          `Insufficient available stock. Available: ${stock.quantityAvailable}, Requested: ${quantity}`
        );
      }
      const componentsToUpdate =
        await this.#componentRepository.findBySerialNumbers(
          serialNumbers,
          transaction,
          Transaction.LOCK.UPDATE
        );

      if (componentsToUpdate.length !== quantity) {
        const foundSerials = componentsToUpdate.map((c) => c.serialNumber);
        const notFoundSerials = serialNumbers.filter(
          (sn) => !foundSerials.includes(sn)
        );
        throw new NotFoundError(
          `Components with these serial numbers not found: ${notFoundSerials.join(
            ", "
          )}`
        );
      }

      for (const component of componentsToUpdate) {
        if (component.status !== "IN_STOCK") {
          throw new ConflictError(
            `Component with serial number ${component.serialNumber} is not in stock. Current status: ${component.status}`
          );
        }
      }

      await this.#componentRepository.updateComponentStatusBySerialNumbers(
        serialNumbers,
        "REMOVED",
        transaction
      );
    }

    const newAdjustment =
      await this.#inventoryAdjustmentRepository.createInventoryAdjustment(
        { stockId, adjustmentType, quantity, reason, note, adjustedByUserId },
        transaction
      );

    const newQuantityInStock =
      adjustmentType === "IN"
        ? stock.quantityInStock + quantity
        : stock.quantityInStock - quantity;

    const updatedStock = await this.#warehouseRepository.updateStockQuantities(
      { stockId, quantityInStock: newQuantityInStock },
      transaction
    );

    const result = { adjustment: newAdjustment, updatedStock, stock, quantity };

    if (roleName === "parts_coordinator_company" && companyId) {
      this.#notificationService.sendToRoom(
        `parts_coordinator_company_${companyId}`,
        "inventory_adjustment_created",
        {
          adjustment: newAdjustment,
          updatedStock,
          adjustmentType,
          quantity,
          reason,
        }
      );
    } else if (stock.warehouse?.serviceCenterId) {
      this.#notificationService.sendToRoom(
        `parts_coordinator_service_center_${stock.warehouse.serviceCenterId}`,
        "inventory_adjustment_created",
        {
          adjustment: newAdjustment,
          updatedStock,
          adjustmentType,
          quantity,
          reason,
        }
      );
    }

    return result;
  };

  createInventoryAdjustment = async (adjustmentData) => {
    const {
      stockId,
      adjustmentType,
      components,
      reason,
      note,
      adjustedByUserId,
      roleName,
      companyId,
    } = adjustmentData;

    const result = await db.sequelize.transaction(async (transaction) => {
      return this.#performAdjustment({
        stockId,
        adjustmentType,
        reason,
        note,
        components,
        adjustedByUserId,
        roleName,
        companyId,
        transaction,
      });
    });

    const updatedStockId = result?.updatedStock?.stockId;

    if (updatedStockId) {
      await this.emitLowStockAlerts({ stockIds: [updatedStockId] });
    }

    return result;
  };

  getInventoryAdjustments = async ({
    companyId,
    serviceCenterId,
    roleName,
    page = 1,
    limit = 20,
    filters = {},
  }) => {
    const limitParse = parseInt(limit, 10);
    const pageParse = parseInt(page, 10);
    const offset = (pageParse - 1) * limitParse;

    const where = {};
    const stockWhere = {};
    const warehouseWhere = {};

    if (roleName === "parts_coordinator_service_center") {
      warehouseWhere.serviceCenterId = serviceCenterId;
    } else if (roleName === "parts_coordinator_company") {
      warehouseWhere.vehicleCompanyId = companyId;
    }

    if (filters.warehouseId) {
      warehouseWhere.warehouseId = filters.warehouseId;
    }
    if (filters.typeComponentId) {
      stockWhere.typeComponentId = filters.typeComponentId;
    }
    if (filters.adjustmentType) {
      where.adjustmentType = filters.adjustmentType;
    }
    if (filters.reason) {
      where.reason = filters.reason;
    }
    if (filters.adjustedByUserId) {
      where.adjustedByUserId = filters.adjustedByUserId;
    }
    if (filters.startDate) {
      where.adjustedAt = {
        ...where.adjustedAt,
        [db.Sequelize.Op.gte]: filters.startDate,
      };
    }
    if (filters.endDate) {
      where.adjustedAt = {
        ...where.adjustedAt,
        [db.Sequelize.Op.lte]: filters.endDate,
      };
    }

    const { rows, count } =
      await this.#inventoryAdjustmentRepository.findAllAndCount({
        where,
        stockWhere,
        warehouseWhere,
        limit: limitParse,
        offset,
      });

    const totalPages = Math.ceil(count / limitParse);

    return {
      items: rows,
      pagination: {
        currentPage: pageParse,
        totalPages,
        totalItems: count,
        itemsPerPage: limitParse,
      },
    };
  };

  getInventoryAdjustmentById = async ({
    adjustmentId,
    companyId,
    serviceCenterId,
    roleName,
  }) => {
    const where = { adjustmentId };
    const stockWhere = {};
    const warehouseWhere = {};

    if (roleName === "parts_coordinator_service_center") {
      warehouseWhere.serviceCenterId = serviceCenterId;
    } else if (roleName === "parts_coordinator_company") {
      warehouseWhere.vehicleCompanyId = companyId;
    }

    const adjustment = await this.#inventoryAdjustmentRepository.findById({
      where,
      stockWhere,
      warehouseWhere,
    });

    return adjustment;
  };

  getStockHistory = async ({ stockId, page = 1, limit = 20 }) => {
    const stock = await this.#warehouseRepository.findStockByStockId(stockId);
    if (!stock) throw new NotFoundError("Stock item not found");

    const size = Math.max(parseInt(limit, 10) || 20, 1);
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (pageNumber - 1) * size;

    const { rows: adjustments, count } =
      await this.#inventoryAdjustmentRepository.findAllAndCount({
        where: { stockId },
        limit: size,
        offset,
      });

    const history = adjustments.map((adj) => {
      const adjustment = adj.toJSON ? adj.toJSON() : adj;
      const change =
        adjustment.adjustmentType === "IN"
          ? adjustment.quantity
          : -adjustment.quantity;

      return {
        ...adjustment,
        eventType: "INVENTORY_ADJUSTMENT",
        quantityChange: change,
        adjustedBy: adjustment.adjustedByUser ?? adjustment.adjustedBy ?? null,
      };
    });

    return {
      stock: {
        stockId: stock.stockId,
        warehouseId: stock.warehouseId,
        typeComponentId: stock.typeComponentId,
        quantityInStock: stock.quantityInStock,
        quantityReserved: stock.quantityReserved,
        quantityAvailable: stock.quantityAvailable,
      },
      history,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(count / size),
        totalItems: count,
        itemsPerPage: size,
      },
    };
  };

  findMostUsedTypeComponentsInWarehouse = async ({
    serviceCenterId,
    companyId,
    filters = {},
  }) => {
    const { limit, page, startDate, endDate } = filters;
    const limitParse = Number.parseInt(limit, 10) || 10;
    const pageParse = Number.parseInt(page, 10) || 1;
    const offset = (pageParse - 1) * limitParse;

    const components =
      await this.#caselineRepository.findMostUsedTypeComponents({
        serviceCenterId,
        companyId,
        limit: limitParse,
        offset,
        startDate,
        endDate,
      });

    return components;
  };

  emitLowStockAlerts = async ({ stockIds }) => {
    if (!Array.isArray(stockIds) || stockIds.length === 0) {
      return [];
    }

    const stocks = await this.#warehouseRepository.findStocksByIds({
      stockIds,
    });

    const belowStockItems = stocks.filter(
      (stock) => stock.quantityAvailable <= stock.reorderPoint
    );

    if (belowStockItems.length === 0) {
      return [];
    }

    const cooldownHours = 2;
    const now = dayjs();

    const eligibleStocks = belowStockItems.filter((stock) => {
      if (!stock.lowStockNotifiedAt) {
        return true;
      }

      const lowStockMoment = dayjs(stock.lowStockNotifiedAt);
      const hoursSince = now.diff(lowStockMoment, "hour", true);

      const updatedAt = stock.updatedAt ? dayjs(stock.updatedAt) : null;
      const isFreshAlert =
        updatedAt && lowStockMoment.isSame(updatedAt, "second");

      if (isFreshAlert) {
        return true;
      }

      return hoursSince >= cooldownHours;
    });

    if (eligibleStocks.length === 0) {
      return [];
    }

    const stocksByServiceCenter = new Map();
    const stocksByCompany = new Map();

    for (const stock of eligibleStocks) {
      const { warehouse } = stock;

      if (warehouse?.serviceCenterId) {
        const roomName = `parts_coordinator_service_center_${warehouse.serviceCenterId}`;
        if (!stocksByServiceCenter.has(roomName)) {
          stocksByServiceCenter.set(roomName, []);
        }
        stocksByServiceCenter.get(roomName).push(stock);
      }

      if (warehouse?.vehicleCompanyId) {
        const roomName = `parts_coordinator_company_${warehouse.vehicleCompanyId}`;
        if (!stocksByCompany.has(roomName)) {
          stocksByCompany.set(roomName, []);
        }
        stocksByCompany.get(roomName).push(stock);
      }
    }

    for (const [roomName, items] of stocksByServiceCenter.entries()) {
      this.#notificationService.sendToRoom(roomName, "low_stock_alert", {
        stocks: items,
      });
    }

    for (const [roomName, items] of stocksByCompany.entries()) {
      this.#notificationService.sendToRoom(roomName, "low_stock_alert", {
        stocks: items,
      });
    }

    return eligibleStocks;
  };
}

export default InventoryService;
