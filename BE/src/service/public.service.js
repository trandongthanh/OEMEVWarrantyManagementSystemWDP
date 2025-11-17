import { NotFoundError } from "../error/index.js";

class PublicService {
  #vehicleProcessingRecordRepository;

  constructor({ vehicleProcessingRecordRepository }) {
    this.#vehicleProcessingRecordRepository = vehicleProcessingRecordRepository;
  }

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
