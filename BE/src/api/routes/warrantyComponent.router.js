import express from "express";
import {
  authentication,
  authorizationByRole,
  validate,
} from "../middleware/index.js";
import { warrantyComponentSchema } from "../../validators/warrantyComponent.validator.js";

const router = express.Router();

router.post(
  "/",
  authentication,
  authorizationByRole(["parts_coordinator_company"]),
  validate(warrantyComponentSchema, "body"),

  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.createWarrantyComponent(req, res, next);
  }
);

export default router;
