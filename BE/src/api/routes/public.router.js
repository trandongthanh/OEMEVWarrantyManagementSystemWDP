import express from "express";

const router = express.Router();

/**
 * @swagger
 * /api/public/tracking:
 *   get:
 *     summary: Lấy thông tin xử lý dịch vụ xe bằng mã theo dõi
 *     description: >-
 *       Cho phép người dùng không cần xác thực (khách hàng) truy xuất thông tin
 *       chi tiết và trạng thái của một hồ sơ xử lý dịch vụ xe bằng cách sử dụng mã theo dõi (token)
 *       đã được cung cấp qua email.
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã token theo dõi duy nhất được gửi cho chủ xe.
 *     responses:
 *       200:
 *         description: Lấy thông tin theo dõi thành công. Trả về chi tiết hồ sơ xử lý.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/VehicleProcessingRecord'
 *       400:
 *         description: Yêu cầu không hợp lệ, thường là do thiếu mã token.
 *       404:
 *         description: Không tìm thấy hồ sơ xử lý nào với mã token đã cung cấp.
 */
router.get("/tracking", async (req, res, next) => {
  const publicController = req.container.resolve("publicController");

  await publicController.getTrackingInfo(req, res, next);
});

export default router;
