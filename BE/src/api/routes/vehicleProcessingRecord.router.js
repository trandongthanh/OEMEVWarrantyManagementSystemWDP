import { createRecordSchema } from "../../validators/vehicleProcessingRecord.validator.js";
import {
  updateMainTechnicianBodySchema,
  updateMainTechnicianParamsSchema,
  getAllRecordsSchema,
} from "../../validators/vehicleProcessingRecord.validator.js";
import {
  attachCompanyContext,
  authentication,
  authorizationByRole,
  ensureOtpVerified,
  validate,
} from "../middleware/index.js";

import express from "express";
const router = express.Router();

/**
 * @swagger
 * /processing-records:
 *   post:
 *     summary: Tạo hồ sơ tiếp nhận xe mới
 *     description: >-
 *       Nhân viên (`service_center_staff`) tạo một hồ sơ tiếp nhận xe mới khi khách hàng mang xe đến.
 *       - Yêu cầu phải xác thực OTP của khách hàng hoặc người đại diện trước khi gọi endpoint này.
 *       - Sau khi tạo thành công, hệ thống sẽ phát socket `new_record_notification` đến các quản lý.
 *     tags: [Vehicle Processing Record]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleProcessingRecordCreation'
 *     responses:
 *       201:
 *         description: Tạo hồ sơ thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền hoặc OTP chưa được xác thực.
 *       404:
 *         description: Không tìm thấy xe hoặc xe chưa có chủ sở hữu.
 *       409:
 *         description: Xung đột (xe đang có một hồ sơ khác đang hoạt động).
 */
router.post(
  "/",
  authentication,
  authorizationByRole(["service_center_staff"]),
  attachCompanyContext,
  validate(createRecordSchema, "body"),
  ensureOtpVerified,

  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.createRecord(req, res, next);
  }
);

/**
 * @swagger
 * /processing-records/{id}/complete-diagnosis:
 *   patch:
 *     summary: Hoàn tất quá trình chẩn đoán
 *     description: >-
 *       Kỹ thuật viên (`service_center_technician`) sau khi tạo các mục sửa chữa (case line) sẽ gọi endpoint này
 *       để chuyển trạng thái hồ sơ sang `WAITING_CUSTOMER_APPROVAL`.
 *       - Các Guarantee Case liên quan sẽ chuyển sang `DIAGNOSED`.
 *       - Các Case Line ở trạng thái `DRAFT` sẽ chuyển sang `PENDING_APPROVAL`.
 *       - Hệ thống sẽ phát socket event để thông báo cho nhân viên.
 *     tags: [Vehicle Processing Record]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của hồ sơ tiếp nhận xe.
 *     responses:
 *       200:
 *         description: Hoàn tất chẩn đoán thành công.
 *       400:
 *         description: Trạng thái của các mục con không hợp lệ.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy hồ sơ.
 */
router.patch(
  "/:id/complete-diagnosis",
  authentication,
  authorizationByRole(["service_center_technician"]),
  attachCompanyContext,
  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.completeDiagnosis(req, res, next);
  }
);

/**
 * @swagger
 * /processing-records/{id}/completed:
 *   patch:
 *     summary: Hoàn tất và đóng hồ sơ tiếp nhận xe
 *     description: >-
 *       Nhân viên hoặc Quản lý (`service_center_staff`, `service_center_manager`) đánh dấu một hồ sơ đã hoàn tất.
 *       - Yêu cầu tất cả các mục sửa chữa (case line) phải ở trạng thái `COMPLETED`.
 *       - Gán `checkOutDate` là thời điểm hiện tại.
 *     tags: [Vehicle Processing Record]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của hồ sơ tiếp nhận xe.
 *     responses:
 *       200:
 *         description: Đóng hồ sơ thành công.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy hồ sơ.
 *       409:
 *         description: Xung đột (vẫn còn mục sửa chữa chưa hoàn tất).
 */
router.patch(
  "/:id/completed",
  authentication,
  authorizationByRole(["service_center_manager", "service_center_staff"]),
  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.completeRecord(req, res, next);
  }
);

/**
 * @swagger
 * /processing-records/{id}/cancel:
 *   patch:
 *     summary: Hủy hồ sơ tiếp nhận xe
 *     description: >-
 *       Nhân viên hoặc Quản lý (`service_center_staff`, `service_center_manager`) hủy một hồ sơ.
 *       - Chỉ có thể hủy khi hồ sơ chưa bước vào giai đoạn sửa chữa.
 *       - Hệ thống sẽ cập nhật trạng thái hồ sơ sang `CANCELLED` và xử lý các mục liên quan (hủy đặt kho,...).
 *     tags: [Vehicle Processing Record]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của hồ sơ cần hủy.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Lý do hủy hồ sơ.
 *     responses:
 *       200:
 *         description: Hủy hồ sơ thành công.
 *       400:
 *         description: Trạng thái hồ sơ không cho phép hủy.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy hồ sơ.
 */
router.patch(
  "/:id/cancel",
  authentication,
  authorizationByRole(["service_center_manager", "service_center_staff"]),
  attachCompanyContext,
  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.cancelRecord(req, res, next);
  }
);

/**
 * @swagger
 * /processing-records/{id}/assignment:
 *   patch:
 *     summary: Giao kỹ thuật viên chính cho hồ sơ
 *     description: >-
 *       Quản lý (`service_center_manager`) gán một kỹ thuật viên chính (main technician) chịu trách nhiệm cho toàn bộ hồ sơ.
 *       - Hệ thống sẽ phát các socket event để thông báo cho kỹ thuật viên cũ (nếu có) và kỹ thuật viên mới.
 *     tags: [Vehicle Processing Record, Task Assignment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của hồ sơ tiếp nhận xe.
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
 *       403:
 *         description: Không có quyền hoặc phân công không hợp lệ.
 *       404:
 *         description: Không tìm thấy hồ sơ hoặc kỹ thuật viên.
 */
router.patch(
  "/:id/assignment",
  authentication,
  authorizationByRole(["service_center_manager"]),
  attachCompanyContext,
  validate(updateMainTechnicianParamsSchema, "params"),
  validate(updateMainTechnicianBodySchema, "body"),

  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.updateMainTechnician(
      req,
      res,
      next
    );
  }
);

/**
 * @swagger
 * /processing-records/{id}:
 *   get:
 *     summary: Lấy chi tiết hồ sơ tiếp nhận xe theo ID
 *     description: >-
 *       Lấy thông tin chi tiết của một hồ sơ, bao gồm thông tin xe, kỹ thuật viên, và các trường hợp bảo hành.
 *       Các vai trò trong trung tâm dịch vụ đều có thể truy cập.
 *     tags: [Vehicle Processing Record]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của hồ sơ tiếp nhận xe.
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công.
 *       403:
 *         description: Không có quyền xem hồ sơ này.
 *       404:
 *         description: Không tìm thấy hồ sơ.
 */
router.get(
  "/:id",
  authentication,
  authorizationByRole([
    "service_center_staff",
    "service_center_technician",
    "service_center_manager",
  ]),
  attachCompanyContext,

  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.getById(req, res, next);
  }
);

/**
 * @swagger
 * /processing-records/{id}/compatible-components:
 *   get:
 *     summary: Tìm kiếm linh kiện tương thích trong kho
 *     description: >-
 *       Tìm kiếm các loại linh kiện tương thích với mẫu xe của hồ sơ và đang có sẵn trong kho.
 *       Hỗ trợ tìm kiếm theo tên và lọc theo danh mục.
 *     tags: [Vehicle Processing Record, Component]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của hồ sơ tiếp nhận xe.
 *       - in: query
 *         name: category
 *         required: true
 *         schema: { type: string }
 *         description: Danh mục linh kiện cần tìm.
 *       - in: query
 *         name: searchName
 *         schema: { type: string }
 *         description: (Tùy chọn) Từ khóa tìm kiếm theo tên linh kiện.
 *     responses:
 *       200:
 *         description: Tìm kiếm thành công.
 *       400:
 *         description: Thiếu tham số bắt buộc.
 *       404:
 *         description: Không tìm thấy hồ sơ.
 */
router.get(
  "/:id/compatible-components",
  authentication,
  authorizationByRole([
    "service_center_technician",
    "service_center_manager",
    "service_center_staff",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.searchCompatibleComponentsInStock(
      req,
      res,
      next
    );
  }
);

/**
 * @swagger
 * /processing-records:
 *   get:
 *     summary: Lấy danh sách hồ sơ tiếp nhận xe
 *     description: >-
 *       Lấy danh sách các hồ sơ tiếp nhận xe có phân trang và bộ lọc.
 *       - **Nhân viên (`staff`)**: Chỉ thấy hồ sơ do mình tạo.
 *       - **Kỹ thuật viên (`technician`)**: Chỉ thấy hồ sơ được giao cho mình.
 *       - **Quản lý (`manager`)**: Thấy tất cả hồ sơ trong trung tâm dịch vụ của mình.
 *     tags: [Vehicle Processing Record]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [CHECKED_IN, IN_DIAGNOSIS, WAITING_CUSTOMER_APPROVAL, PROCESSING, READY_FOR_PICKUP, COMPLETED, CANCELLED] }
 *         description: Lọc theo trạng thái hồ sơ.
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Lọc hồ sơ có ngày check-in từ ngày này trở đi (ISO 8601 format).
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Lọc hồ sơ có ngày check-in đến ngày này trở về trước (ISO 8601 format).
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công.
 *       400:
 *         description: Tham số không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/",
  authentication,
  authorizationByRole([
    "service_center_staff",
    "service_center_manager",
    "service_center_technician",
  ]),
  validate(getAllRecordsSchema, "query"),
  async (req, res, next) => {
    const vehicleProcessingRecordController = req.container.resolve(
      "vehicleProcessingRecordController"
    );

    await vehicleProcessingRecordController.getAllRecords(req, res, next);
  }
);

export default router;
