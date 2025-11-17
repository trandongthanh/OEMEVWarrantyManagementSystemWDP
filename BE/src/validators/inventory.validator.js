import Joi from "joi";

export const createInventoryAdjustmentBodySchema = Joi.object({
  stockId: Joi.string().uuid().required(),
  adjustmentType: Joi.string().valid("IN", "OUT").required(),
  reason: Joi.string().required(),
  note: Joi.string().allow(null, "").optional(),

  components: Joi.array()
    .items(
      Joi.object({
        serialNumber: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});
