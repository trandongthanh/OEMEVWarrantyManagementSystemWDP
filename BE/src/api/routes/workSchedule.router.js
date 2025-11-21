import express from "express";
import multer from "multer";
import { authentication, authorizationByRole } from "../middleware/index.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls)"));
    }
  },
});

/**
 * @swagger
 * /work-schedules/bulk-create-template:
 *   get:
 *     summary: Tải file Excel mẫu để tạo lịch làm việc
 *     description: >-
 *       Tải về một file Excel mẫu chứa các cột cần thiết (`employee_code`, `work_date`, `status`, `notes`)
 *       để sử dụng cho việc tạo lịch làm việc hàng loạt.
 *       Yêu cầu quyền `service_center_manager`.
 *     tags: [Work Schedule]
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
  authorizationByRole(["service_center_manager"]),
  async (req, res, next) => {
    const workScheduleController = req.container.resolve(
      "workScheduleController"
    );
    await workScheduleController.getBulkCreateTemplate(req, res, next);
  }
);

/**
 * @swagger
 * /work-schedules/bulk-create:
 *   post:
 *     summary: Tạo lịch làm việc hàng loạt từ file Excel
 *     description: >-
 *       Quản lý (`service_center_manager`) tải lên file Excel để tạo hoặc cập nhật lịch làm việc hàng loạt cho các kỹ thuật viên.
 *       Hệ thống sẽ xử lý file và trả về kết quả chi tiết.
 *     tags: [Work Schedule]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel chứa dữ liệu lịch làm việc.
 *     responses:
 *       200:
 *         description: Xử lý file thành công (có thể có lỗi trong từng dòng).
 *       400:
 *         description: File không hợp lệ hoặc lỗi validation.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền (yêu cầu vai trò Quản lý).
 */
router.post(
  "/bulk-create",
  authentication,
  authorizationByRole(["service_center_manager"]),
  upload.single("file"),
  async (req, res, next) => {
    const workScheduleController = req.container.resolve(
      "workScheduleController"
    );
    await workScheduleController.uploadSchedules(req, res, next);
  }
);

/**
 * @swagger
 * /work-schedules:
 *   get:
 *     summary: Lấy danh sách lịch làm việc
 *     description: >-
 *       Quản lý (`service_center_manager`) lấy danh sách lịch làm việc với các bộ lọc.
 *       Hệ thống sẽ tự động lọc theo trung tâm dịch vụ của quản lý.
 *     tags: [Work Schedule]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Lọc từ ngày (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Lọc đến ngày (YYYY-MM-DD).
 *       - in: query
 *         name: technicianId
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo ID của kỹ thuật viên.
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [AVAILABLE, UNAVAILABLE] }
 *         description: Lọc theo trạng thái.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Danh sách lịch làm việc.
 *       401:
 *         description: Chưa xác thực.
 */
router.get(
  "/",
  authentication,
  authorizationByRole(["service_center_manager"]),
  async (req, res, next) => {
    const workScheduleController = req.container.resolve(
      "workScheduleController"
    );
    await workScheduleController.getSchedules(req, res, next);
  }
);

/**
 * @swagger
 * /work-schedules/my-schedule:
 *   get:
 *     summary: Kỹ thuật viên xem lịch làm việc của bản thân
 *     description: >-
 *       Kỹ thuật viên (`service_center_technician`) xem lịch làm việc cá nhân của mình.
 *     tags: [Work Schedule]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Lọc từ ngày.
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Lọc đến ngày.
 *     responses:
 *       200:
 *         description: Lịch làm việc của kỹ thuật viên.
 *       401:
 *         description: Chưa xác thực.
 */
router.get(
  "/my-schedule",
  authentication,
  authorizationByRole(["service_center_technician"]),
  async (req, res, next) => {
    const workScheduleController = req.container.resolve(
      "workScheduleController"
    );
    await workScheduleController.getMySchedule(req, res, next);
  }
);

/**
 * @swagger
 * /work-schedules/available-technicians:
 *   get:
 *     summary: Lấy danh sách kỹ thuật viên sẵn sàng làm việc
 *     description: >-
 *       Quản lý (`service_center_manager`) lấy danh sách các kỹ thuật viên có trạng thái `AVAILABLE` trong một ngày cụ thể
 *       để phục vụ việc giao task.
 *     tags: [Work Schedule]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workDate
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Ngày cần kiểm tra (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Danh sách các kỹ thuật viên sẵn sàng.
 *       400:
 *         description: Thiếu tham số `workDate`.
 *       401:
 *         description: Chưa xác thực.
 */
router.get(
  "/available-technicians",
  authentication,
  authorizationByRole(["service_center_manager"]),
  async (req, res, next) => {
    const workScheduleController = req.container.resolve(
      "workScheduleController"
    );
    await workScheduleController.getAvailableTechnicians(req, res, next);
  }
);

/**
 * @swagger
 * /work-schedules/{scheduleId}:
 *   patch:
 *     summary: Cập nhật một lịch làm việc
 *     description: >-
 *       Quản lý (`service_center_manager`) cập nhật trạng thái hoặc ghi chú của một lịch làm việc cụ thể.
 *     tags: [Work Schedule]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       404:
 *         description: Không tìm thấy lịch làm việc.
 */
router.patch(
  "/:scheduleId",
  authentication,
  authorizationByRole(["service_center_manager"]),
  async (req, res, next) => {
    const workScheduleController = req.container.resolve(
      "workScheduleController"
    );
    await workScheduleController.updateSchedule(req, res, next);
  }
);

export default router;
