import db from "../models/index.cjs";
const {
  Vehicle,
  Customer,
  VehicleModel,
  VehicleCompany,
  TypeComponent,
  Component,
} = db;

class VehicleRepository {
  findAllByVins = async (vins, transaction = null) => {
    const vehicles = await Vehicle.findAll({
      where: {
        vin: vins,
      },
      attributes: ["vin"],
      transaction,
    });
    return vehicles.map((v) => v.toJSON());
  };

  bulkCreate = async (vehicles, transaction = null) => {
    const newVehicles = await Vehicle.bulkCreate(vehicles, {
      transaction,
      ignoreDuplicates: false,
    });
    return newVehicles;
  };

  findByVinAndCompany = async (
    { vin, companyId },
    option = null,
    lock = null
  ) => {
    const existingVehicle = await Vehicle.findOne({
      where: {
        vin: vin,
      },

      attributes: ["vin", "dateOfManufacture", "licensePlate", "purchaseDate"],

      include: [
        {
          model: Customer,
          as: "owner",

          attributes: ["fullName", "email", "phone", "address"],
        },

        {
          model: VehicleModel,
          as: "model",
          attributes: [["vehicle_model_name", "modelName"]],
          required: true,

          include: [
            {
              model: VehicleCompany,
              as: "company",
              where: { vehicleCompanyId: companyId },
              attributes: ["name", "vehicleCompanyId"],

              required: true,
            },
          ],
        },
      ],

      transaction: option,
      lock: lock,
    });

    if (!existingVehicle) {
      return null;
    }

    return existingVehicle.toJSON();
  };

  updateOwner = async (
    { companyId, vin, customerId, licensePlate, purchaseDate },
    option = null
  ) => {
    const rowEffect = await Vehicle.update(
      {
        ownerId: customerId,
        licensePlate: licensePlate,
        purchaseDate: purchaseDate,
      },
      {
        where: {
          vin: vin,
        },
        transaction: option,
      }
    );

    if (rowEffect <= 0) {
      return null;
    }

    const updatedVehicle = await this.findByVinAndCompany(
      {
        vin: vin,
        companyId: companyId,
      },
      option
    );

    if (!updatedVehicle) {
      return null;
    }

    return updatedVehicle;
  };

  findVehicleWithTypeComponentByVin = async ({ vin, companyId }) => {
    const existingVehicle = await Vehicle.findOne({
      where: {
        vin: vin,
      },

      attributes: ["vin", "purchaseDate", "dateOfManufacture"],

      include: [
        {
          model: VehicleModel,
          as: "model",
          attributes: ["generalWarrantyDuration", "generalWarrantyMileage"],

          required: true,
          include: [
            {
              model: TypeComponent,
              as: "typeComponents",
              attributes: ["typeComponentId", "name", "category"],
              through: { attributes: ["durationMonth", "mileageLimit"] },
            },

            {
              model: VehicleCompany,
              as: "company",
              where: { vehicleCompanyId: companyId },
              attributes: ["name"],

              required: true,
            },
          ],
        },
      ],
    });

    if (!existingVehicle) {
      return null;
    }

    return existingVehicle.toJSON();
  };

  findVehicleExist = async ({ vin }, option = null) => {
    const existingVehicle = await Vehicle.findOne({
      where: {
        vin: vin,
      },
      transaction: option,
      attributes: ["vin"],
    });

    if (!existingVehicle) {
      return false;
    }

    return true;
  };

  findWarrantedComponentsByVehicleVin = async (
    { vin, companyId, status },
    option = null
  ) => {
    const componentWhere = {};

    if (status && status !== "ALL") {
      componentWhere.status = status;
    }

    const vehicle = await Vehicle.findOne({
      where: {
        vin: vin,
      },
      attributes: ["vin"],
      include: [
        {
          model: VehicleModel,
          as: "model",
          attributes: [],
          required: true,
          include: [
            {
              model: VehicleCompany,
              as: "company",
              attributes: [],
              where: { vehicleCompanyId: companyId },
              required: true,
            },
          ],
        },
        {
          model: Component,
          as: "components",
          attributes: ["componentId", "serialNumber", "status", "installedAt"],
          where:
            Object.keys(componentWhere).length > 0 ? componentWhere : undefined,
          required: false,
          include: [
            {
              model: TypeComponent,
              as: "typeComponent",
              attributes: [
                "typeComponentId",
                "name",
                "sku",
                "category",
                "price",
              ],
            },
          ],
        },
      ],
      transaction: option,
    });

    if (!vehicle) {
      return null;
    }

    return vehicle.toJSON();
  };
}

export default VehicleRepository;
