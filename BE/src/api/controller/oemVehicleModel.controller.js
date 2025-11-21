class OemVehicleModelController {
  #oemVehicleModelService;
  constructor({ oemVehicleModelService }) {
    this.#oemVehicleModelService = oemVehicleModelService;
  }

  createVehicleModel = async (req, res) => {
    const {
      vehicleModelName,
      sku,
      yearOfLaunch,
      placeOfManufacture,
      generalWarrantyDuration,
      generalWarrantyMileage,
    } = req.body;

    const { companyId } = req;

    const result = await this.#oemVehicleModelService.createVehicleModel({
      vehicleModelName,
      sku,
      yearOfLaunch,
      placeOfManufacture,
      generalWarrantyDuration,
      generalWarrantyMileage,
      companyId,
    });

    res.status(201).json({
      status: "success",
      data: result,
    });
  };

  getMostProblematicModels = async (req, res) => {
    const { companyId } = req;
    const { startDate, endDate, limit } = req.query;

    const results = await this.#oemVehicleModelService.getMostProblematicModels(
      {
        companyId,
        startDate,
        endDate,
        limit,
      }
    );

    res.status(200).json({
      status: "success",
      data: results,
    });
  };
}

export default OemVehicleModelController;
