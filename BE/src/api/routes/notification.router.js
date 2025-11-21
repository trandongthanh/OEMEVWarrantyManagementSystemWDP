import express from "express";
import { authentication } from "../middleware/index.js";

const router = express.Router();

router.get("/", authentication, async (req, res, next) => {
  const notificationController = req.container.resolve(
    "notificationController"
  );
  await notificationController.getNotifications(req, res, next);
});
router.patch("/:id/read", authentication, async (req, res, next) => {
  const notificationController = req.container.resolve(
    "notificationController"
  );
  await notificationController.markAsRead(req, res, next);
});
router.post("/mark-all-as-read", authentication, async (req, res, next) => {
  const notificationController = req.container.resolve(
    "notificationController"
  );
  await notificationController.markAllAsRead(req, res, next);
});

export default router;
