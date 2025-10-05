import { BadRequestError } from "../error";

class WarehouseService {
  constructor({ warehouseRepository }) {
    this.warehouseRepository = warehouseRepository;
  }

  getQuantityTypeComponentInStock = async ({
    serviceCenterId,
    vehicleProcessingRecordId,
  }) => {
    if (!serviceCenterId || !typeComponentId || !vehicleProcessingRecordId) {
      throw new BadRequestError(
        "serviceCenterId, typeComponentId, vehicleProcessingRecordId is required"
      );
    }
  };
}

export default WarehouseService;
