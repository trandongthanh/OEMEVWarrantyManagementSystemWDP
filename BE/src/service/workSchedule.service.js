import XLSX from "xlsx";
import dayjs from "dayjs";
import db from "../models/index.cjs";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../error/index.js";

class WorkScheduleService {
  constructor({ workScheduleRepository, userRepository }) {
    this.workScheduleRepository = workScheduleRepository;
    this.userRepository = userRepository;
  }

  async parseExcelFile(fileBuffer, managerId) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!rawData || rawData.length < 2) {
        throw new BadRequestError("File is empty or contains no data rows.");
      }

      const headers = rawData[0].map((h) => h.toString().trim());

      const requiredHeaders = ["employee_code", "work_date", "status"];

      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          throw new BadRequestError(
            `Missing required column in Excel file: ${header}`
          );
        }
      }

      const dataRows = rawData.slice(1);
      const validRecords = [];
      const errors = [];

      const manager = await this.userRepository.findUserById({
        userId: managerId,
      });

      if (!manager || !manager.serviceCenterId) {
        throw new ForbiddenError(
          "Manager does not belong to any service center"
        );
      }

      const employeeCodes = dataRows
        .map((row) => row[headers.indexOf("employee_code")])
        .filter(Boolean);

      const users = await this.userRepository.findUsersByEmployeeCodes(
        employeeCodes
      );

      const userMap = new Map(users.map((user) => [user.employeeCode, user]));

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNumber = i + 2;

        try {
          const employeeCode = row[headers.indexOf("employee_code")];
          const workDate = row[headers.indexOf("work_date")];
          const status = row[headers.indexOf("status")];
          const notes = row[headers.indexOf("notes")] || null;

          if (!employeeCode) {
            errors.push(`Row ${rowNumber}: employee_code is missing.`);
            continue;
          }

          if (!workDate) {
            errors.push(`Row ${rowNumber}: work_date is missing.`);
            continue;
          }

          if (!status) {
            errors.push(`Row ${rowNumber}: status is missing.`);
            continue;
          }

          const validStatuses = ["AVAILABLE", "UNAVAILABLE"];
          const normalizedStatus = status.toString().toUpperCase().trim();

          if (!validStatuses.includes(normalizedStatus)) {
            errors.push(
              `Row ${rowNumber}: Status "${status}" is not valid. Must be AVAILABLE or UNAVAILABLE.`
            );
            continue;
          }

          let formattedDate;
          try {
            if (typeof workDate === "number") {
              const excelDate = XLSX.SSF.parse_date_code(workDate);

              formattedDate = dayjs(
                `${excelDate.y}-${excelDate.m}-${excelDate.d}`
              ).format("YYYY-MM-DD");
            } else {
              formattedDate = dayjs(workDate).format("YYYY-MM-DD");
            }

            if (!dayjs(formattedDate).isValid()) {
              throw new Error("Invalid date format");
            }
          } catch (err) {
            errors.push(`Row ${rowNumber}: work_date format is not valid.`);
            continue;
          }

          const technician = userMap.get(employeeCode.toString());

          if (!technician) {
            errors.push(
              `Row ${rowNumber}: Employee with code "${employeeCode}" not found.`
            );
            continue;
          }

          if (technician.serviceCenterId !== manager.serviceCenterId) {
            errors.push(
              `Row ${rowNumber}: Employee does not belong to your service center.`
            );
            continue;
          }

          validRecords.push({
            technicianId: technician.userId,
            workDate: formattedDate,
            status: normalizedStatus,
            notes: notes ? notes.toString().trim() : null,
          });
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error.message || "Unknown error"}`);
        }
      }

      return {
        validRecords,
        errors,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new BadRequestError(`Error parsing Excel file: ${error.message}`);
    }
  }

  async uploadSchedulesFromExcel({ fileBuffer, managerId }) {
    const { validRecords, errors } = await this.parseExcelFile(
      fileBuffer,
      managerId
    );

    if (validRecords.length === 0) {
      return {
        success: false,
        message: "No valid data to import.",
        data: { errors },
      };
    }

    const transaction = await db.sequelize.transaction();
    try {
      const result = await this.workScheduleRepository.bulkUpsertSchedules(
        validRecords,
        transaction
      );

      await transaction.commit();

      return {
        success: true,
        message: "Schedules imported successfully.",
        data: {
          totalProcessed: validRecords.length,
          created: result.created,
          updated: result.updated,
          errors: errors,
          errorCount: errors.length,
        },
      };
    } catch (error) {
      await transaction.rollback();
      // This is a server error (e.g., database constraint violation)
      throw new ApiError(`Failed to import schedules: ${error.message}`, 500);
    }
  }

  async getSchedules(filters) {
    return await this.workScheduleRepository.findSchedules(filters);
  }

  async getMySchedule({ technicianId, startDate, endDate }) {
    return await this.workScheduleRepository.findSchedulesByTechnician({
      technicianId,
      startDate,
      endDate,
    });
  }

  async getAvailableTechnicians({ workDate, serviceCenterId }) {
    if (!workDate) {
      throw new BadRequestError("workDate is required");
    }

    return await this.workScheduleRepository.findAvailableTechnicians({
      workDate,
      serviceCenterId,
    });
  }

  async updateSchedule({ scheduleId, updateData, managerId }) {
    const schedule = await this.workScheduleRepository.findScheduleById(
      scheduleId
    );

    if (!schedule) {
      throw new NotFoundError("Schedule is not found");
    }

    const manager = await this.userRepository.findUserById({
      userId: managerId,
    });
    const technician = await this.userRepository.findUserById({
      userId: schedule.technicianId,
    });

    if (manager.serviceCenterId !== technician.serviceCenterId) {
      throw new ForbiddenError(
        "You do not have permission to update this schedule"
      );
    }

    if (updateData.status) {
      const validStatuses = ["AVAILABLE", "UNAVAILABLE"];
      if (!validStatuses.includes(updateData.status)) {
        throw new BadRequestError("Status is not valid");
      }
    }

    return await this.workScheduleRepository.updateSchedule(
      scheduleId,
      updateData
    );
  }
}

export default WorkScheduleService;
