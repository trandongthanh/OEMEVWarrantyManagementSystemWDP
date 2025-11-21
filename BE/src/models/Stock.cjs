const { default: dayjs } = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define(
    "Stock",
    {
      stockId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: "stock_id",
      },

      quantityInStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "quantity_in_stock",
      },

      warehouseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "warehouse_id",
      },

      quantityReserved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "quantity_reserved",
      },

      quantityAvailable: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.quantityInStock - this.quantityReserved;
        },
      },

      typeComponentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "type_component_id",
      },

      reorderPoint: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "reorder_point",
      },

      lowStockNotifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "low_stock_notified_at",
      },
    },
    {
      tableName: "stock",
      indexes: [
        {
          unique: true,
          fields: ["warehouse_id", "type_component_id"],
          name: "unique_stock_item_location",
        },
      ],

      hooks: {
        afterUpdate: async (stock, options) => {
          const cooldownHours = 2;
          const hoursSinceLastAlert = stock.lowStockNotifiedAt
            ? dayjs().diff(dayjs(stock.lowStockNotifiedAt), "hour", true)
            : Infinity;

          if (
            stock.quantityAvailable <= stock.reorderPoint &&
            hoursSinceLastAlert >= cooldownHours
          ) {
            await stock.update(
              {
                lowStockNotifiedAt: dayjs().toDate(),
              },
              { transaction: options.transaction, hooks: false }
            );
          }

          if (
            stock.quantityAvailable > stock.reorderPoint &&
            stock.lowStockNotifiedAt
          ) {
            await stock.update(
              {
                lowStockNotifiedAt: null,
              },
              { transaction: options.transaction, hooks: false }
            );
          }
        },
      },
    }
  );

  Stock.associate = function (models) {
    Stock.belongsTo(models.Warehouse, {
      foreignKey: "warehouse_id",
      as: "warehouse",
    });

    Stock.belongsTo(models.TypeComponent, {
      foreignKey: "type_component_id",
      as: "typeComponent",
    });

    Stock.hasMany(models.StockReservation, {
      foreignKey: "stock_id",
      as: "reservations",
    });

    Stock.hasMany(models.InventoryAdjustment, {
      foreignKey: "stock_id",
      as: "adjustments",
    });
  };

  return Stock;
};
