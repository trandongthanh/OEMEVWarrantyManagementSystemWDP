module.exports = (sequelize, DataTypes) => {
  const TaskAssignment = sequelize.define(
    "TaskAssignment",
    {
      taskAssignmentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
        field: "task_assignment_id",
      },

      technicianId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "technician_id",
      },

      caseLineId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "case_line_id",
      },

      assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: "assigned_at",
      },

      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "started_at",
      },

      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "completed_at",
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "task_assignment",
    }
  );

  TaskAssignment.associate = function (models) {
    TaskAssignment.belongsTo(models.User, {
      foreignKey: "technician_id",
      as: "technician",
    });
    TaskAssignment.belongsTo(models.CaseLine, {
      foreignKey: "case_line_id",
      as: "caseLine",
    });
  };

  return TaskAssignment;
};
