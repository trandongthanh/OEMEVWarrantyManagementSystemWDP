import dayjs from "dayjs";
import Joi from "joi";

const CATEGORY_ENUM = [
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

const categoriesSchema = () =>
  Joi.alternatives()
    .try(
      Joi.array()
        .items(Joi.string().valid(...CATEGORY_ENUM))
        .min(1)
        .unique(),
      Joi.string().valid(...CATEGORY_ENUM)
    )
    .optional();

export const findVehicleByVinWithWarrantyParamsSchema = Joi.object({
  vin: Joi.string().length(17).required(),
  // vin: Joi.string().required(),
});

export const findVehicleByVinWithWarrantyQuerySchema = Joi.object({
  odometer: Joi.number().min(0).required(),
  categories: categoriesSchema(),
});

export const findVehicleByVinWithWarrantyPreviewParamsSchema = Joi.object({
  vin: Joi.string().length(17).required(),
  // vin: Joi.string().required(),
});

export const findVehicleByVinWithWarrantyPreviewBodySchema = Joi.object({
  odometer: Joi.number().min(0).required(),

  purchaseDate: Joi.date().max(dayjs()).required(),
  categories: categoriesSchema(),
});
