import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../../error/index.js";

class RecallController {
  #recallService;

  constructor({ recallService }) {
    this.#recallService = recallService;
  }

  createRecallCampaign = async (req, res, next) => {
    const { name, description, issueDate, affectedVehicleModelIds } = req.body;
    const companyId = req.context?.companyId ?? req.companyId;

    if (!companyId) {
      throw new BadRequestError(
        "Company context is required to create a recall campaign"
      );
    }

    const newCampaign = await this.#recallService.createRecallCampaign({
      name,
      description,
      issuedByCompanyId: companyId,
      issueDate,
      affectedVehicleModelIds,
    });

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: { recallCampaign: newCampaign },
    });
  };

  getRecallCampaignById = async (req, res, next) => {
    const { id } = req.params;

    const campaign = await this.#recallService.getRecallCampaignById(id);

    res.status(StatusCodes.OK).json({
      status: "success",
      data: { recallCampaign: campaign },
    });
  };

  getAllRecallCampaigns = async (req, res, next) => {
    const { page, limit, status } = req.query;
    const companyId = req.context?.companyId ?? req.companyId;

    if (!companyId) {
      throw new BadRequestError(
        "Company context is required to fetch recall campaigns"
      );
    }

    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);

    const pagination = {
      page: Number.isNaN(parsedPage) || parsedPage <= 0 ? 1 : parsedPage,
      limit: Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 10 : parsedLimit,
    };

    const result = await this.#recallService.getAllRecallCampaigns({
      page: pagination.page,
      limit: pagination.limit,
      status,
      companyId,
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      data: { ...result },
    });
  };

  notifyRecallOwners = async (req, res, next) => {
    const { serviceCenterId } = req.params;
    const { recallCampaignId, vehicleVins } = req.body;

    const result = await this.#recallService.notifyRecallOwners({
      serviceCenterId,
      recallCampaignId,
      vehicleVins,
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  };

  activateRecallCampaign = async (req, res, next) => {
    const { id } = req.params;
    const companyId = req.context?.companyId ?? req.companyId;

    if (!companyId) {
      throw new BadRequestError(
        "Company context is required to activate a recall campaign"
      );
    }

    const updatedCampaign = await this.#recallService.activateRecallCampaign(
      id,
      companyId
    );

    res.status(StatusCodes.OK).json({
      status: "success",
      data: { recallCampaign: updatedCampaign },
    });
  };
}

export default RecallController;
