import express from "express";
import {
  authentication,
  authorizationByRole,
  validate,
  attachCompanyContext,
} from "../middleware/index.js";
import { warrantyComponentSchema } from "../../validators/warrantyComponent.validator.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  authentication,
  authorizationByRole(["parts_coordinator_company"]),
  attachCompanyContext,
  validate(warrantyComponentSchema, "body"),

  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.createWarrantyComponent(req, res, next);
  }
);

router.get(
  "/",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "company_admin",
    "service_center_manager",
  ]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.getAllWarrantyComponents(req, res, next);
  }
);

router.get(
  "/:id",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "company_admin",
    "service_center_manager",
  ]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.getWarrantyComponentById(req, res, next);
  }
);

router.put(
  "/:id",
  authentication,
  authorizationByRole(["parts_coordinator_company", "company_admin"]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.updateWarrantyComponent(req, res, next);
  }
);

router.delete(
  "/:id",
  authentication,
  authorizationByRole(["parts_coordinator_company", "company_admin"]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.deleteWarrantyComponent(req, res, next);
  }
);

export default router;
