import Joi from "joi";

const categorySchema = Joi.string().valid(
  // === EV Specific Systems ===
  "HIGH_VOLTAGE_BATTERY", // Pin Cao áp & BMS
  "POWERTRAIN", // Động cơ điện, Biến tần, Hộp số
  "CHARGING_SYSTEM", // Hệ thống Sạc & Cổng sạc
  "THERMAL_MANAGEMENT", // Quản lý nhiệt (Pin & Động cơ)

  // === Standard Systems ===
  "LOW_VOLTAGE_SYSTEM", // Hệ thống điện 12V & Phụ kiện
  "BRAKING", // Hệ thống Phanh (bao gồm cả phanh tái sinh)
  "SUSPENSION_STEERING", // Hệ thống Treo & Lái
  "HVAC", // Điều hòa không khí Cabin
  "BODY_CHASSIS", // Thân vỏ & Khung gầm
  "INFOTAINMENT_ADAS" // Thông tin giải trí & Hỗ trợ lái
);

export const warrantyComponentSchema = Joi.object({
  typeComponentId: Joi.string().uuid(),
  name: Joi.string().max(255),
  price: Joi.number().precision(2).min(0),
  sku: Joi.string().max(255),
  category: categorySchema,
  makeBrand: Joi.string().max(255),
  quantity: Joi.number().integer().min(0).required(),
  durationMonth: Joi.number().integer().min(0).required(),
  mileageLimit: Joi.number().integer().min(0).required(),
})
  .when("typeComponentId", {
    is: Joi.exist(),
    then: Joi.object({
      typeComponentId: Joi.string().uuid().required(),
      name: Joi.forbidden(),
      price: Joi.forbidden(),
      sku: Joi.forbidden(),
      category: Joi.forbidden(),
      makeBrand: Joi.forbidden(),
    }),
    otherwise: Joi.object({
      name: Joi.string().max(255).required(),
      price: Joi.number().precision(2).min(0).required(),
      sku: Joi.string().max(255).required(),
      category: categorySchema.required(),
      makeBrand: Joi.string().max(255).required(),
    }),
  })
  .xor("typeComponentId", "sku");
