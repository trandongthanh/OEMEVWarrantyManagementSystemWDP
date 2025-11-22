import db from "../models/index.cjs";

const { Notification, Sequelize } = db;
const { Op } = Sequelize;

class NotificationRepository {
  create = async (
    { userId = null, roomName, eventName, data, isRead = false },
    transaction = null
  ) => {
    const newNotification = await Notification.create(
      {
        userId,
        roomName,
        eventName,
        data,
        isRead,
      },
      { transaction }
    );
    return newNotification.toJSON();
  };

  findAllByUserId = async ({ userId, limit, offset }) => {
    const { count, rows } = await Notification.findAndCountAll({
      where: {
        userId: userId,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    return { count, rows: rows.map((row) => row.toJSON()) };
  };

  findAllByRoomNames = async ({ roomNames = [], userId, limit, offset }) => {
    const scopes = [];

    if (userId) {
      scopes.push({ userId });
    }

    if (Array.isArray(roomNames) && roomNames.length > 0) {
      scopes.push({
        roomName: {
          [Op.in]: roomNames,
        },
      });
    }

    if (scopes.length === 0) {
      return { count: 0, rows: [] };
    }

    const { count, rows } = await Notification.findAndCountAll({
      where: {
        [Op.or]: scopes,
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return { count, rows: rows.map((row) => row.toJSON()) };
  };

  markAsRead = async ({ notificationId, userId, roomNames = [] }) => {
    const scopes = [];

    if (!notificationId) {
      return 0;
    }

    if (userId) {
      scopes.push({ userId });
    }

    if (Array.isArray(roomNames) && roomNames.length > 0) {
      scopes.push({
        roomName: {
          [Op.in]: roomNames,
        },
      });
    }

    if (scopes.length === 0) {
      return 0;
    }

    const [affectedRows] = await Notification.update(
      { isRead: true },
      {
        where: {
          notificationId,
          isRead: false,
          [Op.or]: scopes,
        },
      }
    );

    return affectedRows;
  };

  markAllAsReadForRooms = async ({ userId, roomNames = [] }) => {
    const scopes = [];

    if (userId) {
      scopes.push({ userId });
    }

    if (Array.isArray(roomNames) && roomNames.length > 0) {
      scopes.push({
        roomName: {
          [Op.in]: roomNames,
        },
      });
    }

    if (scopes.length === 0) {
      return 0;
    }

    const [affectedRows] = await Notification.update(
      { isRead: true },
      {
        where: {
          isRead: false,
          [Op.or]: scopes,
        },
      }
    );

    return affectedRows;
  };
}

export default NotificationRepository;
