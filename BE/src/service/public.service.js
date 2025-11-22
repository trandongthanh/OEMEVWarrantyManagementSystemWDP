import { NotFoundError } from "../error/index.js";

class PublicService {
  #vehicleProcessingRecordRepository;
  #serviceCenterRepository;

  constructor({
    vehicleProcessingRecordRepository,
    serviceCenterRepository,
  }) {
    this.#vehicleProcessingRecordRepository = vehicleProcessingRecordRepository;
    this.#serviceCenterRepository = serviceCenterRepository;
  }

  getAllServiceCenters = async () => {
    const serviceCenters = await this.#serviceCenterRepository.findAll();
    return serviceCenters;
  };

  getTrackingInfoByToken = async (token) => {
    if (!token) {
      throw new NotFoundError("Tracking token is required.");
    }

    const record =
      await this.#vehicleProcessingRecordRepository.findByTrackingToken(token);

    if (!record) {
      throw new NotFoundError("No service record found for this token.");
    }

    return record;
  };
}

export default PublicService;
