import db from "../models/index.cjs";

const { InventoryAdjustment, Stock, Warehouse, TypeComponent, User } = db;

class InventoryAdjustmentRepository {
  createInventoryAdjustment = async (adjustmentData, transaction = null) => {
    const record = await InventoryAdjustment.create(adjustmentData, {
      transaction: transaction,
    });

    return record.toJSON();
  };

  findAllAndCount = async ({
    where,
    stockWhere,
    warehouseWhere,
    limit,
    offset,
  }) => {
    const result = await InventoryAdjustment.findAndCountAll({
      where: where,
      include: [
        {
          model: Stock,
          as: "stock",
          required: true,
          where: stockWhere,
          include: [
            {
              model: Warehouse,
              as: "warehouse",
              required: true,
              where: warehouseWhere,
            },
            {
              model: TypeComponent,
              as: "typeComponent",
              required: true,
            },
          ],
        },
        {
          model: User,
          as: "adjustedBy",
          attributes: ["userId", "name", "email"],
        },
      ],
      limit: limit,
      offset: offset,
      order: [["adjustedAt", "DESC"]],
      distinct: true,
    });

    return result;
  };

  findById = async ({ where, stockWhere, warehouseWhere }) => {
    const result = await InventoryAdjustment.findOne({
      where: where,
      include: [
        {
          model: Stock,
          as: "stock",
          required: true,
          where: stockWhere,
          include: [
            {
              model: Warehouse,
              as: "warehouse",
              required: true,
              where: warehouseWhere,
            },
            {
              model: TypeComponent,
              as: "typeComponent",
              required: true,
            },
          ],
        },
        {
          model: User,
          as: "adjustedBy",
          attributes: ["userId", "name", "email"],
        },
      ],
    });

    return result;
  };
}

export default InventoryAdjustmentRepository;
