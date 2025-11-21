import db from "../models/index.cjs";

const { WarrantyComponent, TypeComponent, VehicleModel } = db;

class WarrantyComponentRepository {
  createWarrantyComponent = async ({
    vehicleModelId,
    typeComponentId,
    quantity,
    durationMonth,
    mileageLimit,
    transaction,
  }) => {
    return WarrantyComponent.create(
      {
        vehicleModelId,
        typeComponentId,
        quantity,
        durationMonth,
        mileageLimit,
      },
      { transaction }
    );
  };

  bulkCreateWarrantyComponents = async (
    { warrantyComponents },
    transaction
  ) => {
    if (!warrantyComponents || warrantyComponents.length === 0) {
      return [];
    }

    const created = await WarrantyComponent.bulkCreate(warrantyComponents, {
      transaction,
      returning: true,
    });

    return created.map((record) => record.toJSON());
  };

  findByVehicleModelAndTypeComponent = async ({
    vehicleModelId,
    typeComponentId,
    transaction,
  }) => {
    const warrantyComponent = await WarrantyComponent.findOne({
      where: {
        vehicleModelId: vehicleModelId,
        typeComponentId: typeComponentId,
      },
      transaction: transaction,
    });

    return warrantyComponent ? warrantyComponent.toJSON() : null;
  };

  findAll = async ({
    page,
    limit,
    vehicleModelId,
    typeComponentId,
    companyId,
  }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (vehicleModelId) where.vehicleModelId = vehicleModelId;
    if (typeComponentId) where.typeComponentId = typeComponentId;

    const { count, rows } = await WarrantyComponent.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: TypeComponent,
          as: "typeComponent",
          attributes: ["name", "sku", "typeComponentId"],
        },
        {
          model: VehicleModel,
          as: "vehicleModel",
          attributes: ["name", "vehicleModelId"],
        },
      ],
    });

    return {
      totalItems: count,
      items: rows.map((row) => row.toJSON()),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  };

  findById = async (id, transaction = null) => {
    const record = await WarrantyComponent.findByPk(id, {
      transaction,
      include: [
        {
          model: TypeComponent,
          as: "typeComponent",
          attributes: ["name", "sku"],
        },
        {
          model: VehicleModel,
          as: "vehicleModel",
          attributes: ["name"],
        },
      ],
    });
    return record ? record.toJSON() : null;
  };

  update = async ({ id, data }, transaction = null) => {
    const [updatedCount] = await WarrantyComponent.update(data, {
      where: { warrantyComponentId: id },
      transaction,
    });
    return updatedCount > 0;
  };

  delete = async (id, transaction = null) => {
    const deletedCount = await WarrantyComponent.destroy({
      where: { warrantyComponentId: id },
      transaction,
    });
    return deletedCount > 0;
  };

  isTypeComponentCoveredByCompany = async (
    { typeComponentId, companyId },
    transaction = null
  ) => {
    if (!typeComponentId) {
      return false;
    }

    if (!companyId) {
      return true;
    }

    const count = await WarrantyComponent.count({
      where: {
        typeComponentId,
      },
      include: [
        {
          model: VehicleModel,
          as: "vehicleModel",
          attributes: [],
          required: true,
          where: {
            vehicleCompanyId: companyId,
          },
        },
      ],
      transaction,
    });

    return count > 0;
  };
}

export default WarrantyComponentRepository;
