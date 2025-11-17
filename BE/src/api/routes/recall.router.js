import express from "express";
import {
  authentication,
  authorizationByRole,
  attachCompanyContext,
} from "../middleware/index.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recall Campaigns
 *   description: Quản lý các chiến dịch triệu hồi xe
 */

/**
 * @swagger
 * /recall-campaigns:
 *   post:
 *     summary: Tạo chiến dịch triệu hồi mới
 *     description: Cho phép nhân viên hãng (EMV Staff) tạo một chiến dịch triệu hồi mới.
 *     tags: [Recall Campaigns]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - issueDate
 *               - affectedVehicleModelIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Triệu hồi lỗi phanh ABS"
 *                 description: Tên của chiến dịch triệu hồi.
 *               description:
 *                 type: string
 *                 example: "Lỗi hệ thống phanh ABS có thể gây mất an toàn."
 *                 description: Mô tả chi tiết về lỗi và biện pháp khắc phục.
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *                 description: Ngày phát hành chiến dịch.
 *               affectedVehicleModelIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
 *                 description: Danh sách các ID model xe bị ảnh hưởng bởi chiến dịch.
 *     responses:
 *       201:
 *         description: Chiến dịch triệu hồi được tạo thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recallCampaign:
 *                       $ref: '#/components/schemas/RecallCampaign'
 *       400:
 *         description: Dữ liệu yêu cầu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.post(
  "/",
  authentication,
  authorizationByRole(["emv_staff"]),
  attachCompanyContext,
  async (req, res, next) => {
    const recallController = req.container.resolve("recallController");
    await recallController.createRecallCampaign(req, res, next);
  }
);

/**
 * @swagger
 * /recall-campaigns/{id}:
 *   get:
 *     summary: Lấy chi tiết chiến dịch triệu hồi theo ID
 *     description: Lấy thông tin chi tiết của một chiến dịch triệu hồi cụ thể.
 *     tags: [Recall Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của chiến dịch triệu hồi.
 *     responses:
 *       200:
 *         description: Trả về chi tiết chiến dịch triệu hồi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recallCampaign:
 *                       $ref: '#/components/schemas/RecallCampaign'
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy chiến dịch triệu hồi.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.get(
  "/:id",
  authentication,
  authorizationByRole([
    "emv_staff",
    "service_center_manager",
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  async (req, res, next) => {
    const recallController = req.container.resolve("recallController");
    await recallController.getRecallCampaignById(req, res, next);
  }
);

/**
 * @swagger
 * /recall-campaigns:
 *   get:
 *     summary: Lấy danh sách các chiến dịch triệu hồi
 *     description: Lấy danh sách tất cả các chiến dịch triệu hồi, có thể lọc theo trạng thái và ID công ty.
 *     tags: [Recall Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mục trên mỗi trang.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, CANCELLED]
 *         description: Lọc theo trạng thái chiến dịch.
 *     responses:
 *       200:
 *         description: Trả về danh sách các chiến dịch triệu hồi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recallCampaigns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RecallCampaign'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.get(
  "/",
  authentication,
  authorizationByRole([
    "emv_staff",
    "service_center_manager",
    "parts_coordinator_company",
    "parts_coordinator_service_center",
  ]),
  attachCompanyContext,
  async (req, res, next) => {
    const recallController = req.container.resolve("recallController");
    await recallController.getAllRecallCampaigns(req, res, next);
  }
);

/**
 * @swagger
 * /service-centers/{serviceCenterId}/notify-recall-owners:
 *   post:
 *     summary: Gửi thông báo triệu hồi đến chủ sở hữu xe
 *     description: Cho phép trung tâm dịch vụ gửi thông báo triệu hồi qua email đến chủ sở hữu các xe bị ảnh hưởng.
 *     tags: [Recall Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceCenterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của trung tâm dịch vụ.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recallCampaignId
 *               - vehicleVins
 *             properties:
 *               recallCampaignId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440002"
 *                 description: ID của chiến dịch triệu hồi.
 *               vehicleVins:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["VIN12345678901234567", "VIN76543210987654321"]
 *                 description: Danh sách VIN của các xe cần thông báo.
 *     responses:
 *       200:
 *         description: Thông báo đã được gửi thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifiedCount:
 *                       type: integer
 *                       example: 2
 *                       description: Số lượng chủ sở hữu xe đã được thông báo.
 *       400:
 *         description: Dữ liệu yêu cầu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy chiến dịch triệu hồi hoặc trung tâm dịch vụ.
 *       409:
 *         description: "Xung đột (ví dụ: chiến dịch không hoạt động, không có chủ sở hữu hợp lệ để thông báo)."
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.post(
  "/service-centers/:serviceCenterId/notify-recall-owners",
  authentication,
  authorizationByRole(["service_center_manager"]),
  attachCompanyContext,
  async (req, res, next) => {
    const recallController = req.container.resolve("recallController");
    await recallController.notifyRecallOwners(req, res, next);
  }
);

/**
 * @swagger
 * /recall-campaigns/{id}/activate:
 *   patch:
 *     summary: Kích hoạt chiến dịch triệu hồi
 *     description: Cho phép nhân viên hãng (EMV Staff) kích hoạt một chiến dịch triệu hồi từ trạng thái DRAFT sang ACTIVE.
 *     tags: [Recall Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của chiến dịch triệu hồi cần kích hoạt.
 *     responses:
 *       200:
 *         description: Chiến dịch triệu hồi đã được kích hoạt thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recallCampaign:
 *                       $ref: '#/components/schemas/RecallCampaign'
 *       400:
 *         description: Dữ liệu yêu cầu không hợp lệ.
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy chiến dịch triệu hồi.
 *       409:
 *         description: "Xung đột (ví dụ: chiến dịch không ở trạng thái DRAFT)."
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.patch(
  "/:id/activate",
  authentication,
  authorizationByRole(["emv_staff"]),
  attachCompanyContext,
  async (req, res, next) => {
    const recallController = req.container.resolve("recallController");
    await recallController.activateRecallCampaign(req, res, next);
  }
);

export default router;
