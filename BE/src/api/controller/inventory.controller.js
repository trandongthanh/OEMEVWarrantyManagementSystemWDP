import xlsx from "xlsx";

class InventoryController {
  #inventoryService;
  constructor({ inventoryService }) {
    this.#inventoryService = inventoryService;
  }

  getInventorySummary = async (req, res, next) => {
    const { serviceCenterId, roleName } = req.user;
    const { companyId } = req;
    const { serviceCenterId: filterServiceCenterId } = req.query;

    const summary = await this.#inventoryService.getInventorySummary({
      serviceCenterId,
      roleName,
      companyId,
      filters: {
        serviceCenterId: filterServiceCenterId,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        summary,
      },
    });
  };

  getInventoryTypeComponents = async (req, res, next) => {
    const { serviceCenterId, roleName } = req.user;

    const { companyId } = req;

    const {
      page,
      limit,
      typeComponentId,
      serviceCenterId: filterServiceCenterId,
    } = req.query;

    const components = await this.#inventoryService.getInventoryTypeComponents({
      serviceCenterId,
      roleName,
      companyId,
      filters: {
        serviceCenterId: filterServiceCenterId,
        typeComponentId,
        page,
        limit,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        components,
      },
    });
  };

  createInventoryAdjustment = async (req, res, next) => {
    const { userId: adjustedByUserId, roleName } = req.user;
    const { companyId } = req;
    const { stockId, adjustmentType, reason, note, components } = req.body;

    const result = await this.#inventoryService.createInventoryAdjustment({
      stockId,
      adjustmentType,
      reason,
      note,
      components,
      adjustedByUserId,
      roleName,
      companyId,
    });

    res.status(201).json({
      status: "success",
      data: result,
    });
  };

  getInventoryAdjustments = async (req, res, next) => {
    const { companyId } = req;
    const { serviceCenterId, roleName } = req.user;
    const { page, limit, ...filters } = req.query;

    const result = await this.#inventoryService.getInventoryAdjustments({
      companyId,
      serviceCenterId,
      roleName,
      page,
      limit,
      filters,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  };

  getInventoryAdjustmentById = async (req, res, next) => {
    const { adjustmentId } = req.params;
    const { companyId } = req;
    const { serviceCenterId, roleName } = req.user;

    const adjustment = await this.#inventoryService.getInventoryAdjustmentById({
      adjustmentId,
      companyId,
      serviceCenterId,
      roleName,
    });

    if (!adjustment) {
      return res.status(404).json({
        status: "fail",
        message: "Adjustment not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: adjustment,
    });
  };

  getStockHistory = async (req, res, next) => {
    const { stockId } = req.params;
    const { page, limit } = req.query;

    const history = await this.#inventoryService.getStockHistory({
      stockId,
      page,
      limit,
    });

    res.status(200).json({
      status: "success",
      data: history,
    });
  };

  findMostUsedTypeComponentsInWarehouse = async (req, res, next) => {
    const { serviceCenterId, roleName } = req.user;
    const { companyId } = req;
    const { limit, page, startDate, endDate } = req.query;

    const components =
      await this.#inventoryService.findMostUsedTypeComponentsInWarehouse({
        serviceCenterId,
        companyId,
        filters: {
          limit,
          page,
          startDate,
          endDate,
        },
      });

    res.status(200).json({
      status: "success",
      data: {
        components,
      },
    });
  };

  getInventoryAdjustmentTemplate = async (req, res, next) => {
    try {
      const workbook = xlsx.utils.book_new();

      const templateRows = [
        ["SKU", "SERIAL_NUMBER"],
        ["BRAKE-PAD-CERAMIC", "SN-001"],
        ["BRAKE-PAD-CERAMIC", "SN-002"],
        ["FILTER-CABIN-HEPA", "SN-003"],
      ];

      const worksheet = xlsx.utils.aoa_to_sheet(templateRows);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

      const buffer = xlsx.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=inventory-adjustment-template.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.status(200).send(buffer);
    } catch (error) {
      return next(error);
    }
  };

  createInventoryAdjustmentFromFile = async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { userId: adjustedByUserId, roleName } = req.user;
    const { companyId } = req;
    const { warehouseId, adjustmentType, reason, note } = req.body;

    try {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
      });

      const componentsBySku = data.slice(1).reduce((acc, row) => {
        const rawSku = row[0];
        const rawSerialNumber = row[1];
        const sku =
          typeof rawSku === "string" ? rawSku.trim().toUpperCase() : rawSku;

        const serialNumber =
          typeof rawSerialNumber === "string"
            ? rawSerialNumber.trim()
            : rawSerialNumber;

        if (sku && serialNumber) {
          if (!acc[sku]) {
            acc[sku] = [];
          }

          acc[sku].push({ serialNumber });
        }
        return acc;
      }, {});

      const result = await this.#inventoryService.createBulkAdjustments({
        warehouseId,
        adjustmentType,
        reason,
        note,
        componentsBySku,
        adjustedByUserId,
        roleName,
        companyId,
      });

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default InventoryController;
