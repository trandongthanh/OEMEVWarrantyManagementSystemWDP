module.exports = (sequelize, DataTypes) => {
  const Guest = sequelize.define(
    "Guest",
    {
      guestId: {
        type: DataTypes.STRING(64),
        primaryKey: true,
        field: "guest_id",
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        field: "email",
      },
    },
    {
      tableName: "guest",
    }
  );

  Guest.associate = function (models) {
    Guest.hasMany(models.Conversation, {
      foreignKey: "guest_id",
      as: "conversations",
    });
  };

  return Guest;
};
