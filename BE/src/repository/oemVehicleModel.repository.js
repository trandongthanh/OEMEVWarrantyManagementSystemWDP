import db from "../models/index.cjs";
import { Op } from "sequelize";

const { VehicleModel, Vehicle, VehicleProcessingRecord, GuaranteeCase, CaseLine } =
  db;

class OemVehicleModelRepository {
  findBySku = async (sku, transaction = null, lock = null) => {
    const record = await VehicleModel.findOne({
      where: {
        sku: sku,
      },
      transaction: transaction,
      lock: lock,
    });

    return record ? record.toJSON() : null;
  };

  findByNameAndCompanyId = async (
    { vehicleModelName, companyId },
    transaction = null,
    lock = null
  ) => {
    const record = await VehicleModel.findOne({
      where: {
        vehicleModelName: vehicleModelName,
        vehicleCompanyId: companyId,
      },
      transaction: transaction,
    });

    return record ? record.toJSON() : null;
  };

  findByIdAndCompanyId = async ({ vehicleModelId, companyId }) => {
    const record = await VehicleModel.findOne({
      where: {
        vehicleModelId: vehicleModelId,
        vehicleCompanyId: companyId,
      },
    });

    return record ? record.toJSON() : null;
  };

  createVehicleModel = async (vehicleModelData, transaction = null) => {
    const record = await VehicleModel.create(vehicleModelData, {
      transaction: transaction,
    });

    return record.toJSON();
  };

  findMostProblematicModels = async ({
    companyId,
    startDate,
    endDate,
    limit = 10,
  }) => {
    const dateFilter = {};
    if (startDate) {
      dateFilter[Op.gte] = startDate;
    }
    if (endDate) {
      dateFilter[Op.lte] = endDate;
    }

    const results = await VehicleModel.findAll({
      attributes: [
        "vehicleModelId",
        "vehicleModelName",
        [
          db.sequelize.fn("COUNT", db.sequelize.col("vehicles.vehicleRecord.guaranteeCases.caseLines.id")),
          "caseLineCount",
        ],
      ],
      include: [
        {
          model: Vehicle,
          as: "vehicles",
          attributes: [],
          required: true,
          include: [
            {
              model: VehicleProcessingRecord,
              as: "vehicleRecord",
              attributes: [],
              required: true,
              where: Object.keys(dateFilter).length ? { checkInDate: dateFilter } : {},
              include: [
                {
                  model: GuaranteeCase,
                  as: "guaranteeCases",
                  attributes: [],
                  required: true,
                  include: [
                    {
                      model: CaseLine,
                      as: "caseLines",
                      attributes: [],
                      required: true,
                      where: { warrantyStatus: "ELIGIBLE" }, 
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      where: {
        vehicleCompanyId: companyId,
      },
      group: ["VehicleModel.vehicleModelId", "VehicleModel.vehicleModelName"],
      order: [[db.sequelize.literal("caseLineCount"), "DESC"]],
      limit: limit,
      subQuery: false,
    });

    return results.map((r) => r.toJSON());
  };
}

export default OemVehicleModelRepository;
