import express from "express";
import multer from "multer";
import {
  attachCompanyContext,
  authentication,
  authorizationByRole,
  validate,
} from "../middleware/index.js";
import {
  assignOwnerToVehicleBodySchema,
  assignOwnerToVehicleParamsSchema,
} from "../../validators/assignOwnerToVehicle.validator.js";
import {
  findVehicleByVinWithWarrantyParamsSchema,
  findVehicleByVinWithWarrantyPreviewBodySchema,
  findVehicleByVinWithWarrantyPreviewParamsSchema,
  findVehicleByVinWithWarrantyQuerySchema,
} from "../../validators/findVehicleByVinWithWarranty.validator.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /vehicles/bulk-create-template:
 *   get:
 *     summary: Tải file Excel mẫu để tạo xe hàng loạt
 *     description: >-
 *       Tải về một file Excel mẫu chứa các cột cần thiết (`vin`, `model_sku`, `date_of_manufacture`, `place_of_manufacture`)
 *       để sử dụng cho việc tạo xe hàng loạt. Yêu cầu quyền `parts_coordinator_company`.
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: File Excel mẫu.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/bulk-create-template",
  authentication,
  authorizationByRole(["parts_coordinator_company"]),
  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");
    await vehicleController.getBulkCreateTemplate(req, res, next);
  }
);

/**
 * @swagger
 * /vehicles/bulk-create:
 *   post:
 *     summary: Tạo xe hàng loạt từ file Excel
 *     description: >-
 *       Tải lên file Excel để tạo hàng loạt xe mới trong hệ thống.
 *       Chỉ người dùng có vai trò `parts_coordinator_company` mới có quyền thực hiện.
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel chứa dữ liệu các xe cần tạo.
 *     responses:
 *       201:
 *         description: Quá trình tạo hàng loạt hoàn tất, trả về kết quả tóm tắt.
 *       400:
 *         description: Lỗi do file không hợp lệ, thiếu cột, hoặc dữ liệu sai định dạng.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.post(
  "/bulk-create",
  authentication,
  authorizationByRole(["parts_coordinator_company"]),
  attachCompanyContext,
  upload.single("file"),
  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");
    await vehicleController.bulkCreateFromExcel(req, res, next);
  }
);

/**
 * @swagger
 * /vehicles/{vin}:
 *   get:
 *     summary: Tìm kiếm xe theo số VIN
 *     description: >-
 *       Lấy thông tin chi tiết của một chiếc xe dựa trên số VIN.
 *       Yêu cầu quyền `service_center_staff`.
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema: { type: string }
 *         description: Số nhận dạng xe (VIN).
 *     responses:
 *       200:
 *         description: Tìm thấy xe thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy xe với số VIN đã cho.
 */
router.get(
  "/:vin",
  authentication,
  authorizationByRole(["service_center_staff"]),
  attachCompanyContext,

  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");

    await vehicleController.getVehicle(req, res, next);
  }
);

/**
 * @swagger
 * /vehicles/{vin}:
 *   patch:
 *     summary: Gán chủ sở hữu cho xe
 *     description: >-
 *       Đăng ký một khách hàng (mới hoặc đã có) làm chủ sở hữu cho một chiếc xe.
 *       Nếu xe đã có chủ, hệ thống sẽ báo lỗi.
 *       Yêu cầu quyền `service_center_staff`.
 *     tags: [Vehicle]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema: { type: string }
 *         description: Số nhận dạng xe (VIN).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - required: [customerId, dateOfManufacture, licensePlate, purchaseDate]
 *               - required: [customer, dateOfManufacture, licensePlate, purchaseDate]
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của khách hàng đã có trong hệ thống.
 *               customer:
 *                 type: object
 *                 description: Thông tin của khách hàng mới.
 *                 properties:
 *                   fullName: { type: string }
 *                   email: { type: string, format: email }
 *                   phone: { type: string }
 *                   address: { type: string }
 *               dateOfManufacture:
 *                 type: string
 *                 format: date-time
 *                 description: Ngày sản xuất xe.
 *               licensePlate:
 *                 type: string
 *                 description: Biển số xe.
 *               purchaseDate:
 *                 type: string
 *                 format: date-time
 *                 description: Ngày khách hàng mua xe.
 *     responses:
 *       200:
 *         description: Gán chủ sở hữu thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       404:
 *         description: Không tìm thấy xe hoặc khách hàng.
 *       409:
 *         description: Xe này đã có chủ sở hữu.
 */
router.patch(
  "/:vin",
  authentication,
  authorizationByRole(["service_center_staff"]),
  attachCompanyContext,
  validate(assignOwnerToVehicleParamsSchema, "params"),
  validate(assignOwnerToVehicleBodySchema, "body"),

  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");

    await vehicleController.assignOwnerToVehicle(req, res, next);
  }
);

/**
 * @swagger
 * /vehicles/{vin}/warranty:
 *   get:
 *     summary: Kiểm tra thông tin bảo hành của xe
 *     description: >-
 *       Lấy thông tin bảo hành chi tiết của xe dựa trên số VIN và số ODO hiện tại.
 *       Có thể lọc theo các danh mục linh kiện cụ thể.
 *       Yêu cầu quyền `service_center_staff`.
 *     tags: [Vehicle, Warranty]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema: { type: string }
 *         description: Số nhận dạng xe (VIN).
 *       - in: query
 *         name: odometer
 *         required: true
 *         schema: { type: number }
 *         description: Số ODO hiện tại của xe.
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items: { type: string }
 *         style: form
 *         explode: true
 *         description: (Tùy chọn) Danh sách các danh mục linh kiện cần kiểm tra.
 *     responses:
 *       200:
 *         description: Lấy thông tin bảo hành thành công.
 *       400:
 *         description: Thiếu tham số `odometer`.
 *       404:
 *         description: Không tìm thấy xe hoặc xe chưa có chủ sở hữu.
 */
router.get(
  "/:vin/warranty",
  authentication,
  authorizationByRole(["service_center_staff"]),
  attachCompanyContext,
  validate(findVehicleByVinWithWarrantyParamsSchema, "params"),
  validate(findVehicleByVinWithWarrantyQuerySchema, "query"),

  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");

    await vehicleController.findVehicleByVinWithWarranty(req, res, next);
  }
);

/**
 * @swagger
 * /vehicles/{vin}/warranty/preview:
 *   post:
 *     summary: Xem trước thông tin bảo hành của xe
 *     description: >-
 *       Xem trước thông tin bảo hành của xe với ngày mua và số ODO tùy chỉnh.
 *       Hữu ích để tư vấn cho khách hàng trước khi chính thức đăng ký.
 *       Yêu cầu quyền `service_center_staff`.
 *     tags: [Vehicle, Warranty]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema: { type: string }
 *         description: Số nhận dạng xe (VIN).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [odometer, purchaseDate]
 *             properties:
 *               odometer:
 *                 type: number
 *                 minimum: 0
 *                 description: Số ODO giả định.
 *               purchaseDate:
 *                 type: string
 *                 format: date-time
 *                 description: Ngày mua giả định.
 *               categories:
 *                 type: array
 *                 items: { type: string }
 *                 description: (Tùy chọn) Danh sách các danh mục linh kiện cần xem trước.
 *     responses:
 *       200:
 *         description: Lấy thông tin xem trước thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       404:
 *         description: Không tìm thấy xe.
 */
router.post(
  "/:vin/warranty/preview",
  authentication,
  authorizationByRole(["service_center_staff"]),
  attachCompanyContext,
  validate(findVehicleByVinWithWarrantyPreviewParamsSchema, "params"),
  validate(findVehicleByVinWithWarrantyPreviewBodySchema, "body"),

  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");

    await vehicleController.findVehicleByVinWithWarrantyPreview(req, res, next);
  }
);

/**
 * @swagger
 * /vehicles/{vin}/components:
 *   get:
 *     summary: Lấy danh sách linh kiện đã lắp trên xe
 *     description: >-
 *       Lấy danh sách tất cả các linh kiện đang được lắp đặt hoặc đã từng được lắp đặt trên xe,
 *       kèm theo thông tin bảo hành của chúng.
 *       Yêu cầu các quyền liên quan đến trung tâm dịch vụ.
 *     tags: [Vehicle, Component]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema: { type: string }
 *         description: Số nhận dạng xe (VIN).
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [INSTALLED, REMOVED, DEFECTIVE, ALL], default: INSTALLED }
 *         description: Lọc linh kiện theo trạng thái.
 *     responses:
 *       200:
 *         description: Lấy danh sách linh kiện thành công.
 *       404:
 *         description: Không tìm thấy xe.
 */
router.get(
  "/:vin/components",
  authentication,
  authorizationByRole([
    "service_center_staff",
    "service_center_manager",
    "service_center_technician",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");
    await vehicleController.getVehicleComponents(req, res, next);
  }
);

/**
 * @swagger
 * /vehicles/{vin}/service-history:
 *   get:
 *     summary: Lấy lịch sử dịch vụ và bảo hành của xe
 *     description: >-
 *       Lấy toàn bộ lịch sử dịch vụ của xe, bao gồm tất cả các hồ sơ xử lý,
 *       các trường hợp bảo hành, và các sửa chữa đã thực hiện.
 *       Yêu cầu các quyền liên quan đến trung tâm dịch vụ.
 *     tags: [Vehicle, Service History]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vin
 *         required: true
 *         schema: { type: string }
 *         description: Số nhận dạng xe (VIN).
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [CHECKED_IN, IN_DIAGNOSIS, WAITING_FOR_PARTS, PAID, IN_REPAIR, COMPLETED, CANCELLED] }
 *         description: Lọc theo trạng thái của hồ sơ xử lý.
 *     responses:
 *       200:
 *         description: Lấy lịch sử dịch vụ thành công.
 *       404:
 *         description: Không tìm thấy xe.
 */
router.get(
  "/:vin/service-history",
  authentication,
  authorizationByRole([
    "service_center_staff",
    "service_center_manager",
    "service_center_technician",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const vehicleController = req.container.resolve("vehicleController");
    await vehicleController.getServiceHistory(req, res, next);
  }
);

export default router;
