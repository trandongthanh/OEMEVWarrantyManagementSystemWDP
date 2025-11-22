class PublicController {
  #publicService;

  constructor({ publicService }) {
    this.#publicService = publicService;
  }

  getTrackingInfo = async (req, res, next) => {
    try {
      const { token } = req.query;
      const trackingInfo = await this.#publicService.getTrackingInfoByToken(
        token
      );

      res.status(200).json({
        status: "success",
        data: trackingInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  getServiceCenters = async (req, res, next) => {
    const serviceCenters = await this.#publicService.getAllServiceCenters();

    res.status(200).json({
      status: "success",
      data: serviceCenters,
    });
  };
}

export default PublicController;
