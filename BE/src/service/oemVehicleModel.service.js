import db from "../models/index.cjs";
import { ConflictError, NotFoundError } from "../error/index.js";

class OemVehicleModelService {
  #oemVehicleModelRepository;
  #warrantyComponentRepository;
  #typeComponentRepository;

  constructor({
    oemVehicleModelRepository,
    warrantyComponentRepository,
    typeComponentRepository,
  }) {
    this.#oemVehicleModelRepository = oemVehicleModelRepository;
    this.#warrantyComponentRepository = warrantyComponentRepository;
    this.#typeComponentRepository = typeComponentRepository;
  }

  createVehicleModel = async ({
    vehicleModelName,
    sku,
    yearOfLaunch,
    placeOfManufacture,
    generalWarrantyDuration,
    generalWarrantyMileage,
    companyId,
    components = [],
  }) => {
    return db.sequelize.transaction(async (transaction) => {
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

      // Create warranty components if provided
      if (components && components.length > 0) {
        const warrantyComponentsData = components.map((comp) => ({
          vehicleModelId: vehicleModel.vehicleModelId,
          typeComponentId: comp.typeComponentId,
          durationMonth: comp.durationMonth,
          mileageLimit: comp.mileageLimit,
          quantity: comp.quantity,
        }));

        await this.#warrantyComponentRepository.bulkCreateWarrantyComponents(
          { warrantyComponents: warrantyComponentsData },
          transaction
        );
      }

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
