import express from "express";
import {
  attachCompanyContext,
  authentication,
  authorizationByRole,
  validate,
} from "../middleware/index.js";
import loginSchema from "../../validators/login.validator.js";
const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     description: >-
 *       Endpoint công khai cho người dùng đăng nhập vào hệ thống bằng `username` và `password`.
 *       Thành công sẽ trả về một JWT token để sử dụng cho các yêu cầu cần xác thực.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên đăng nhập của người dùng.
 *                 example: "staff_user"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu của người dùng.
 *                 example: "StaffPass123!"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về JWT token.
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
 *                     token:
 *                       type: string
 *                       description: JWT access token.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM..."
 *       400:
 *         description: Dữ liệu không hợp lệ (thiếu username hoặc password).
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu.
 */
router.post("/login", validate(loginSchema), async (req, res, next) => {
  const authController = req.container.resolve("authController");
  await authController.login(req, res, next);
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: (Không dùng) Đăng ký tài khoản công khai
 *     description: >-
 *       **LƯU Ý: Endpoint này có thể không được sử dụng trong luồng nghiệp vụ chính.**
 *       Endpoint công khai cho phép người dùng tự đăng ký tài khoản.
 *       Cần cân nhắc về vấn đề bảo mật và vai trò mặc định khi sử dụng.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - phone
 *               - name
 *               - address
 *               - roleId
 *               - employeeCode
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newuser01"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "new.user@example.com"
 *               phone:
 *                 type: string
 *                 example: "+84912345678"
 *               name:
 *                 type: string
 *                 example: "Nguyen Van B"
 *               address:
 *                 type: string
 *                 example: "123 Duong ABC, Quan 1, TP.HCM"
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của vai trò sẽ được gán.
 *               serviceCenterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của trung tâm dịch vụ (nếu có).
 *               vehicleCompanyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của công ty sản xuất (nếu có).
 *     responses:
 *       201:
 *         description: Đăng ký thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       409:
 *         description: Xung đột dữ liệu (username, email hoặc phone đã tồn tại).
 */

/**
 * @swagger
 * /auth/registerAccount:
 *   post:
 *     summary: Tạo tài khoản người dùng nội bộ
 *     description: >-
 *       Endpoint cho phép người có thẩm quyền (Quản lý, Admin) tạo tài khoản người dùng mới trong hệ thống.
 *       - **Quản lý Trung tâm Dịch vụ (`service_center_manager`)**: Chỉ có thể tạo tài khoản cho nhân viên trong trung tâm dịch vụ của mình.
 *       - **Quản trị viên EMV (`emv_admin`)**: Có thể tạo tài khoản cho bất kỳ trung tâm dịch vụ nào (cung cấp `serviceCenterId`) hoặc tài khoản cho nhân viên công ty sản xuất (cung cấp `vehicleCompanyId`).
 *     tags: [Authentication, User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - phone
 *               - name
 *               - address
 *               - roleId
 *               - employeeCode
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên đăng nhập duy nhất cho tài khoản mới.
 *                 example: "new.staff.01"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu, cần tuân thủ quy tắc phức tạp của hệ thống.
 *                 example: "Password@2025"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "new.staff.01@example.com"
 *               phone:
 *                 type: string
 *                 example: "+84901234567"
 *               name:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               address:
 *                 type: string
 *                 example: "123 Nguyen Trai, Quan 1, TP.HCM"
 *               employeeCode:
 *                 type: string
 *                 description: Mã định danh nhân viên, phải là duy nhất trong công ty.
 *                 example: "NV012345"
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của vai trò sẽ được gán cho tài khoản.
 *               serviceCenterId:
 *                 type: string
 *                 format: uuid
 *                 description: Cung cấp khi `emv_admin` tạo tài khoản cho một trung tâm dịch vụ.
 *               vehicleCompanyId:
 *                 type: string
 *                 format: uuid
 *                 description: Cung cấp khi `emv_admin` tạo tài khoản cho một công ty sản xuất.
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công.
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc thiếu thông tin.
 *       401:
 *         description: Chưa xác thực (thiếu hoặc sai token).
 *       403:
 *         description: Không có quyền thực hiện hành động này.
 *       409:
 *         description: Xung đột dữ liệu (username, email, phone hoặc employeeCode đã tồn tại).
 */
router.post(
  "/registerAccount",
  authentication,
  authorizationByRole(["service_center_manager", "emv_admin"]),
  attachCompanyContext,

  async (req, res, next) => {
    const authController = req.container.resolve("authController");

    await authController.registerAccount(req, res, next);
  }
);

export default router;
