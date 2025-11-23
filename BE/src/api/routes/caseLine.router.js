import express from "express";
import {
  createCaseLinesSchema,
  assignTechnicianParamsSchema,
  assignTechnicianBodySchema,
  allocateStockParamsSchema,
  approveCaselineBodySchema,
  updateCaselineBodySchema,
  updateCaselineParamsSchema,
  caseLineSchema,
  getCaseLineByIdParamsSchema,
  getAllCaselinesQuerySchema,
  validateOldComponentSerialSchema,
  markRepairCompletedBodySchema,
  requestRevisionParamsSchema,
  requestRevisionBodySchema,
} from "../../validators/caseLine.validator.js";

import {
  attachCompanyContext,
  authentication,
  authorizationByRole,
  validate,
} from "../middleware/index.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /case-lines:
 *   get:
 *     summary: Lấy danh sách các mục sửa chữa (Case Line)
 *     description: >-
 *       Lấy danh sách các mục sửa chữa (case line) có phân trang và bộ lọc.
 *       - Người dùng thuộc trung tâm dịch vụ chỉ có thể xem các case line thuộc trung tâm của mình.
 *       - Nhân viên EMV có thể xem tất cả.
 *     tags: [Case Line]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Số trang.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         description: Số mục trên mỗi trang.
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CUSTOMER_APPROVED, REJECTED, READY_FOR_REPAIR, IN_PROGRESS, REPAIR_COMPLETED, QUALITY_CHECKED] }
 *         description: Lọc theo trạng thái của mục sửa chữa.
 *       - in: query
 *         name: guaranteeCaseId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo ID của trường hợp bảo hành.
 *       - in: query
 *         name: warrantyStatus
 *         schema: { type: string, enum: [ELIGIBLE, INELIGIBLE] }
 *         description: Lọc theo trạng thái đủ điều kiện bảo hành.
 *       - in: query
 *         name: diagnosticTechId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo ID của kỹ thuật viên chẩn đoán.
 *       - in: query
 *         name: repairTechId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo ID của kỹ thuật viên sửa chữa.
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, status, warrantyStatus], default: createdAt }
 *         description: Sắp xếp theo trường.
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *         description: Thứ tự sắp xếp.
 *     responses:
 *       200:
 *         description: Lấy danh sách case line thành công.
 *       400:
 *         description: Lỗi do tham số truy vấn không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 */
router.get(
  "/",
  authentication,
  authorizationByRole([
    "service_center_technician",
    "service_center_staff",
    "service_center_manager",
    "emv_staff",
  ]),
  validate(getAllCaselinesQuerySchema, "query"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.getCaseLines(req, res, next);
  }
);

/**
 * @swagger
 * /guarantee-cases/{caseId}/case-lines:
 *   post:
 *     summary: Tạo các mục sửa chữa cho một trường hợp bảo hành
 *     description: >-
 *       Thêm một hoặc nhiều mục sửa chữa (chẩn đoán và hành động khắc phục) vào một trường hợp bảo hành.
 *       Chỉ kỹ thuật viên chính được giao cho trường hợp bảo hành này mới có quyền tạo.
 *     tags: [Case Line]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của trường hợp bảo hành.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [caselines]
 *             properties:
 *               caselines:
 *                 type: array
 *                 description: Mảng các mục sửa chữa cần tạo.
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/CaseLineCreationItem'
 *     responses:
 *       201:
 *         description: Tạo các mục sửa chữa thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Kỹ thuật viên).
 *       404:
 *         description: Không tìm thấy trường hợp bảo hành.
 *       409:
 *         description: Xung đột (ví dụ: Kỹ thuật viên không phải là người phụ trách chính).
 */
router.post(
  "/",
  authentication,
  authorizationByRole(["service_center_technician"]),
  attachCompanyContext,
  validate(createCaseLinesSchema, "body"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.createCaseLines(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/approve:
 *   patch:
 *     summary: Phê duyệt hoặc từ chối các mục sửa chữa
 *     description: >-
 *       Nhân viên trung tâm dịch vụ (`service_center_staff`) xử lý các mục sửa chữa đang chờ khách hàng xác nhận.
 *       Yêu cầu tất cả các mục thuộc cùng một `vehicleProcessingRecordId` phải được gửi lên cùng lúc.
 *       Sau khi xử lý, nếu hồ sơ tổng chuyển trạng thái, hệ thống sẽ phát socket event.
 *     tags: [Case Line]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [approvedCaseLineIds, rejectedCaseLineIds, approverEmail]
 *             properties:
 *               approvedCaseLineIds:
 *                 type: array
 *                 items: { type: object, properties: { id: { type: string, format: uuid } } }
 *                 description: Mảng ID của các mục được phê duyệt.
 *               rejectedCaseLineIds:
 *                 type: array
 *                 items: { type: object, properties: { id: { type: string, format: uuid } } }
 *                 description: Mảng ID của các mục bị từ chối.
 *               approverEmail:
 *                 type: string
 *                 format: email
 *                 description: Email của người duyệt (khách hàng) đã được xác thực.
 *     responses:
 *       200:
 *         description: Xử lý các mục sửa chữa thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Nhân viên trung tâm dịch vụ).
 *       404:
 *         description: Không tìm thấy một hoặc nhiều mục sửa chữa.
 */
router.patch(
  "/approve",
  authentication,
  authorizationByRole(["service_center_staff"]),
  validate(approveCaselineBodySchema, "body"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.approveCaseline(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/case-line:
 *   post:
 *     summary: (Legacy) Tạo một mục sửa chữa đơn lẻ
 *     description: >-
 *       **LƯU Ý: Nên sử dụng endpoint `POST /guarantee-cases/{caseId}/case-lines` để tạo hàng loạt.**
 *       Tạo một mục sửa chữa (chẩn đoán và hành động khắc phục) cho một trường hợp bảo hành.
 *       Chỉ kỹ thuật viên mới có quyền tạo.
 *     tags: [Case Line]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseLineCreationItem'
 *     responses:
 *       201:
 *         description: Tạo mục sửa chữa thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Kỹ thuật viên).
 */
router.post(
  "/case-line",
  authentication,
  authorizationByRole(["service_center_technician"]),
  attachCompanyContext,
  validate(caseLineSchema, "body"),

  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.createCaseLine(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/{caselineId}:
 *   get:
 *     summary: Lấy chi tiết một mục sửa chữa theo ID
 *     description: >-
 *       Lấy thông tin chi tiết của một mục sửa chữa cụ thể.
 *       Có thể truy cập bởi Kỹ thuật viên, Nhân viên và Quản lý trung tâm dịch vụ.
 *     tags: [Case Line]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caselineId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của mục sửa chữa.
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy mục sửa chữa.
 */
router.get(
  "/:caselineId",
  authentication,
  authorizationByRole([
    "service_center_technician",
    "service_center_staff",
    "service_center_manager",
    "emv_staff",
  ]),
  attachCompanyContext,
  validate(getCaseLineByIdParamsSchema, "params"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.getCaseLineById(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/{caselineId}:
 *   patch:
 *     summary: Cập nhật thông tin một mục sửa chữa
 *     description: >-
 *       Cập nhật thông tin của một mục sửa chữa, bao gồm chẩn đoán, hành động khắc phục, linh kiện, và trạng thái bảo hành.
 *       Chỉ kỹ thuật viên mới có quyền cập nhật.
 *     tags: [Case Line]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caselineId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của mục sửa chữa.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseLineUpdatePayload'
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Kỹ thuật viên).
 *       404:
 *         description: Không tìm thấy mục sửa chữa.
 */
router.patch(
  "/:caselineId",
  authentication,
  authorizationByRole(["service_center_technician"]),
  attachCompanyContext,
  validate(updateCaselineParamsSchema, "params"),
  validate(updateCaselineBodySchema, "body"),

  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.updateCaseLine(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/{caselineId}/allocate-stock:
 *   post:
 *     summary: Phân bổ kho cho một mục sửa chữa
 *     description: >-
 *       Tự động tìm và đặt trước (reserve) linh kiện từ các kho có sẵn cho một mục sửa chữa theo chiến lược FIFO.
 *       Chỉ Quản lý trung tâm dịch vụ (`service_center_manager`) mới có quyền thực hiện.
 *     tags: [Case Line, Stock Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caselineId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của mục sửa chữa cần phân bổ kho.
 *     responses:
 *       200:
 *         description: Phân bổ kho thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Quản lý).
 *       404:
 *         description: Không tìm thấy mục sửa chữa hoặc không có kho hàng phù hợp.
 *       409:
 *         description: Xung đột (trạng thái không hợp lệ hoặc đã được phân bổ).
 */
router.post(
  "/:caselineId/allocate-stock",
  authentication,
  authorizationByRole(["service_center_manager"]),
  validate(allocateStockParamsSchema, "params"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.allocateStockForCaseline(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/{caselineId}/assign-technician:
 *   patch:
 *     summary: Giao việc sửa chữa cho Kỹ thuật viên
 *     description: >-
 *       Quản lý trung tâm dịch vụ (`service_center_manager`) chỉ định một kỹ thuật viên để thực hiện sửa chữa cho một mục đang ở trạng thái `READY_FOR_REPAIR`.
 *       Hệ thống sẽ tạo một Task Assignment và phát socket event.
 *     tags: [Case Line, Task Assignment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caselineId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của mục sửa chữa cần giao việc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [technicianId]
 *             properties:
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của kỹ thuật viên được giao.
 *     responses:
 *       200:
 *         description: Giao việc thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Quản lý).
 *       404:
 *         description: Không tìm thấy mục sửa chữa hoặc kỹ thuật viên.
 *       409:
 *         description: Xung đột (trạng thái không hợp lệ).
 */
router.patch(
  "/:caselineId/assign-technician",
  authentication,
  authorizationByRole(["service_center_manager"]),
  validate(assignTechnicianParamsSchema, "params"),
  validate(assignTechnicianBodySchema, "body"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.assignTechnicianToRepairCaseline(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/{caselineId}/mark-repair-complete:
 *   patch:
 *     summary: Đánh dấu hoàn tất sửa chữa
 *     description: >-
 *       Kỹ thuật viên được giao (`service_center_technician`) xác nhận đã sửa chữa xong một mục.
 *       Hệ thống sẽ chuyển trạng thái mục sang `COMPLETED` và đóng Task Assignment tương ứng.
 *     tags: [Case Line, Task Assignment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caselineId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của mục sửa chữa đã hoàn tất.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               installationImageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Mảng các URL hình ảnh sau khi lắp đặt.
 *     responses:
 *       200:
 *         description: Đánh dấu hoàn tất thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (chỉ kỹ thuật viên được giao mới có quyền).
 *       404:
 *         description: Không tìm thấy mục sửa chữa.
 *       409:
 *         description: Xung đột (trạng thái không phải là `IN_REPAIR`).
 */
router.patch(
  "/:caselineId/mark-repair-complete",
  authentication,
  authorizationByRole(["service_center_technician"]),
  validate(markRepairCompletedBodySchema, "body"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.markRepairCompleted(req, res, next);
  }
);

/**
 * @swagger
 * /guarantee-cases/{guaranteeCaseId}/validate-old-component-serial:
 *   patch:
 *     summary: Xác thực số serial của linh kiện cũ
 *     description: >-
 *       Kỹ thuật viên (`service_center_technician`) xác thực số serial của linh kiện cũ đang được thay thế.
 *       Đây là bước bắt buộc trong quá trình chẩn đoán trước khi có thể lắp linh kiện mới.
 *     tags: [Case Line, Component]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: guaranteeCaseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của trường hợp bảo hành.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [caseLineId, oldComponentSerialNumber]
 *             properties:
 *               caseLineId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của mục sửa chữa liên quan đến việc thay thế.
 *               oldComponentSerialNumber:
 *                 type: string
 *                 description: Số serial của linh kiện cũ được tháo ra.
 *     responses:
 *       200:
 *         description: Xác thực thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc số serial không khớp.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy Trường hợp bảo hành, Mục sửa chữa, hoặc Linh kiện.
 *       409:
 *         description: Xung đột (trạng thái không hợp lệ).
 */
router.patch(
  "/:caselineId/validate-old-component-serial",
  authentication,
  authorizationByRole(["service_center_technician"]),
  validate(validateOldComponentSerialSchema, "body"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.validateOldComponentSerial(req, res, next);
  }
);

/**
 * @swagger
 * /case-lines/{caselineId}/request-revision:
 *   patch:
 *     summary: Yêu cầu chỉnh sửa lại Caseline (Manager -> Tech)
 *     description: >-
 *       Quản lý trung tâm dịch vụ yêu cầu Kỹ thuật viên chỉnh sửa lại một Caseline đã bị Hãng từ chối (`REJECTED_BY_OEM`).
 *       Hệ thống sẽ gửi thông báo đến Kỹ thuật viên phụ trách.
 *     tags: [Case Line]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caselineId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của mục sửa chữa.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Lý do yêu cầu chỉnh sửa.
 *     responses:
 *       200:
 *         description: Gửi yêu cầu thành công.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Quản lý).
 *       404:
 *         description: Không tìm thấy mục sửa chữa.
 *       409:
 *         description: Xung đột (trạng thái không phải là `REJECTED_BY_OEM`).
 */
router.patch(
  "/:caselineId/request-revision",
  authentication,
  authorizationByRole(["service_center_manager"]),
  validate(requestRevisionParamsSchema, "params"),
  validate(requestRevisionBodySchema, "body"),
  async (req, res, next) => {
    const caseLineController = req.container.resolve("caseLineController");

    await caseLineController.requestRevision(req, res, next);
  }
);

export default router;
