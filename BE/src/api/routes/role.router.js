import express from "express";
import { authentication, authorizationByRole } from "../middleware/index.js";

const router = express.Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Lấy danh sách vai trò
 *     description: >-
 *       Endpoint trả về danh sách vai trò.
 *       - Nếu bạn là `emv_admin`, bạn sẽ nhận được tất cả các vai trò.
 *       - Nếu bạn là `service_center_manager`, bạn sẽ chỉ nhận được các vai trò thuộc trung tâm bảo hành.
 *       Yêu cầu quyền `emv_admin` hoặc `service_center_manager`.
 *     tags: [Role Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các vai trò.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roleId:
 *                         type: string
 *                         format: uuid
 *                       roleName:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 */
router.get(
  "/",
  authentication,
  authorizationByRole(["emv_admin", "service_center_manager"]),
  async (req, res, next) => {
    const roleController = req.container.resolve("roleController");
    await roleController.getAllRoles(req, res, next);
  }
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Lấy thông tin vai trò theo ID
 *     description: >-
 *       Endpoint trả về thông tin chi tiết của một vai trò dựa trên ID.
 *       Yêu cầu quyền `service_center_manager`.
 *     tags: [Role Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của vai trò cần lấy thông tin.
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của vai trò.
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
 *                     roleId:
 *                       type: string
 *                       format: uuid
 *                     roleName:
 *                       type: string
 *                     description:
 *                       type: string
 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền.
 *       404:
 *         description: Không tìm thấy vai trò.
 */
router.get(
  "/:id",
  authentication,
  authorizationByRole(["service_center_manager"]),
  async (req, res, next) => {
    const roleController = req.container.resolve("roleController");
    await roleController.getRoleById(req, res, next);
  }
);

export default router;
