import { ConflictError, NotFoundError } from "../error/index.js";

class OemVehicleModelService {
  #oemVehicleModelRepository;
  #warrantyComponentRepository;
  #typeComponentRepository;
  #db;

  constructor({
    oemVehicleModelRepository,
    warrantyComponentRepository,
    typeComponentRepository,
    db,
  }) {
    this.#oemVehicleModelRepository = oemVehicleModelRepository;
    this.#warrantyComponentRepository = warrantyComponentRepository;
    this.#typeComponentRepository = typeComponentRepository;
    this.#db = db;
  }

  createVehicleModel = async ({
    vehicleModelName,
    sku,
    yearOfLaunch,
    placeOfManufacture,
    generalWarrantyDuration,
    generalWarrantyMileage,
    companyId,
  }) => {
    return this.#db.sequelize.transaction(async (transaction) => {
      const existingSku = await this.#oemVehicleModelRepository.findBySku(
        sku,
        transaction
      );

      if (existingSku) {
        throw new ConflictError("Vehicle model with this SKU already exists");
      }

      const dataToCreatevehicleModel = {
        vehicleModelName,
        sku,
        yearOfLaunch,
        placeOfManufacture,
        generalWarrantyDuration,
        generalWarrantyMileage,
        vehicleCompanyId: companyId,
      };

      const vehicleModel =
        await this.#oemVehicleModelRepository.createVehicleModel(
          dataToCreatevehicleModel,
          transaction
        );

      return vehicleModel;
    });
  };

  getMostProblematicModels = async ({
    companyId,
    startDate,
    endDate,
    limit,
  }) => {
    const results =
      await this.#oemVehicleModelRepository.findMostProblematicModels({
        companyId,
        startDate,
        endDate,
        limit,
      });

    return results;
  };

  getAllVehicleModels = async ({ companyId }) => {
    if (!companyId) {
      throw new NotFoundError("Company context is required");
    }

    const models = await this.#oemVehicleModelRepository.findAllByCompanyId({
      companyId,
    });

    return models;
  };
}

export default OemVehicleModelService;
