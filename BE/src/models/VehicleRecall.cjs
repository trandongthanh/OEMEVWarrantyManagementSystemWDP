module.exports = (sequelize, DataTypes) => {
  const VehicleRecall = sequelize.define(
    "VehicleRecall",
    {
      vehicleRecallId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "vehicle_recall_id",
      },

      recallCampaignId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "recall_campaign_id",
      },

      vin: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "vin",
      },

      status: {
        type: DataTypes.ENUM("PENDING", "NOTIFIED", "IN_PROGRESS", "RESOLVED"),
        allowNull: false,
        defaultValue: "PENDING",
        field: "status",
      },

      notifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "notified_at",
      },

      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "resolved_at",
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "notes",
      },
    },
    {
      tableName: "vehicle_recall",
      timestamps: true,
    }
  );

  VehicleRecall.associate = (models) => {
    VehicleRecall.belongsTo(models.RecallCampaign, {
      foreignKey: "recallCampaignId",
      targetKey: "recallCampaignId",
      as: "campaign",
    });

    VehicleRecall.belongsTo(models.Vehicle, {
      foreignKey: "vin",
      targetKey: "vin",
      as: "vehicle",
    });
  };

  return VehicleRecall;
};
