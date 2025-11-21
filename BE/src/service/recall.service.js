import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../error/index.js";
import dayjs from "dayjs";
import db from "../models/index.cjs";

class RecallService {
  #recallRepository;
  #mailService;
  #notificationService;

  constructor({ recallRepository, mailService, notificationService }) {
    this.#recallRepository = recallRepository;
    this.#mailService = mailService;
    this.#notificationService = notificationService;
  }

  createRecallCampaign = async ({
    name,
    description,
    issuedByCompanyId,
    issueDate,
    affectedVehicleModelIds,
  }) => {
    const newRecallCampaign = await db.sequelize.transaction(
      async (transaction) => {
        const campaign = await this.#recallRepository.createRecallCampaign(
          {
            name,
            description,
            issuedByCompanyId,
            issueDate: dayjs(issueDate).startOf("day").toDate(),
            affectedVehicleModelIds,
            status: "DRAFT",
          },
          transaction
        );
        return campaign;
      }
    );
    return newRecallCampaign;
  };

  getRecallCampaignById = async (recallCampaignId) => {
    const campaign = await this.#recallRepository.findRecallCampaignById(
      recallCampaignId
    );

    if (!campaign) {
      throw new NotFoundError("Recall campaign not found");
    }

    return campaign;
  };

  getAllRecallCampaigns = async ({ page, limit, status, companyId }) => {
    const result = await this.#recallRepository.findAllRecallCampaigns({
      page,
      limit,
      status,
      companyId,
    });

    return result;
  };

  notifyRecallOwners = async ({
    serviceCenterId,
    recallCampaignId,
    vehicleVins,
  }) => {
    const notificationResult = await db.sequelize.transaction(
      async (transaction) => {
        const serviceCenter =
          await this.#recallRepository.findServiceCenterById(
            serviceCenterId,
            transaction
          );
        if (!serviceCenter) {
          throw new NotFoundError("Service center not found");
        }

        const campaign = await this.#recallRepository.findRecallCampaignById(
          recallCampaignId,
          transaction
        );

        if (!campaign) {
          throw new NotFoundError("Recall campaign not found");
        }

        if (campaign.status !== "ACTIVE") {
          throw new ConflictError(
            "Cannot notify for an inactive recall campaign"
          );
        }

        const vehicles = await db.Vehicle.findAll({
          where: { vin: { [db.Sequelize.Op.in]: vehicleVins } },
          include: [
            {
              model: db.Customer,
              as: "owner",
              attributes: ["name", "email"],
            },
            {
              model: db.VehicleModel,
              as: "model",
              attributes: ["vehicleModelName"],
            },
          ],
          transaction,
        });

        if (vehicles.length === 0) {
          throw new NotFoundError("No vehicles found with the provided VINs");
        }

        const emailsToSend = [];
        for (const vehicle of vehicles) {
          if (!vehicle.owner || !vehicle.owner.email) {
            continue;
          }

          const affectedModels = Array.isArray(campaign.affectedVehicleModelIds)
            ? campaign.affectedVehicleModelIds
            : [];

          const isAffectedModel = affectedModels.includes(
            vehicle.vehicleModelId
          );

          if (!isAffectedModel) {
            continue;
          }

          let outstandingRecalls = vehicle.outstandingRecallCampaignIds;

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

          const hasOutstandingRecall = outstandingRecalls.includes(
            campaign.recallCampaignId
          );

          if (!hasOutstandingRecall) {
            continue;
          }

          const companyName = campaign.issuedByCompany?.name ?? "hãng";
          const modelName = vehicle.model?.vehicleModelName ?? "xe";

          emailsToSend.push({
            to: vehicle.owner.email,
            subject: `QUAN TRỌNG: Thông báo triệu hồi ${modelName} (${vehicle.vin}) từ ${companyName}`,
            text: `Kính gửi ${vehicle.owner.name},
          Xe ${modelName} của quý khách với số VIN ${vehicle.vin} nằm trong chương trình triệu hồi của chúng tôi.
          Chi tiết chiến dịch: ${campaign.name} - ${campaign.description}
          Vui lòng liên hệ trung tâm ${serviceCenter.name} (${serviceCenter.address}) để sắp xếp lịch kiểm tra và sửa chữa miễn phí.
          Trân trọng,
          ${companyName}
          `,
            html: `<p>Kính gửi ${vehicle.owner.name},</p>
          <p>Xe <b>${modelName}</b> của quý khách với số VIN <b>${vehicle.vin}</b> nằm trong chương trình triệu hồi của chúng tôi.</p>
          <p>Chi tiết chiến dịch: <b>${campaign.name}</b> - ${campaign.description}</p>
          <p>Vui lòng liên hệ trung tâm <b>${serviceCenter.name}</b> (${serviceCenter.address}) để sắp xếp lịch kiểm tra và sửa chữa miễn phí.</p>
          <p>Trân trọng,</p>
          <p><b>${companyName}</b></p>
          `,
          });
        }

        if (emailsToSend.length === 0) {
          throw new ConflictError(
            "No eligible owners found to notify for the provided vehicles."
          );
        }

        for (const email of emailsToSend) {
          await this.#mailService.sendMail(
            email.to,
            email.subject,
            email.text,
            email.html
          );
        }

        const roomName = `service_center_staff_${serviceCenterId}`;
        const eventName = "recallNotificationDispatched";
        const data = {
          recallCampaignId: campaign.recallCampaignId,
          campaignName: campaign.name,
          notifiedVehiclesCount: emailsToSend.length,
        };
        await this.#notificationService.sendToRoom(roomName, eventName, data);

        return { notifiedCount: emailsToSend.length };
      }
    );
    return notificationResult;
  };

  activateRecallCampaign = async (recallCampaignId, companyId) => {
    const updatedCampaign = await db.sequelize.transaction(
      async (transaction) => {
        const campaign = await this.#recallRepository.findRecallCampaignById(
          recallCampaignId,
          transaction
        );

        if (!campaign) {
          throw new NotFoundError("Recall campaign not found.");
        }

        if (campaign.status !== "DRAFT") {
          throw new ConflictError(
            `Recall campaign with status ${campaign.status} cannot be activated.`
          );
        }

        if (campaign.issuedByCompanyId !== companyId) {
          throw new ForbiddenError(
            "You are not authorized to activate this recall campaign."
          );
        }

        const isUpdated = await this.#recallRepository.updateRecallCampaign(
          recallCampaignId,
          { status: "ACTIVE" },
          transaction
        );

        if (!isUpdated) {
          throw new ConflictError("Failed to activate recall campaign.");
        }

        const affectedVehicleModels = campaign.affectedVehicleModelIds;

        if (affectedVehicleModels && affectedVehicleModels.length > 0) {
          await this.#recallRepository.addRecallToVehicles(
            affectedVehicleModels,
            recallCampaignId,
            transaction
          );
        }

        const activatedCampaign =
          await this.#recallRepository.findRecallCampaignById(
            recallCampaignId,
            transaction
          );

        return activatedCampaign;
      }
    );
    return updatedCampaign;
  };
}

export default RecallService;
