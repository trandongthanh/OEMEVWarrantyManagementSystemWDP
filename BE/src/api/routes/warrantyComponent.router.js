import express from "express";
import {
  authentication,
  authorizationByRole,
  attachCompanyContext,
  validate,
} from "../middleware/index.js";
import { warrantyComponentSchema } from "../../validators/warrantyComponent.validator.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: WarrantyComponent
 *   description: Warranty Component management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WarrantyComponent:
 *       type: object
 *       properties:
 *         warrantyComponentId:
 *           type: string
 *           format: uuid
 *         vehicleModelId:
 *           type: string
 *           format: uuid
 *         typeComponentId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *         durationMonth:
 *           type: integer
 *         mileageLimit:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /warranty-components/{vehicleModelId}:
 *   post:
 *     summary: Create warranty components for a vehicle model
 *     tags: [WarrantyComponent]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleModelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle Model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 typeComponentId:
 *                   type: string
 *                   format: uuid
 *                   description: Existing TypeComponent ID (xor with sku)
 *                 sku:
 *                   type: string
 *                   description: New TypeComponent SKU (xor with typeComponentId)
 *                 name:
 *                   type: string
 *                   description: Required if creating new TypeComponent
 *                 price:
 *                   type: number
 *                   description: Required if creating new TypeComponent
 *                 category:
 *                   type: string
 *                   description: Required if creating new TypeComponent
 *                 makeBrand:
 *                   type: string
 *                   description: Required if creating new TypeComponent
 *                 quantity:
 *                   type: integer
 *                   minimum: 0
 *                 durationMonth:
 *                   type: integer
 *                   minimum: 0
 *                 mileageLimit:
 *                   type: integer
 *                   minimum: 0
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Vehicle Model not found
 *       409:
 *         description: Conflict (Duplicate SKU or TypeComponentId)
 */
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

/**
 * @swagger
 * /warranty-components:
 *   get:
 *     summary: Get all warranty components
 *     tags: [WarrantyComponent]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: vehicleModelId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: typeComponentId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of warranty components
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WarrantyComponent'
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 */
router.get(
  "/",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "emv_admin",
    "service_center_manager",
  ]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.getAllWarrantyComponents(req, res, next);
  }
);

/**
 * @swagger
 * /warranty-components/{id}:
 *   get:
 *     summary: Get warranty component by ID
 *     tags: [WarrantyComponent]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Warranty component details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/WarrantyComponent'
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "emv_admin",
    "service_center_manager",
  ]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.getWarrantyComponentById(req, res, next);
  }
);

/**
 * @swagger
 * /warranty-components/{id}:
 *   put:
 *     summary: Update warranty component
 *     tags: [WarrantyComponent]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               durationMonth:
 *                 type: integer
 *               mileageLimit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/WarrantyComponent'
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  authentication,
  authorizationByRole(["parts_coordinator_company", "emv_admin"]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.updateWarrantyComponent(req, res, next);
  }
);

/**
 * @swagger
 * /warranty-components/{id}:
 *   delete:
 *     summary: Delete warranty component
 *     tags: [WarrantyComponent]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.delete(
  "/:id",
  authentication,
  authorizationByRole(["parts_coordinator_company", "emv_admin"]),
  async (req, res, next) => {
    const warrantyComponentController = req.container.resolve(
      "warrantyComponentController"
    );
    await warrantyComponentController.deleteWarrantyComponent(req, res, next);
  }
);

export default router;
