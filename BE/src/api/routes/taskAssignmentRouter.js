import express from "express";
import { authentication, authorizationByRole } from "../middleware/index.js";

const router = express.Router();

/**
 * @swagger
 * /task-assignments:
 *   get:
 *     summary: Danh sách task được giao cho technicians trong service center
 *     description: Manager theo dõi danh sách công việc của technicians trong cùng service center hiện tại.
 *     tags: [Task Assignment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách task thành công
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
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.get(
  "/",
  authentication,
  authorizationByRole(["service_center_manager"]),
  async (req, res, next) => {
    const controller = req.container.resolve("taskAssignmentController");

    await controller.getTaskAssignments(req, res, next);
  }
);

export default router;
