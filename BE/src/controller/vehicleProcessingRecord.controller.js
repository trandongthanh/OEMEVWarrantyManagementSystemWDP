class VehicleProcessingRecordController {
  constructor({ vehicleProcessingRecordService }) {
    this.vehicleProcessingRecordService = vehicleProcessingRecordService;
  }

  createRecord = async (req, res) => {
    const { odometer, guaranteeCases } = req.body;

    const { vin } = req.params;

    const createdByStaffId = req.user.userId;

    const newRecord = await this.vehicleProcessingRecordService.createRecord({
      odometer,
      createdByStaffId,
      vin: vin,
      guaranteeCases,
      serviceCenterId: req.user.serviceCenterId,
    });

    res.status(201).json({
      status: "success",
      data: newRecord,
    });
  };

  updateMainTechnician = async (req, res) => {
    const { vehicleProcessingRecordId, technicianId } = req.body;

    const updatedRecord =
      await this.vehicleProcessingRecordService.updateMainTechnician({
        vehicleProcessingRecordId,
        technicianId,
      });

    res.status(201).json({
      status: "success",
      data: { updatedRecord },
    });
  };

  findByIdWithDetails = async (req, res, next) => {
    const { userId } = req.user;

    const { id } = req.params;

    const record =
      await this.vehicleProcessingRecordService.findByIdWithDetails({
        id: id,
        userId: userId,
      });

    res.status(200).json({
      status: "success",
      data: {
        record,
      },
    });
  };
}
export default VehicleProcessingRecordController;
