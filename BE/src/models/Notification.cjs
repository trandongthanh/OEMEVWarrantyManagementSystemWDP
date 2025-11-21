module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      notificationId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: "notification_id",
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "user_id",
        references: {
          model: "user",
          key: "user_id",
        },
      },

      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "room_name",
      },

      eventName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_name",
      },

      data: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "data",
      },

      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: "is_read",
      },
    },
    {
      tableName: "notification",
      timestamps: true,
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Notification;
};
