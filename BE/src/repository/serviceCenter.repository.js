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

  findAll = async () => {
    const serviceCenters = await ServiceCenter.findAll({
      attributes: [
        "service_center_id",
        "name",
        "address",
        "phone",
        "vehicle_company_id",
      ],
      include: [
        {
          model: VehicleCompany,
          as: "vehicleCompany",
          attributes: ["name"],
        },
      ],
    });
    return serviceCenters.map((sc) => sc.toJSON());
  };
}

export default ServiceCenterRepository;
