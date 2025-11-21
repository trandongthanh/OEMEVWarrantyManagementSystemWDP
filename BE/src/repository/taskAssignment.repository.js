import db from "../models/index.cjs";
import { ConflictError, NotFoundError } from "../error/index.js";
import { Sequelize, Op } from "sequelize";

const {
  TaskAssignment,
  User,
  CaseLine,
  GuaranteeCase,
  VehicleProcessingRecord,
  TypeComponent,
  Vehicle,
} = db;

class TaskAssignmentRepository {
  countActiveTasksByTechnician = async (technicianId, transaction = null) => {
    const count = await TaskAssignment.count({
      where: {
        technicianId: technicianId,
        isActive: true,
      },
      transaction,
    });
    return count;
  };

  countTasksForTechniciansOnDate = async (
    { technicianIds, date },
    transaction = null
  ) => {
    const taskCounts = await TaskAssignment.findAll({
      attributes: [
        "technicianId",
        [
          Sequelize.fn("COUNT", Sequelize.col("task_assignment_id")),
          "taskCount",
        ],
      ],
      where: {
        technicianId: technicianIds,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("DATE", Sequelize.col("assigned_at")),
            "=",
            date
          ),
        ],
      },
      group: ["technicianId"],
      raw: true,
      transaction,
    });

    return taskCounts;
  };

  createDiagnosisTaskForRecord = async (
    { vehicleProcessingRecordId, technicianId },
    transaction
  ) => {
    const newTaskAssignment = await TaskAssignment.create(
      {
        vehicleProcessingRecordId,
        technicianId,
        taskType: "DIAGNOSIS",
      },
      { transaction }
    );

    if (!newTaskAssignment) {
      return null;
    }

    return newTaskAssignment.toJSON();
  };

  findDiagnosisTaskByRecordId = async (
    { vehicleProcessingRecordId },
    transaction = null,
    lock = null
  ) => {
    const taskAssignment = await TaskAssignment.findOne({
      where: {
        vehicleProcessingRecordId: vehicleProcessingRecordId,
        taskType: "DIAGNOSIS",
      },
      transaction,
      lock,
    });

    return taskAssignment ? taskAssignment.toJSON() : null;
  };

  cancelDiagnosisTaskByRecordId = async (
    { vehicleProcessingRecordId },
    transaction
  ) => {
    const whereClause = {
      vehicleProcessingRecordId: vehicleProcessingRecordId,
      taskType: "DIAGNOSIS",
      isActive: true,
    };

    const [affectedRows] = await TaskAssignment.update(
      { isActive: false },
      {
        where: whereClause,
        transaction,
      }
    );

    return affectedRows;
  };

  findAllByServiceCenterId = async (
    { serviceCenterId },
    transaction = null
  ) => {
    if (!serviceCenterId) {
      return [];
    }

    const tasks = await TaskAssignment.findAll({
      include: [
        {
          model: User,
          as: "technician",
          attributes: ["userId", "name", "email", "phone", "serviceCenterId"],
          where: { serviceCenterId },
          required: true,
        },
        {
          model: VehicleProcessingRecord,
          as: "vehicleProcessingRecord",
          attributes: [
            "vehicleProcessingRecordId",
            "vin",
            "status",
            "createdByStaffId",
          ],
          required: false,
          include: [
            {
              model: Vehicle,
              as: "vehicle",
              attributes: ["vin", "vehicleModelId"],
            },
          ],
        },
        {
          model: CaseLine,
          as: "caseLine",
          attributes: [
            "id",
            "status",
            "typeComponentId",
            "diagnosticTechId",
            "repairTechId",
          ],
          required: false, // Use left join
          include: [
            {
              model: TypeComponent,
              as: "typeComponent",
              attributes: ["typeComponentId", "name", "sku"],
            },
          ],
        },
      ],
      order: [["assignedAt", "DESC"]],
      transaction,
    });

    return tasks.map((task) => task.toJSON());
  };

  createTaskAssignmentForCaseline = async (
    { caseLineId, technicianId, taskType = "REPAIR" },
    transaction
  ) => {
    const newTaskAssignment = await TaskAssignment.create(
      {
        caseLineId,
        technicianId,
        taskType,
      },
      { transaction }
    );

    if (!newTaskAssignment) {
      return null;
    }

    return newTaskAssignment.toJSON();
  };

  findByCaselineId = async (caseLineId, transaction = null, lock = null) => {
    const taskAssignment = await TaskAssignment.findOne({
      where: { caseLineId },
      transaction,
      lock,
    });

    if (!taskAssignment) {
      return null;
    }

    return taskAssignment.toJSON();
  };

  completeTaskByCaselineId = async (
    { caseLineId, completedAt, isActive },
    transaction = null
  ) => {
    const [affectedRows] = await TaskAssignment.update(
      { isActive: isActive, completedAt: completedAt },
      {
        where: {
          caseLineId: caseLineId,
          isActive: true,
        },
        transaction,
      }
    );

    if (affectedRows === 0) {
      throw new ConflictError("No active task assignment found to complete.");
    }

    const updated = await TaskAssignment.findOne({
      where: { caseLineId },
      transaction,
    });

    if (!updated) {
      throw new NotFoundError("Task assignment not found.");
    }

    return updated.toJSON();
  };
}

export default TaskAssignmentRepository;
