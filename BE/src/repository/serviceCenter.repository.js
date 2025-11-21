import db from "../models/index.cjs";

const { ServiceCenter, VehicleCompany } = db;

class ServiceCenterRepository {
  findServiceCenterWithId = async ({ serviceCenterId }) => {
    const company = await ServiceCenter.findOne({
      where: {
        serviceCenterId: serviceCenterId,
      },

      attributes: [],

      include: [
        {
          model: VehicleCompany,
          as: "vehicleCompany",
          attributes: ["vehicle_company_id"],
        },
      ],
    });

    if (!company) {
      return null;
    }

    return company.toJSON();
  };

  async findServiceCenterById(
    { serviceCenterId },
    transaction = null,
    lock = null
  ) {
    const serviceCenter = await ServiceCenter.findByPk(serviceCenterId, {
      transaction,
      lock,
    });
    return serviceCenter ? serviceCenter.toJSON() : null;
  }
}

export default ServiceCenterRepository;
