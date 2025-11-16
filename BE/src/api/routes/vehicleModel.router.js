import express from "express";
import {
  attachCompanyContext,
  authentication,
  authorizationByRole,
  validate,
} from "../middleware/index.js";
import warrantyComponents from "./warrantyComponent.router.js";
import {
  createVehicleModelSchema,
  getMostProblematicModelsSchema,
} from "../../validators/oemVehicleModel.validator.js";

const router = express.Router();

/**
 * @swagger
 * /oem-vehicle-models/statistics/most-problematic:
 *   get:
 *     summary: Thống kê các mẫu xe gặp nhiều sự cố nhất
 *     description: >-
 *       Lấy danh sách các mẫu xe được sắp xếp theo số lượng mục sửa chữa (case line) giảm dần.
 *       Endpoint này giúp xác định các mẫu xe thường xuyên gặp sự cố nhất.
 *       Yêu cầu quyền `oem_admin`.
 *     tags: [Vehicle Model, Statistics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Giới hạn số lượng mẫu xe trả về.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc các sự cố từ ngày này (định dạng ISO 8601).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc các sự cố đến ngày này (định dạng ISO 8601).
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thống kê thành công.
 *       400:
 *         description: Tham số không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/statistics/most-problematic",
  authentication,
  authorizationByRole(["service_center_manager"]),
  validate(getMostProblematicModelsSchema, "query"),
  async (req, res, next) => {
    const oemVehicleModelController = req.container.resolve(
      "oemVehicleModelController"
    );
    await oemVehicleModelController.getMostProblematicModels(req, res, next);
  }
);

/**
 * @swagger
 * /oem-vehicle-models:
 *   post:
 *     summary: Tạo một mẫu xe mới
 *     description: >-
 *       Tạo một mẫu xe (vehicle model) mới trong hệ thống.
 *       Yêu cầu quyền `parts_coordinator_company`.
 *     tags: [Vehicle Model]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleModelName
 *               - vehicleCompanyId
 *               - sku
 *             properties:
 *               vehicleModelName:
 *                 type: string
 *                 description: Tên của mẫu xe.
 *                 example: "VF e34"
 *               vehicleCompanyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của công ty sản xuất xe.
 *               sku:
 *                 type: string
 *                 description: Mã SKU duy nhất cho mẫu xe.
 *                 example: "VFE34-PLUS-2023"
 *     responses:
 *       201:
 *         description: Tạo mẫu xe thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       409:
 *         description: Xung đột (ví dụ: SKU đã tồn tại).
 */
router.post(
  "/",
  authentication,
  authorizationByRole(["parts_coordinator_company"]),
  validate(createVehicleModelSchema, "body"),
  async (req, res, next) => {
    const oemVehicleModelController = req.container.resolve(
      "oemVehicleModelController"
    );

    await oemVehicleModelController.createVehicleModel(req, res, next);
  }
);

router.use("/:vehicleModelId/warranty-components", warrantyComponents);
export default router;
