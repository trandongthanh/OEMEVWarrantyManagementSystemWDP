import { col, fn, Op, literal } from "sequelize";
import db from "../models/index.cjs";

const {
  CaseLine,
  GuaranteeCase,
  User,
  TypeComponent,
  ComponentReservation,
  Component,
  VehicleProcessingRecord,
  ServiceCenter,
} = db;

class CaseLineRepository {
  bulkCreate = async (caseLines, transaction = null) => {
    const newCaseLines = await CaseLine.bulkCreate(caseLines, {
      transaction: transaction,
    });

    if (!newCaseLines) {
      return [];
    }

    return newCaseLines.map((caseLine) => caseLine.toJSON());
  };

  createCaseLine = async (caseLineData, transaction = null) => {
    const newCaseLine = await CaseLine.create(caseLineData, {
      transaction: transaction,
    });

    return newCaseLine ? newCaseLine.toJSON() : null;
  };

  findById = async (caseLineId, transaction = null, lock = null) => {
    const caseLine = await CaseLine.findOne({
      include: [
        {
          model: GuaranteeCase,
          as: "guaranteeCase",
          required: true,

          include: [
            {
              model: VehicleProcessingRecord,
              as: "vehicleProcessingRecord",
              attributes: [
                "vehicleProcessingRecordId",
                "vin",
                "createdByStaffId",
              ],
              required: true,
              include: [
                {
                  model: User,
                  as: "createdByStaff",
                  attributes: ["userId", "serviceCenterId"],
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      where: { id: caseLineId },
      transaction: transaction,
      lock: lock,
    });

    return caseLine ? caseLine.toJSON() : null;
  };

  bulkUpdateStatusByIds = async (
    { caseLineIds, status },
    transaction = null,
    lock = null
  ) => {
    const [numberOfAffectedRows] = await CaseLine.update(
      { status: status },
      {
        where: {
          id: {
            [Op.in]: caseLineIds,
          },
        },
        transaction: transaction,
        lock: lock,
      }
    );

    if (numberOfAffectedRows <= 0) {
      return [];
    }

    const updatedCaseLines = await this.findByIds({ caseLineIds }, transaction);

    return updatedCaseLines;
  };

  findDetailById = async (caselineId, transaction = null, lock = null) => {
    const caseLine = await CaseLine.findOne({
      attributes: [
        "id",
        "diagnosisText",
        "correctionText",
        "typeComponentId",
        "quantity",
        "warrantyStatus",
        "status",
        "rejectionReason",
        "evidenceImageUrls",
        "updatedAt",
        "installationImageUrls",
      ],
      include: [
        {
          model: GuaranteeCase,
          as: "guaranteeCase",
          attributes: ["guaranteeCaseId", "contentGuarantee", "status"],
          required: true,

          include: [
            {
              model: VehicleProcessingRecord,
              as: "vehicleProcessingRecord",
              attributes: ["vehicleProcessingRecordId", "vin"],
              required: true,
              include: [
                {
                  model: User,
                  as: "createdByStaff",
                  attributes: ["userId", "serviceCenterId", "vehicleCompanyId"],
                  required: false,
                  include: [
                    {
                      model: ServiceCenter,
                      as: "serviceCenter",
                      attributes: ["serviceCenterId", "vehicleCompanyId"],
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "diagnosticTechnician",
          attributes: ["userId", "name"],
        },
        {
          model: User,
          as: "repairTechnician",
          attributes: ["userId", "name"],
        },
        {
          model: TypeComponent,
          as: "typeComponent",
          attributes: ["typeComponentId", "sku", "name", "price"],
        },
        {
          model: ComponentReservation,
          as: "reservations",
          attributes: ["reservationId", "caseLineId", "status"],

          include: [
            {
              model: Component,
              as: "component",
              attributes: ["componentId", "serialNumber", "status"],
            },
          ],
        },
      ],
      where: { id: caselineId },
      transaction: transaction,
      lock: lock,
    });

    return caseLine ? caseLine.toJSON() : null;
  };

  findByIds = async ({ caseLineIds }, transaction = null, lock = null) => {
    const caseLines = await CaseLine.findAll({
      attributes: [
        "id",
        "diagnosisText",
        "correctionText",
        "typeComponentId",
        "quantity",
        "warrantyStatus",
        "status",
        "rejectionReason",
        "evidenceImageUrls",
        "updatedAt",
        "evidenceImageUrls",
        "installationImageUrls",
      ],
      where: {
        id: {
          [Op.in]: caseLineIds,
        },
      },
      transaction: transaction,
      lock: lock,
    });

    if (!caseLines || caseLines.length === 0) {
      return [];
    }

    return caseLines?.map((cl) => cl.toJSON());
  };

  assignTechnicianToRepairCaseline = async ({
    caselineId,
    technicianId,
    transaction = null,
  }) => {
    const [rowsUpdated] = await CaseLine.update(
      {
        repairTechId: technicianId,
      },
      {
        where: {
          id: caselineId,
        },
        transaction: transaction,
      }
    );

    if (rowsUpdated === 0) {
      return 0;
    }

    const updatedCaseLine = await CaseLine.findByPk(caselineId, {
      transaction: transaction,
    });

    return updatedCaseLine ? updatedCaseLine.toJSON() : null;
  };

  updateCaseline = async (
    {
      caselineId,
      diagnosisText,
      correctionText,
      typeComponentId,
      quantity,
      status,
      warrantyStatus,
      rejectionReason,
      evidenceImageUrls,
    },
    transaction = null
  ) => {
    const updatePayload = {
      diagnosisText,
      correctionText,
      typeComponentId,
      quantity,
      status,
      warrantyStatus,
      rejectionReason,
    };

    const [rowsUpdated] = await CaseLine.update(updatePayload, {
      where: { id: caselineId },
      transaction: transaction,
    });

    if (rowsUpdated <= 0) {
      return null;
    }

    const updatedCaseLine = await CaseLine.findByPk(caselineId, {
      transaction: transaction,
    });

    return updatedCaseLine ? updatedCaseLine.toJSON() : null;
  };

  updateInstallationImages = async (
    { caselineId, installationImageUrls },
    transaction = null
  ) => {
    const [rowsUpdated] = await CaseLine.update(
      { installationImageUrls: installationImageUrls },
      {
        where: { id: caselineId },
        transaction: transaction,
      }
    );

    if (rowsUpdated <= 0) {
      return null;
    }

    const updatedCaseLine = await CaseLine.findByPk(caselineId, {
      transaction: transaction,
    });

    return updatedCaseLine ? updatedCaseLine.toJSON() : null;
  };

  getVinById = async (caselineId, transaction = null, lock = null) => {
    const record = await CaseLine.findOne({
      attributes: ["id"],
      include: [
        {
          model: GuaranteeCase,
          as: "guaranteeCase",
          attributes: ["guaranteeCaseId"],
          required: true,
          include: [
            {
              model: VehicleProcessingRecord,
              as: "vehicleProcessingRecord",
              attributes: ["vehicleProcessingRecordId", "vin"],
              required: true,
              include: [
                {
                  model: User,
                  as: "createdByStaff",
                  attributes: ["userId", "serviceCenterId"],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      where: {
        id: caselineId,
      },
      transaction: transaction,
      lock: lock,
    });

    return record ? record.toJSON() : null;
  };

  findAll = async ({
    page = 1,
    limit = 10,
    status,
    guaranteeCaseId,
    warrantyStatus,
    vehicleProcessingRecordId,
    diagnosticTechId,
    repairTechId,
    sortBy = "createdAt",
    sortOrder = "DESC",
    serviceCenterId,
  }) => {
    const offset = (page - 1) * limit;
    const where = {};
    const guaranteeCaseWhere = {};
    const vehicleProcessingRecordWhere = {};
    const serviceCenterWhere = {};

    if (status) where.status = status;
    if (warrantyStatus) where.warrantyStatus = warrantyStatus;
    if (guaranteeCaseId) where.guaranteeCaseId = guaranteeCaseId;
    if (diagnosticTechId) where.diagnosticTechId = diagnosticTechId;
    if (repairTechId) where.repairTechId = repairTechId;
    if (vehicleProcessingRecordId) {
      vehicleProcessingRecordWhere.vehicleProcessingRecordId =
        vehicleProcessingRecordId;
    }
    if (serviceCenterId) {
      serviceCenterWhere.serviceCenterId = serviceCenterId;
    }

    const { count, rows } = await CaseLine.findAndCountAll({
      where: where,
      include: [
        {
          model: GuaranteeCase,
          as: "guaranteeCase",
          attributes: ["guaranteeCaseId", "contentGuarantee", "status"],
          where:
            Object.keys(guaranteeCaseWhere).length > 0
              ? guaranteeCaseWhere
              : undefined,
          required: true,
          include: [
            {
              model: VehicleProcessingRecord,
              as: "vehicleProcessingRecord",
              attributes: ["vehicleProcessingRecordId", "vin"],
              where:
                Object.keys(vehicleProcessingRecordWhere).length > 0
                  ? vehicleProcessingRecordWhere
                  : undefined,
              required: true,

              include: [
                {
                  model: User,
                  as: "createdByStaff",
                  attributes: ["userId", "serviceCenterId"],
                  where:
                    Object.keys(serviceCenterWhere).length > 0
                      ? serviceCenterWhere
                      : undefined,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "diagnosticTechnician",
          attributes: ["userId", "name", "email"],
        },
        {
          model: User,
          as: "repairTechnician",
          attributes: ["userId", "name", "email"],
        },
        {
          model: TypeComponent,
          as: "typeComponent",
          attributes: ["typeComponentId", "sku", "name", "price"],
        },
        {
          model: ComponentReservation,
          as: "reservations",
          attributes: ["reservationId", "status"],
          required: false,
        },
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true,
    });

    return {
      caseLines: rows.map((row) => row.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };

  findByProcessingRecordId = async (
    { vehicleProcessingRecordId },
    transaction = null,
    lock = null
  ) => {
    const caseLines = await CaseLine.findAll({
      include: [
        {
          model: GuaranteeCase,
          as: "guaranteeCase",
          where: { vehicleProcessingRecordId },
          attributes: ["guaranteeCaseId"],
        },
      ],
      transaction,
      lock: lock,
    });

    return caseLines.map((cl) => cl.toJSON());
  };

  findPendingApprovalIdsByVehicleProcessingRecordId = async (
    { vehicleProcessingRecordId },
    transaction = null,
    lock = null
  ) => {
    const caseLines = await CaseLine.findAll({
      attributes: ["id"],
      where: {
        status: "PENDING_APPROVAL",
      },
      include: [
        {
          model: GuaranteeCase,
          as: "guaranteeCase",
          attributes: [],
          where: { vehicleProcessingRecordId },
          required: true,
        },
      ],
      transaction,
      lock,
    });

    return caseLines.map((cl) => cl.id ?? cl.toJSON().id);
  };

  findTopWarrantyTypeComponents = async (
    { limit, startDate, endDate, serviceCenterId },
    transaction = null,
    lock = null
  ) => {
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (serviceCenterId) {
      whereClause.serviceCenterId = serviceCenterId;
    }

    const typeComponentUsage = await Component.findAll({
      attributes: [
        "typeComponentId",
        [
          db.sequelize.fn("COUNT", db.sequelize.col("typeComponentId")),
          "count",
        ],
      ],
      where: whereClause,
      group: ["typeComponentId"],
      order: [[db.sequelize.literal("count"), "DESC"]],
      limit: limit,
      transaction,
      lock,
    });

    return typeComponentUsage.map((item) => item.toJSON());
  };

  findMostUsedTypeComponents = async ({
    serviceCenterId,
    companyId,
    limit = 10,
    offset = 0,
    startDate,
    endDate,
  }) => {
    const where = {
      warrantyStatus: "ELIGIBLE",
      typeComponentId: { [Op.ne]: null },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    const createdByStaffWhere = {};
    if (serviceCenterId) createdByStaffWhere.serviceCenterId = serviceCenterId;
    if (companyId) createdByStaffWhere.vehicleCompanyId = companyId;

    const caselines = await CaseLine.findAll({
      attributes: [
        "typeComponentId",
        [fn("COUNT", col("CaseLine.id")), "warrantyCount"],
        [fn("SUM", col("CaseLine.quantity")), "totalQuantity"],
      ],
      where: where,

      include: [
        {
          model: TypeComponent,
          as: "typeComponent",
          attributes: ["typeComponentId", "name", "sku", "category", "price"],
        },
        {
          model: GuaranteeCase,
          as: "guaranteeCase",
          attributes: [],
          required: true,
          include: [
            {
              model: VehicleProcessingRecord,
              as: "vehicleProcessingRecord",
              attributes: [],
              required: true,
              include: [
                {
                  model: User,
                  as: "createdByStaff",
                  attributes: [],
                  where:
                    Object.keys(createdByStaffWhere).length > 0
                      ? createdByStaffWhere
                      : undefined,
                  required: true,
                },
              ],
            },
          ],
        },
      ],

      group: [
        "CaseLine.type_component_id",
        "typeComponent.type_component_id",
        "typeComponent.name",
        "typeComponent.sku",
        "typeComponent.category",
        "typeComponent.price",
      ],
      order: [[literal("warrantyCount"), "DESC"]],
      limit: limit,
      offset: offset,
    });

    return caselines.map((item) => item.toJSON());
  };
}

export default CaseLineRepository;
