import express from "express";
import multer from "multer";
import {
  attachCompanyContext,
  authentication,
  authorizationByRole,
  validate,
} from "../middleware/index.js";
import { createInventoryAdjustmentBodySchema } from "../../validators/inventory.validator.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /inventory/summary:
 *   get:
 *     summary: Lấy tóm tắt tồn kho theo từng kho
 *     description: >-
 *       Lấy thông tin tổng hợp về số lượng tồn kho, đã đặt trước, và khả dụng cho mỗi kho.
 *       - `parts_coordinator_service_center`: Chỉ thấy kho của trung tâm dịch vụ mình.
 *       - `parts_coordinator_company`: Thấy tất cả kho của công ty và có thể lọc theo `serviceCenterId`.
 *     tags: [Inventory Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceCenterId
 *         schema: { type: string, format: uuid }
 *         description: (Chỉ dành cho `parts_coordinator_company`) Lọc theo ID của trung tâm dịch vụ.
 *     responses:
 *       200:
 *         description: Lấy thông tin tóm tắt thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/summary",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");

    await inventoryController.getInventorySummary(req, res, next);
  }
);

/**
 * @swagger
 * /inventory/type-components:
 *   get:
 *     summary: Lấy chi tiết tồn kho theo loại linh kiện
 *     description: >-
 *       Lấy danh sách chi tiết từng loại linh kiện trong các kho, bao gồm số lượng tồn, đã đặt, và khả dụng.
 *       Hỗ trợ phân trang và lọc.
 *     tags: [Inventory Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo ID của một kho cụ thể.
 *       - in: query
 *         name: serviceCenterId
 *         schema: { type: string, format: uuid }
 *         description: (Chỉ dành cho `parts_coordinator_company`) Lọc theo ID của trung tâm dịch vụ.
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [HIGH_VOLTAGE_BATTERY, POWERTRAIN, CHARGING_SYSTEM, THERMAL_MANAGEMENT, LOW_VOLTAGE_SYSTEM, BRAKING, SUSPENSION_STEERING, HVAC, BODY_CHASSIS, INFOTAINMENT_ADAS] }
 *         description: Lọc theo danh mục linh kiện.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lấy chi tiết tồn kho thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/type-components",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");

    await inventoryController.getInventoryTypeComponents(req, res, next);
  }
);

/**
 * @swagger
 * /inventory/most-used-type-components:
 *   get:
 *     summary: Thống kê các loại linh kiện được sử dụng nhiều nhất
 *     description: >-
 *       Lấy danh sách các loại linh kiện đã được lắp đặt nhiều nhất trong các ca sửa chữa đã hoàn thành.
 *       Hỗ trợ lọc theo khoảng thời gian.
 *     tags: [Inventory Management, Statistics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Giới hạn số lượng kết quả trả về.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Lọc từ ngày (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Lọc đến ngày (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/most-used-type-components",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "service_center_manager",
    "evm_staff",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");

    await inventoryController.findMostUsedTypeComponentsInWarehouse(
      req,
      res,
      next
    );
  }
);

/**
 * @swagger
 * /inventory/adjustments/import/template:
 *   get:
 *     summary: Tải file mẫu nhập kho hàng loạt
 *     description: Tải về file Excel mẫu với cấu trúc cột `SKU` và `SERIAL_NUMBER` để nhập kho hàng loạt.
 *     tags: [Inventory Management, Adjustment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tải file mẫu thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/adjustments/import/template",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");

    await inventoryController.getInventoryAdjustmentTemplate(req, res, next);
  }
);

/**
 * @swagger
 * /inventory/adjustments/import:
 *   post:
 *     summary: Nhập kho hàng loạt từ file Excel
 *     description: >-
 *       Cho phép người dùng có quyền (`parts_coordinator_*`) tải lên file Excel để tạo các phiếu điều chỉnh nhập kho (`IN`) hàng loạt.
 *     tags: [Inventory Management, Adjustment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, warehouseId, adjustmentType]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel (.xlsx) với các cột `sku` và `serialNumber`.
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của kho sẽ nhập linh kiện vào.
 *               adjustmentType:
 *                 type: string
 *                 enum: [IN]
 *                 description: Loại điều chỉnh (hiện chỉ hỗ trợ `IN`).
 *               reason:
 *                 type: string
 *                 description: Lý do điều chỉnh.
 *               note:
 *                 type: string
 *                 description: Ghi chú bổ sung.
 *     responses:
 *       201:
 *         description: Tạo các phiếu điều chỉnh thành công.
 *       400:
 *         description: Thiếu file hoặc dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy kho hoặc SKU.
 */
router.post(
  "/adjustments/import",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  upload.single("file"),
  attachCompanyContext,

  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");

    await inventoryController.createInventoryAdjustmentFromFile(req, res, next);
  }
);

/**
 * @swagger
 * /inventory/adjustments:
 *   post:
 *     summary: Tạo phiếu điều chỉnh kho thủ công
 *     description: >-
 *       Tạo một phiếu điều chỉnh kho. Hỗ trợ 2 kịch bản:
 *       1.  **Nhập kho (`IN`):** Cung cấp danh sách linh kiện mới (với `serialNumber`) để thêm vào kho.
 *       2.  **Xuất kho (`OUT`):** Cung cấp danh sách linh kiện (với `serialNumber`) cần loại bỏ khỏi kho (do hỏng, mất,...).
 *     tags: [Inventory Management, Adjustment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/InventoryAdjustmentIn'
 *               - $ref: '#/components/schemas/InventoryAdjustmentOut'
 *     responses:
 *       201:
 *         description: Tạo phiếu điều chỉnh thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy `stockId`.
 *       409:
 *         description: Xung đột (ví dụ: không đủ hàng để xuất).
 */
router.post(
  "/adjustments",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  validate(createInventoryAdjustmentBodySchema, "body"),
  attachCompanyContext,

  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");

    await inventoryController.createInventoryAdjustment(req, res, next);
  }
);

/**
 * @swagger
 * /inventory/adjustments:
 *   get:
 *     summary: Lấy lịch sử các phiếu điều chỉnh kho
 *     description: >-
 *       Lấy danh sách lịch sử các phiếu điều chỉnh kho (nhập/xuất thủ công) để kiểm toán và truy vết.
 *       Hỗ trợ lọc và phân trang.
 *     tags: [Inventory Management, Adjustment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo ID của kho.
 *       - in: query
 *         name: typeComponentId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo ID của loại linh kiện.
 *       - in: query
 *         name: adjustmentType
 *         schema: { type: string, enum: [IN, OUT] }
 *         description: Lọc theo loại điều chỉnh.
 *       - in: query
 *         name: reason
 *         schema: { type: string }
 *         description: Lọc theo lý do.
 *       - in: query
 *         name: adjustedByUserId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo người thực hiện.
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/adjustments",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");
    await inventoryController.getInventoryAdjustments(req, res, next);
  }
);

/**
 * @swagger
 * /inventory/adjustments/{adjustmentId}:
 *   get:
 *     summary: Lấy chi tiết một phiếu điều chỉnh kho
 *     description: Lấy thông tin chi tiết một phiếu điều chỉnh kho bằng ID của nó.
 *     tags: [Inventory Management, Adjustment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adjustmentId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: ID của phiếu điều chỉnh.
 *     responses:
 *       200:
 *         description: Lấy chi tiết thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy phiếu điều chỉnh.
 */
router.get(
  "/adjustments/:adjustmentId",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");
    await inventoryController.getInventoryAdjustmentById(req, res, next);
  }
);

/**
 * @swagger
 * /inventory/stocks/{stockId}/history:
 *   get:
 *     summary: Lấy lịch sử giao dịch của một mục trong kho
 *     description: >-
 *       Lấy một sổ cái (ledger) đầy đủ, được sắp xếp theo thời gian, của tất cả các giao dịch cho một `stockId` cụ thể.
 *       Bao gồm điều chỉnh thủ công, đặt trước, sử dụng, và luân chuyển kho.
 *     tags: [Inventory Management, Stock]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stockId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: ID của mục tồn kho (stock item).
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy mục tồn kho.
 */
router.get(
  "/stocks/:stockId/history",
  authentication,
  authorizationByRole([
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const inventoryController = req.container.resolve("inventoryController");
    await inventoryController.getStockHistory(req, res, next);
  }
);

export default router;
