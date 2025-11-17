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
}

export default WarrantyComponentController;
