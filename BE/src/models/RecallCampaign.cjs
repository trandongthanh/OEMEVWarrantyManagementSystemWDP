module.exports = (sequelize, DataTypes) => {
  const RecallCampaign = sequelize.define(
    "RecallCampaign",
    {
      recallCampaignId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"),
        defaultValue: "DRAFT",
        allowNull: false,
      },

      issuedByCompanyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      issueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      affectedVehicleModelIds: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: "RecallCampaigns",
      timestamps: true,
    }
  );

  RecallCampaign.associate = (models) => {
    RecallCampaign.belongsTo(models.VehicleCompany, {
      foreignKey: "issuedByCompanyId",
      as: "issuedByCompany",
    });

    RecallCampaign.hasMany(models.VehicleRecall, {
      foreignKey: "recallCampaignId",
      sourceKey: "recallCampaignId",
      as: "vehicleRecalls",
    });
  };

  return RecallCampaign;
};
