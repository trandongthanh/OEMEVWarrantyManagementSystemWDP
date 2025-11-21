class ComponentReservationsController {
  #componentReservationService;
  constructor({ componentReservationService }) {
    this.#componentReservationService = componentReservationService;
  }

  getComponentReservations = async (req, res, next) => {
    const {
      page,
      limit,
      status,
      warehouseId,
      typeComponentId,
      caseLineId,
      guaranteeCaseId,
      vehicleProcessingRecordId,
      repairTechId,
      repairTechPhone,
      sortBy,
      sortOrder,
    } = req.query;

    const { serviceCenterId } = req.user;

    const result =
      await this.#componentReservationService.getComponentReservations({
        page,
        limit,
        status,
        warehouseId,
        typeComponentId,
        caseLineId,
        guaranteeCaseId,
        vehicleProcessingRecordId,
        repairTechId,
        repairTechPhone,
        sortBy,
        sortOrder,
        serviceCenterId,
      });

    res.status(200).json({
      status: "success",
      data: result,
    });
  };

  pickupReservedComponents = async (req, res, next) => {
    const { serviceCenterId } = req.user;

    const { reservationIds, pickedUpByTechId } = req.body;

    const updatedReservations =
      await this.#componentReservationService.pickupReservedComponents({
        reservationIds,
        serviceCenterId,
        pickedUpByTechId,
      });

    res.status(200).json({
      status: "success",
      data: {
        reservations: updatedReservations,
      },
    });
  };

  installComponent = async (req, res, next) => {
    const { reservationId } = req.params;
    const { serviceCenterId } = req.user;

    const updatedComponent =
      await this.#componentReservationService.installComponent({
        reservationId,
        serviceCenterId,
      });

    res.status(200).json({
      status: "success",
      data: {
        component: updatedComponent,
      },
    });
  };
}

export default ComponentReservationsController;
