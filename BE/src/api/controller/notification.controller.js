class NotificationController {
  constructor({ notificationService }) {
    this.notificationService = notificationService;
  }

  getNotifications = async (req, res, next) => {
    try {
      const { user } = req;

      const { page = 1, limit = 10 } = req.query;

      const parsedPage = Number.parseInt(page, 10);

      const parsedLimit = Number.parseInt(limit, 10);

      const safePage =
        Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

      const safeLimit =
        Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;

      const notifications =
        await this.notificationService.getNotificationsForUser({
          user,
          page: safePage,
          limit: safeLimit,
        });
      res.status(200).json({
        status: "success",
        ...notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const success = await this.notificationService.markNotificationAsRead({
        notificationId: id,
        user: req.user,
      });
      if (success) {
        res.status(200).json({
          status: "success",
          message: "Notification marked as read.",
        });
      } else {
        res.status(404).json({
          status: "fail",
          message: "Notification not found or already read.",
        });
      }
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req, res, next) => {
    try {
      const { user } = req;
      const affectedRows =
        await this.notificationService.markAllNotificationsAsReadForUser({
          user,
        });
      res.status(200).json({
        status: "success",
        message: `${affectedRows} notifications marked as read.`,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationController;
