import db from "../models/index.cjs";

const { WarrantyComponent } = db;

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
    const warrantyComponent = await WarrantyComponent.findOne(
      {
        where: {
          vehicleModelId: vehicleModelId,
          typeComponentId: typeComponentId,
        },
      },
      { transaction }
    );

    return warrantyComponent ? warrantyComponent.toJSON() : null;
  };
}

export default WarrantyComponentRepository;
