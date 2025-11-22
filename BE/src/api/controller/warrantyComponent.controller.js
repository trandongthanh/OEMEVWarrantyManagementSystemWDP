class WarrantyComponentController {
  #warrantyComponentService;

  constructor({ warrantyComponentService }) {
    this.#warrantyComponentService = warrantyComponentService;
  }

  createWarrantyComponent = async (req, res, next) => {
    const { vehicleModelId } = req.params;

    const typeComponents = req.body;

    const { companyId } = req;

    const result =
      await this.#warrantyComponentService.createWarrantyComponents({
        vehicleModelId,
        typeComponents,
        companyId,
      });

    res.status(201).json({
      status: "success",
      data: result,
    });
  };

  getAllWarrantyComponents = async (req, res, next) => {
    const { page, limit, vehicleModelId, typeComponentId } = req.query;
    const { companyId } = req.user;

    const result = await this.#warrantyComponentService.getWarrantyComponents({
      page,
      limit,
      vehicleModelId,
      typeComponentId,
      companyId,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  };

  getWarrantyComponentById = async (req, res, next) => {
    const { id } = req.params;
    const result =
      await this.#warrantyComponentService.getWarrantyComponentById(id);
    res.status(200).json({
      status: "success",
      data: result,
    });
  };

  updateWarrantyComponent = async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;
    const result = await this.#warrantyComponentService.updateWarrantyComponent(
      id,
      data
    );
    res.status(200).json({
      status: "success",
      data: result,
    });
  };

  deleteWarrantyComponent = async (req, res, next) => {
    const { id } = req.params;
    await this.#warrantyComponentService.deleteWarrantyComponent(id);
    res.status(204).send();
  };
}

export default WarrantyComponentController;
