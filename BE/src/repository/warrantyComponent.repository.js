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
    // Assuming validation of companyId ownership is done in service layer or implied by vehicleModel ownership
    // If vehicleModel belongs to company, we could filter by checking VehicleModel association.
    // For simplicity, we'll rely on vehicleModelId filter or assume super admin/company admin context is handled.

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
}

export default WarrantyComponentRepository;
