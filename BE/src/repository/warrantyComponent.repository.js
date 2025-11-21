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

    const { count, rows } = await WarrantyComponent.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: TypeComponent,
          as: "typeComponent",
          attributes: ["name", "sku", "typeComponentId", "category"],
        },
        {
          model: VehicleModel,
          as: "vehicleModel",
          attributes: ["vehicleModelName", "vehicleModelId", "sku"],
          include: [
            {
              model: db.VehicleCompany,
              as: "company",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    return {
      totalItems: count,
      items: rows.map((row) => {
        const json = row.toJSON();
        // Flatten company name to makeBrand for easier frontend access
        if (json.vehicleModel?.company) {
          json.vehicleModel.makeBrand = json.vehicleModel.company.name;
          delete json.vehicleModel.company;
        }
        return json;
      }),
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
          attributes: ["name", "sku", "typeComponentId", "category"],
        },
        {
          model: VehicleModel,
          as: "vehicleModel",
          attributes: ["vehicleModelName", "vehicleModelId", "sku"],
          include: [
            {
              model: db.VehicleCompany,
              as: "company",
              attributes: ["name"],
            },
          ],
        },
      ],
    });
    if (!record) return null;
    
    const json = record.toJSON();
    // Flatten company name to makeBrand for easier frontend access
    if (json.vehicleModel?.company) {
      json.vehicleModel.makeBrand = json.vehicleModel.company.name;
      delete json.vehicleModel.company;
    }
    return json;
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
