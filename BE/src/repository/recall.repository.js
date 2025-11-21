import db from "../models/index.cjs";
const {
  RecallCampaign,
  Vehicle,
  Customer,
  CaseLine,
  ServiceCenter,
  VehicleProcessingRecord,
  User,
  VehicleModel,
  VehicleCompany,
} = db;

import { Op } from "sequelize";

class RecallRepository {
  createRecallCampaign = async (recallCampaignData, transaction) => {
    const newCampaign = await RecallCampaign.create(recallCampaignData, {
      transaction,
    });

    return newCampaign.toJSON();
  };

  findRecallCampaignById = async (recallCampaignId, transaction) => {
    const campaign = await RecallCampaign.findByPk(recallCampaignId, {
      include: [
        {
          model: VehicleCompany,
          as: "issuedByCompany",
        },
      ],
      transaction,
    });
    return campaign ? campaign.toJSON() : null;
  };

  updateRecallCampaign = async (recallCampaignId, updateData, transaction) => {
    const [updatedRows] = await RecallCampaign.update(updateData, {
      where: { recallCampaignId },
      transaction,
    });

    const isUpdated = updatedRows > 0;
    return isUpdated;
  };

  findAllRecallCampaigns = async (
    { page, limit, status, companyId },
    transaction
  ) => {
    const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
    const limitNumber = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (companyId) {
      where.issuedByCompanyId = companyId;
    }

    const { count, rows } = await RecallCampaign.findAndCountAll({
      where,
      offset,
      limit: limitNumber,
      order: [["createdAt", "DESC"]],
      transaction,
    });

    const result = {
      recallCampaigns: rows,
      pagination: {
        totalItems: count,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        totalPages: Math.ceil(count / limitNumber),
      },
    };
    return result;
  };

  findVehiclesByModelIds = async (vehicleModelIds, transaction) => {
    const vehicles = await Vehicle.findAll({
      where: {
        vehicleModelId: { [Op.in]: vehicleModelIds },
      },
      include: [
        {
          model: Customer,
          as: "owner",
          attributes: ["customerId", "email", "name"],
        },
      ],
      transaction,
    });
    return vehicles;
  };

  findCaseLineById = async (caseLineId, transaction) => {
    const caseline = await CaseLine.findByPk(caseLineId, { transaction });
    return caseline;
  };

  updateCaseLineRecallCampaignId = async (
    caseLineId,
    recallCampaignId,
    transaction
  ) => {
    const [updatedRows] = await CaseLine.update(
      {
        recallCampaignId: recallCampaignId,
      },
      {
        where: { id: caseLineId },
        transaction,
      }
    );
    const isUpdated = updatedRows > 0;
    return isUpdated;
  };

  getVehicleByVin = async (vin, transaction) => {
    const vehicle = await Vehicle.findByPk(vin, {
      transaction,
      include: [
        {
          model: VehicleModel,
          as: "model",
        },
        {
          model: Customer,
          as: "owner",
        },
      ],
    });
    return vehicle;
  };

  getRecallCampaignsByIds = async (recallCampaignIds, transaction) => {
    const campaigns = await RecallCampaign.findAll({
      where: {
        recallCampaignId: { [Op.in]: recallCampaignIds },
      },
      transaction,
    });
    return campaigns;
  };

  findServiceCenterByVehicleVin = async (vin, transaction) => {
    const vehicleWithServiceCenter = await Vehicle.findOne({
      where: { vin },
      include: [
        {
          model: VehicleProcessingRecord,
          as: "vehicleRecord",
          include: [
            {
              model: User,
              as: "createdByStaff",
              include: [
                {
                  model: ServiceCenter,
                  as: "serviceCenter",
                },
              ],
            },
          ],
        },
      ],
      transaction,
    });
    return vehicleWithServiceCenter;
  };

  findServiceCenterById = async (serviceCenterId, transaction) => {
    const serviceCenter = await ServiceCenter.findByPk(serviceCenterId, {
      transaction,
    });
    return serviceCenter;
  };

  findVehiclesByRecallCampaignId = async (recallCampaignId, transaction) => {
    const vehicles = await Vehicle.findAll({
      where: {
        outstandingRecallCampaignIds: { [Op.contains]: [recallCampaignId] },
      },
      include: [
        {
          model: Customer,
          as: "owner",
          attributes: ["customerId", "email", "name"],
        },
      ],
      transaction,
    });
    return vehicles;
  };

  addRecallToVehicles = async (
    affectedVehicleModelIds,
    recallCampaignId,
    transaction
  ) => {
    const vehiclesToUpdate = await Vehicle.findAll({
      where: {
        vehicleModelId: { [Op.in]: affectedVehicleModelIds },
      },
      transaction,
    });

    for (const vehicle of vehiclesToUpdate) {
      let outstandingRecalls = vehicle.outstandingRecallCampaignIds || [];

      if (typeof outstandingRecalls === "string") {
        try {
          outstandingRecalls = JSON.parse(outstandingRecalls);
        } catch (error) {
          outstandingRecalls = [];
        }
      }

      if (!Array.isArray(outstandingRecalls)) {
        outstandingRecalls = [];
      }

      if (!outstandingRecalls.includes(recallCampaignId)) {
        outstandingRecalls.push(recallCampaignId);

        await vehicle.update(
          {
            outstandingRecallCampaignIds: outstandingRecalls,
          },
          { transaction }
        );
      }
    }
  };
}

export default RecallRepository;
