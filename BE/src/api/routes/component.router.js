import express from "express";
import { authentication } from "../middleware/index.js";

const router = express.Router();

/**
 * @swagger
 * /components:
 *   get:
 *     summary: Danh sách component trong kho
 *     description: Liệt kê component với khả năng lọc theo kho, loại linh kiện, trạng thái, serial...
 *     tags: [Component]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chỉ lấy component thuộc kho này
 *       - in: query
 *         name: typeComponentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo loại linh kiện
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_WAREHOUSE, RESERVED, IN_TRANSIT, WITH_TECHNICIAN, INSTALLED, RETURNED]
 *         description: Lọc theo trạng thái component
 *       - in: query
 *         name: serialNumber
 *         schema:
 *           type: string
 *         description: Tìm theo serial cụ thể
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Số bản ghi mỗi trang (tối đa 200)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
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
 *                     components:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Thông tin component kèm typeComponent nếu có
 *       401:
 *         description: Chưa xác thực
 */
router.get("/", authentication, async (req, res, next) => {
  const componentController = req.container.resolve("componentController");

  await componentController.listComponents(req, res, next);
});

export default router;
