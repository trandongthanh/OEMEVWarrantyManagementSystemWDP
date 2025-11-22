import db from "../models/index.cjs";

const { StockTransferComponent, Component, TypeComponent } = db;

class StockTransferComponentRepository {
  bulkCreate = async ({ items }, transaction = null) => {
    return await StockTransferComponent.bulkCreate(items, { transaction });
  };

  deleteByRequestId = async ({ requestId }, transaction = null) => {
    return await StockTransferComponent.destroy({
      where: { requestId },
      transaction,
    });
  };

  findByRequestId = async ({ requestId }, transaction = null) => {
    const records = await StockTransferComponent.findAll({
      where: { requestId },
      include: [
        {
          model: Component,
          as: "component",
          include: [
            {
              model: TypeComponent,
              as: "typeComponent",
            },
          ],
        },
      ],
      transaction,
    });
    return records.map((r) => r.toJSON());
  };
}

export default StockTransferComponentRepository;
