import dayjs from "dayjs";
import * as xlsx from "xlsx";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../error/index.js";
import db from "../models/index.cjs";
import { Transaction } from "sequelize";

const TYPE_COMPONENT_CATEGORIES = [
  "HIGH_VOLTAGE_BATTERY",
  "POWERTRAIN",
  "CHARGING_SYSTEM",
  "THERMAL_MANAGEMENT",
  "LOW_VOLTAGE_SYSTEM",
  "BRAKING",
  "SUSPENSION_STEERING",
  "HVAC",
  "BODY_CHASSIS",
  "INFOTAINMENT_ADAS",
];

const TYPE_COMPONENT_CATEGORY_SET = new Set(TYPE_COMPONENT_CATEGORIES);

class VehicleService {
  #vehicleRepository;
  #customerService;
  #componentRepository;
  #oemVehicleModelRepository;

  constructor({
    vehicleRepository,
    customerService,
    componentRepository,
    oemVehicleModelRepository,
  }) {
    this.#vehicleRepository = vehicleRepository;
    this.#customerService = customerService;
    this.#componentRepository = componentRepository;
    this.#oemVehicleModelRepository = oemVehicleModelRepository;
  }

  bulkCreateFromExcel = async (fileBuffer, companyId) => {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });

    if (rows.length <= 1) {
      throw new BadRequestError("Excel file is empty or has invalid format.");
    }

    const requiredHeaders = [
      "vin",
      "model_sku",
      "date_of_manufacture",
      "place_of_manufacture",
    ];

    const headerRow = rows[0] || [];
    const normalizedHeaders = headerRow.map((header) =>
      typeof header === "string" ? header.trim().toLowerCase() : ""
    );

    for (const header of requiredHeaders) {
      if (!normalizedHeaders.includes(header)) {
        throw new BadRequestError(
          `Missing required column in Excel file: ${header}`
        );
      }
    }

    const data = xlsx.utils.sheet_to_json(worksheet, {
      header: requiredHeaders,
      range: 1,
      defval: null,
      blankrows: false,
    });

    const vins = data.map((row) => row.vin);
    const skus = [...new Set(data.map((row) => row.model_sku))];

    const [existingVehicles, vehicleModels] = await Promise.all([
      this.#vehicleRepository.findAllByVins(vins),

      Promise.all(
        skus.map((sku) => this.#oemVehicleModelRepository.findBySku(sku))
      ),
    ]);

    const existingVins = new Set(existingVehicles.map((v) => v.vin));

    const vehicleModelMap = new Map(
      vehicleModels.filter(Boolean).map((model) => [model.sku, model])
    );

    const vehiclesToCreate = [];
    const errors = [];
    const seenVinInFile = new Set();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowIndex = i + 2;

      const vin = row.vin;

      if (seenVinInFile.has(vin)) {
        errors.push(
          `Row ${rowIndex}: VIN '${vin}' is duplicated within the file.`
        );

        continue;
      }

      seenVinInFile.add(vin);

      if (existingVins.has(vin)) {
        errors.push(`Row ${rowIndex}: VIN '${vin}' already exists.`);
        continue;
      }

      const model = vehicleModelMap.get(row.model_sku);
      if (!model) {
        errors.push(`Row ${rowIndex}: Model SKU '${row.model_sku}' not found.`);

        continue;
      }

      if (model.vehicleCompanyId !== companyId) {
        errors.push(
          `Row ${rowIndex}: Model SKU '${row.model_sku}' does not belong to your company.`
        );
        continue;
      }

      vehiclesToCreate.push({
        vin: row.vin,
        vehicleModelId: model.vehicleModelId,
        dateOfManufacture: row.date_of_manufacture,
        placeOfManufacture: row.place_of_manufacture,
      });
    }

    if (vehiclesToCreate.length > 0) {
      await this.#vehicleRepository.bulkCreate(vehiclesToCreate);
    }

    return {
      successCount: vehiclesToCreate.length,
      failureCount: errors.length,
      errors: errors,
    };
  };

  getVehicleProfile = async ({ vin, companyId }, option = null) => {
    if (!vin) {
      throw new BadRequestError("vin is required");
    }

    if (!companyId) {
      throw new ForbiddenError("You do not have permission");
    }

    const vehicle = await this.#vehicleRepository.findByVinAndCompany(
      {
        vin: vin,
        companyId: companyId,
      },
      option
    );

    if (!vehicle) {
      return null;
    }

    const formatResult = {
      vin: vehicle?.vin,
      dateOfManufacture: vehicle?.dateOfManufacture,
      placeOfManufacture: vehicle?.placeOfManufacture,
      licensePlate: vehicle?.licensePlate,
      purchaseDate: vehicle?.purchaseDate,
      owner: vehicle?.owner,
      model: vehicle?.model?.modelName,
      company: vehicle?.model?.company?.name,
    };

    return formatResult;
  };

  registerOwnerForVehicle = async ({
    customer,
    vin,
    ownerId,
    companyId,
    dateOfManufacture,
    licensePlate,
    purchaseDate,
  }) => {
    if (!companyId) {
      throw new ForbiddenError("You do not have permission");
    }

    const dateValidationResult = this.#validateVehicleDatesWithDayjs(
      purchaseDate,
      dateOfManufacture
    );

    if (!dateValidationResult.valid) {
      throw new BadRequestError(dateValidationResult.error);
    }

    return await db.sequelize.transaction(async (t) => {
      let customerId;

      if (ownerId) {
        const customer = await this.#customerService.checkExistCustomerById(
          {
            id: ownerId,
          },
          t,
          Transaction.LOCK.SHARE
        );

        if (!customer) {
          throw new NotFoundError(
            `Cannot find customer with this id: ${ownerId}`
          );
        }

        customerId = ownerId;
      } else if (customer) {
        const isValidCustomer =
          await this.#customerService.checkDuplicateCustomer(
            {
              phone: customer.phone,
              email: customer.email,
            },
            t
          );

        if (isValidCustomer) {
          throw new BadRequestError(
            `Customer already exists with this info ${customer.phone} ${customer.email}`
          );
        }

        const newCustomer = await this.#customerService.createCustomer(
          {
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
          },
          t
        );

        customerId = newCustomer.id;
      } else {
        throw new BadRequestError(
          "Client must provide customer or customerId to register for owner for vehicle"
        );
      }

      const existingVehicle = await this.getVehicleProfile(
        {
          vin: vin,
          companyId: companyId,
        },
        t
      );
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle not found with this vin: ${vin}`);
      }

      if (!existingVehicle?.dateOfManufacture) {
        throw new BadRequestError(
          "Vehicle record is missing dateOfManufacture information"
        );
      }

      const requestedManufactureDate = dayjs(dateOfManufacture);
      const vehicleManufactureDate = dayjs(existingVehicle?.dateOfManufacture);

      if (!requestedManufactureDate.isSame(vehicleManufactureDate, "day")) {
        throw new BadRequestError(
          "Provided dateOfManufacture does not match vehicle record"
        );
      }

      if (existingVehicle?.owner) {
        throw new ConflictError("This vehicle has owner");
      }

      const vehicle = await this.#vehicleRepository.updateOwner(
        {
          companyId: companyId,
          vin: vin,
          customerId: customerId,
          licensePlate: licensePlate,
          purchaseDate: purchaseDate,
        },
        t
      );

      if (!vehicle) {
        throw new ForbiddenError("Cannot update owner for this vehicle");
      }

      const formatResult = {
        vin: vehicle?.vin,
        dateOfManufacture: vehicle?.dateOfManufacture,
        placeOfManufacture: vehicle?.placeOfManufacture,
        licensePlate: vehicle?.licensePlate,
        purchaseDate: vehicle?.purchaseDate,
        owner: vehicle?.owner,
        model: vehicle?.model?.modelName,
        company: vehicle?.model?.company?.name,
      };

      return formatResult;
    });
  };

  findVehicleByVinWithWarranty = async ({
    vin,
    companyId,
    odometer,
    categories,
  }) => {
    const existingVehicle =
      await this.#vehicleRepository.findVehicleWithTypeComponentByVin({
        vin: vin,
        companyId,
      });

    if (!existingVehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    const categoryFilter = this.#normalizeCategories(categories);

    const vehicleWithWarranty = this.#checkWarrantyForVehicle({
      vehicle: existingVehicle,
      odometer,
      purchaseDate: dayjs(existingVehicle.purchaseDate),
      categories: categoryFilter,
    });

    return vehicleWithWarranty;
  };

  findVehicleByVinWithWarrantyPreview = async ({
    vin,
    companyId,
    odometer,
    purchaseDate,
    categories,
  }) => {
    const purchaseDateFormatted = dayjs(purchaseDate);

    if (
      purchaseDateFormatted.isAfter(dayjs()) ||
      !purchaseDateFormatted.isValid()
    ) {
      throw new BadRequestError("Valid purchase date is required");
    }

    const existingVehicle =
      await this.#vehicleRepository.findVehicleWithTypeComponentByVin({
        vin: vin,
        companyId,
      });

    if (!existingVehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    const categoryFilter = this.#normalizeCategories(categories);

    const vehicleWithWarranty = this.#checkWarrantyForVehicle({
      vehicle: existingVehicle,
      odometer,
      purchaseDate: purchaseDateFormatted,
      categories: categoryFilter,
    });

    return vehicleWithWarranty;
  };

  getVehicleComponents = async ({ vin, companyId, status = "INSTALLED" }) => {
    if (!vin) {
      throw new BadRequestError("vin is required");
    }

    if (!companyId) {
      throw new ForbiddenError("You do not have permission");
    }

    const normalizedStatus =
      typeof status === "string" ? status.toUpperCase() : status;

    const vehicle =
      await this.#vehicleRepository.findWarrantedComponentsByVehicleVin({
        vin,
        companyId,
        status: normalizedStatus,
      });

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found");
    }

    const vehicleComponents = vehicle.components || [];

    return vehicleComponents;
  };

  #validateVehicleDatesWithDayjs(purchaseDateStr, dateOfManufactureStr) {
    const purchaseDate = dayjs(purchaseDateStr);
    const dateOfManufacture = dayjs(dateOfManufactureStr);

    if (!purchaseDate.isValid() || !dateOfManufacture.isValid()) {
      return {
        valid: false,
        error: "Valid purchase date and date of manufacture are required",
      };
    }

    const today = dayjs();

    if (purchaseDate.isBefore(dateOfManufacture)) {
      return {
        valid: false,
        error: "Purchase date cannot be before manufacture date",
      };
    }

    if (purchaseDate.isAfter(today)) {
      return { valid: false, error: "Purchase date cannot be in the future" };
    }

    return { valid: true };
  }

  #checkWarrantyForVehicle({ vehicle, odometer, purchaseDate, categories }) {
    const vehicleModel = vehicle?.model;

    const generalWarrantyDurationFormated = this.#checkWarrantyStatusByDuration(
      purchaseDate,
      vehicleModel?.generalWarrantyDuration
    );

    const dateOfManufacture = dayjs(vehicle?.dateOfManufacture);

    if (purchaseDate.isBefore(dateOfManufacture, "day")) {
      throw new BadRequestError(
        "Purchase date must be after date of manufacture"
      );
    }

    const generalWarrantyMileageFormated = this.#checkWarrantyStatusByMileage(
      vehicleModel?.generalWarrantyMileage,
      odometer
    );

    const typeComponents = vehicle?.model?.typeComponents || [];

    const filteredComponents =
      Array.isArray(categories) && categories.length
        ? typeComponents.filter((component) =>
            categories.includes(component?.category)
          )
        : typeComponents;

    const typeComponentsWarrantyFormated = filteredComponents.map(
      (component) => {
        const warrantyComponent = component?.WarrantyComponent;

        if (!warrantyComponent) {
          return {
            typeComponentId: component.typeComponentId,
            componentName: component.name,
            category: component.category || null,
            policy: {
              durationMonths: 0,
              mileageLimit: 0,
            },
            duration: {
              status: "EXPIRED",
              endDate: null,
              remainingDays: 0,
              overdueDays: 0,
            },
            mileage: {
              status: "EXPIRED",
              remainingMileage: 0,
              overdueMileage: 0,
            },
          };
        }

        const checkWarrantyComponent = this.#checkWarrantyStatusByDuration(
          purchaseDate,
          warrantyComponent.durationMonth
        );

        const checkWarrantyByMileage = this.#checkWarrantyStatusByMileage(
          warrantyComponent.mileageLimit,
          odometer
        );

        return {
          typeComponentId: component.typeComponentId,
          componentName: component.name,
          category: component.category || null,
          policy: {
            durationMonths: warrantyComponent.durationMonth,
            mileageLimit: warrantyComponent.mileageLimit,
          },
          duration: {
            status: checkWarrantyComponent.status,

            endDate: checkWarrantyComponent.endDate,

            remainingDays: checkWarrantyComponent?.remainingDays ?? 0,

            overdueDays: checkWarrantyComponent?.overdueDays ?? 0,
          },
          mileage: {
            status: checkWarrantyByMileage?.status,
            remainingMileage: checkWarrantyByMileage?.remainingMileage ?? 0,

            overdueMileage: checkWarrantyByMileage?.overdueMileage ?? 0,
          },
        };
      }
    );

    const formatVehicle = {
      vin: vehicle?.vin,
      purchaseDate: purchaseDate,
      currentOdometer: odometer,
      generalWarranty: {
        policy: {
          durationMonths: vehicleModel?.generalWarrantyDuration,
          mileageLimit: vehicleModel?.generalWarrantyMileage,
        },
        duration: {
          status: generalWarrantyDurationFormated?.status,
          endDate: generalWarrantyDurationFormated?.endDate,
          remainingDays: generalWarrantyDurationFormated?.remainingDays,
        },
        mileage: {
          status: generalWarrantyMileageFormated?.status,

          remainingMileage:
            generalWarrantyMileageFormated?.remainingMileage ?? 0,

          overdueMileage: generalWarrantyMileageFormated?.overdueMileage ?? 0,
        },
      },
      componentWarranties: typeComponentsWarrantyFormated,
    };

    return formatVehicle;
  }

  #checkWarrantyStatusByDuration(purchase, duration) {
    const purchaseDate = dayjs(purchase);

    const expiresDate = purchaseDate.add(duration, "month");

    const today = dayjs();

    const isExpired = expiresDate.isBefore(today);

    const endDate = expiresDate.format("YYYY-MM-DD");

    if (isExpired) {
      const overdueDays = today.diff(expiresDate, "day");

      return {
        status: "INACTIVE",
        endDate: endDate,
        overdueDays: overdueDays,
      };
    }

    const remainingDays = expiresDate.diff(today, "day");

    const result = {
      status: "ACTIVE",
      endDate: endDate,
      remainingDays: remainingDays,
    };

    return result;
  }

  #checkWarrantyStatusByMileage(warrantyMileage, currentMileage) {
    const isExpired = currentMileage > warrantyMileage;

    if (isExpired) {
      const overdueMileage = currentMileage - warrantyMileage;
      return {
        status: "INACTIVE",
        overdueMileage: overdueMileage,
      };
    } else {
      const remainingMileage = warrantyMileage - currentMileage;

      return {
        status: "ACTIVE",
        remainingMileage: remainingMileage,
      };
    }
  }

  #normalizeCategories(categories) {
    if (!categories) {
      return null;
    }

    const list = Array.isArray(categories) ? categories : [categories];
    const normalized = [];

    for (const item of list) {
      if (typeof item !== "string") {
        continue;
      }

      const value = item.trim().toUpperCase();

      if (!TYPE_COMPONENT_CATEGORY_SET.has(value)) {
        continue;
      }

      if (!normalized.includes(value)) {
        normalized.push(value);
      }
    }

    return normalized.length > 0 ? normalized : null;
  }
}

export default VehicleService;
