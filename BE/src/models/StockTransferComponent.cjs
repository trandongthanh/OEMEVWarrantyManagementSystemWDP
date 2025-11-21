module.exports = (sequelize, DataTypes) => {
  const StockTransferComponent = sequelize.define(
    "StockTransferComponent",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      requestId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "request_id",
      },
      componentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "component_id",
      },
    },
    {
      tableName: "stock_transfer_component",
      timestamps: true,
    }
  );

  StockTransferComponent.associate = function (models) {
    StockTransferComponent.belongsTo(models.StockTransferRequest, {
      foreignKey: "request_id",
      as: "request",
    });
    StockTransferComponent.belongsTo(models.Component, {
      foreignKey: "component_id",
      as: "component",
    });
  };

  return StockTransferComponent;
};
