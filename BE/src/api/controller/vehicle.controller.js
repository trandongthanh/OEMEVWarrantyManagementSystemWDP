import xlsx from "xlsx";
import { BadRequestError } from "../../error/index.js";
class VehicleController {
  #vehicleService;
  #vehicleProcessingRecordService;
  constructor({ vehicleService, vehicleProcessingRecordService }) {
    this.#vehicleService = vehicleService;
    this.#vehicleProcessingRecordService = vehicleProcessingRecordService;
  }

  getBulkCreateTemplate = async (req, res, next) => {
    try {
      const workbook = xlsx.utils.book_new();

      const templateRows = [
        ["vin", "model_sku", "date_of_manufacture", "place_of_manufacture"],
        ["VF8VIN0012345678", "VF8-STD-2024", "2022-07-15", "Viet Nam"],
        ["VF9VIN0012345679", "VF9-PLUS-2024", "2023-03-20", "Viet Nam"],
      ].map((row) => row.slice(0, 4));

      const worksheet = xlsx.utils.aoa_to_sheet(templateRows);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

      const buffer = xlsx.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=vehicles_bulk_create_template.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.status(200).send(buffer);
    } catch (error) {
      return next(error);
    }
  };

  bulkCreateFromExcel = async (req, res, next) => {
    if (!req.file) {
      throw new BadRequestError("No Excel file uploaded.");
    }

    const { companyId } = req;
    const result = await this.#vehicleService.bulkCreateFromExcel(
      req.file.buffer,
      companyId
    );

    res.status(201).json({
      status: "success",
      data: result,
    });
  };

  getVehicle = async (req, res, next) => {
    const { vin } = req.params;

    const { companyId } = req;

    const vehicle = await this.#vehicleService.getVehicleProfile({
      vin: vin,
      companyId: companyId,
    });

    if (!vehicle) {
      return res.status(404).json({
        status: "error",
        message: `Cannot find vehicle with this vin: ${vin}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        vehicle: vehicle,
      },
    });
  };

  assignOwnerToVehicle = async (req, res, next) => {
    const {
      customer,
      customerId: ownerId,
      dateOfManufacture,
      licensePlate,
      purchaseDate,
    } = req.body;

    const { vin } = req.params;

    const { companyId } = req;

    const updatedVehicle = await this.#vehicleService.registerOwnerForVehicle({
      customer: customer,
      vin: vin,
      ownerId: ownerId,
      companyId: companyId,
      dateOfManufacture: dateOfManufacture,
      licensePlate: licensePlate,
      purchaseDate: purchaseDate,
    });

    res.status(200).json({
      status: "success",
      data: updatedVehicle,
    });
  };

  findVehicleByVinWithWarranty = async (req, res, next) => {
    const { vin } = req.params;

    const { companyId } = req;

    const { odometer, categories } = req.query;

    const existingVehicle =
      await this.#vehicleService.findVehicleByVinWithWarranty({
        vin: vin,
        companyId: companyId,
        odometer: odometer,
        categories,
      });

    if (!existingVehicle) {
      return res.status(404).json({
        status: "success",
        message: `Cannot check warranty for vehicle with this VIN: ${vin} because this vehicle don't have owner`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        vehicle: existingVehicle,
      },
    });
  };

  findVehicleByVinWithWarrantyPreview = async (req, res, next) => {
    const { vin } = req.params;

    const { companyId } = req;

    const { odometer, purchaseDate, categories } = req.body;

    const vehicle =
      await this.#vehicleService.findVehicleByVinWithWarrantyPreview({
        vin: vin,
        companyId: companyId,
        odometer: odometer,
        purchaseDate: purchaseDate,
        categories,
      });

    if (!vehicle) {
      return res.status(404).json({
        status: "success",
        message: `Cannot find vehicle with this VIN: ${vin}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        vehicle: vehicle,
      },
    });
  };

  getVehicleComponents = async (req, res, next) => {
    try {
      const { vin } = req.params;
      const { status = "INSTALLED" } = req.query;
      const { companyId } = req;

      const componentsData = await this.#vehicleService.getVehicleComponents({
        vin,
        companyId,
        status: status,
      });

      if (!componentsData) {
        return res.status(404).json({
          status: "error",
          message: `Vehicle not found`,
        });
      }

      return res.status(200).json({
        status: "success",
        data: componentsData,
      });
    } catch (error) {
      next(error);
    }
  };

  getServiceHistory = async (req, res, next) => {
    try {
      const { vin } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const { companyId } = req;

      const serviceHistory =
        await this.#vehicleProcessingRecordService.getServiceHistory({
          vin,
          companyId,
          page: parseInt(page),
          limit: parseInt(limit),
          statusFilter: status,
        });

      if (!serviceHistory) {
        return res.status(404).json({
          status: "error",
          message: `Vehicle not found`,
        });
      }

      return res.status(200).json({
        status: "success",
        data: serviceHistory,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default VehicleController;
