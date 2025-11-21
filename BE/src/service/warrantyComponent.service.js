import { ConflictError, NotFoundError } from "../error/index.js";
import db from "../models/index.cjs";

class WarrantyComponentService {
  #warrantyComponentRepository;
  #oemVehicleModelRepository;
  #typeComponentRepository;

  constructor({
    warrantyComponentRepository,
    oemVehicleModelRepository,
    typeComponentRepository,
  }) {
    this.#warrantyComponentRepository = warrantyComponentRepository;
    this.#oemVehicleModelRepository = oemVehicleModelRepository;
    this.#typeComponentRepository = typeComponentRepository;
  }

  createWarrantyComponents = async ({
    vehicleModelId,
    typeComponents,
    companyId,
  }) => {
    const rawResult = await db.sequelize.transaction(async (transaction) => {
      const existingTypeComponentItems = typeComponents.filter(
        (item) => item.typeComponentId
      );
      const newTypeComponentItems = typeComponents.filter(
        (item) => !item.typeComponentId
      );

      const existingTypeComponentIds = existingTypeComponentItems.map(
        (item) => item.typeComponentId
      );

      const duplicatedExistingId = new Set();
      for (const id of existingTypeComponentIds) {
        if (duplicatedExistingId.has(id)) {
          throw new ConflictError(`Duplicate typeComponentId provided: ${id}`);
        }
        duplicatedExistingId.add(id);
      }

      if (existingTypeComponentIds.length > 0) {
        const existingRecords = await this.#typeComponentRepository.findByIds(
          existingTypeComponentIds,
          transaction
        );

        if (existingRecords.length !== existingTypeComponentIds.length) {
          throw new NotFoundError("One or more type components do not exist");
        }
      }

      const newTypeComponentSkus = newTypeComponentItems.map(
        (item) => item.sku
      );

      const newSku = new Set();
      for (const sku of newTypeComponentSkus) {
        if (newSku.has(sku)) {
          throw new ConflictError(`Duplicate SKU provided: ${sku}`);
        }

        newSku.add(sku);
      }

      if (newTypeComponentSkus.length > 0) {
        const existedSkus = await this.#typeComponentRepository.findBySkus(
          newTypeComponentSkus,
          transaction
        );

        if (existedSkus.length > 0) {
          throw new ConflictError(`Type component SKU already exists`);
        }
      }

      const existVehicleModel =
        await this.#oemVehicleModelRepository.findByIdAndCompanyId({
          vehicleModelId,
          companyId,
        });

      if (!existVehicleModel) {
        throw new NotFoundError("Vehicle model not found");
      }

      let createdTypeComponents = [];
      if (newTypeComponentItems.length > 0) {
        const typeComponentsPayload = newTypeComponentItems.map(
          ({ name, price, sku, category, makeBrand }) => ({
            name,
            price,
            sku,
            category,
            makeBrand,
          })
        );

        createdTypeComponents =
          await this.#typeComponentRepository.bulkCreateTypeComponents(
            typeComponentsPayload,
            transaction
          );
      }

      const createdTypeComponentBySku = new Map(
        createdTypeComponents.map((item) => [item.sku, item])
      );

      const warrantyComponents = [];

      for (const item of existingTypeComponentItems) {
        warrantyComponents.push({
          vehicleModelId,
          typeComponentId: item.typeComponentId,
          quantity: item.quantity,
          durationMonth: item.durationMonth,
          mileageLimit: item.mileageLimit,
        });
      }

      for (const item of newTypeComponentItems) {
        const created = createdTypeComponentBySku.get(item.sku);

        if (!created) {
          throw new ConflictError(
            `Failed to create type component with SKU ${item.sku}`
          );
        }

        warrantyComponents.push({
          vehicleModelId,
          typeComponentId: created.typeComponentId,
          quantity: item.quantity,
          durationMonth: item.durationMonth,
          mileageLimit: item.mileageLimit,
        });
      }

      if (warrantyComponents.length === 0) {
        throw new ConflictError("No warranty components provided");
      }

      return this.#warrantyComponentRepository.bulkCreateWarrantyComponents(
        {
          warrantyComponents,
        },
        transaction
      );
    });

    return rawResult;
  };

  getWarrantyComponents = async ({
    page = 1,
    limit = 10,
    vehicleModelId,
    typeComponentId,
    companyId,
  }) => {
    const result = await this.#warrantyComponentRepository.findAll(
      {
        page: parseInt(page),
        limit: parseInt(limit),
        vehicleModelId,
        typeComponentId,
        companyId,
      },
      null
    );

    return result;
  };
}

export default WarrantyComponentService;
