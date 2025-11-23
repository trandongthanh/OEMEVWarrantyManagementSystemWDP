import dayjs from "dayjs";
import * as xlsx from "xlsx";
import { NotFoundError } from "../error/index.js";

class UserService {
  constructor({ userRepository, taskAssignmentRepository }) {
    this.userRepository = userRepository;
    this.taskAssignmentRepository = taskAssignmentRepository;
  }

  getAllUsers = async ({ filters, currentUser }) => {
    const {
      page = 1,
      limit = 10,
      roleId,
      serviceCenterId,
      companyId,
    } = filters;
    const offset = (page - 1) * limit;

    const queryFilters = { limit, offset, roleId, serviceCenterId, companyId };

    if (currentUser.roleName === "emv_admin") {
      queryFilters.companyId = currentUser.companyId;
    } else if (currentUser.roleName === "service_center_manager") {
      queryFilters.serviceCenterId = currentUser.serviceCenterId;
    }

    const { count, rows } = await this.userRepository.findAndCountAll(
      queryFilters
    );

    return {
      totalItems: count,
      users: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  };

  getAllTechnicians = async ({ status, serviceCenterId }) => {
    const technicians = await this.userRepository.getAllTechnicians({
      status,
      serviceCenterId,
    });

    if (!technicians || technicians.length === 0) {
      return [];
    }

    const technicianIds = technicians.map((tech) => tech.userId);
    const today = dayjs().format("YYYY-MM-DD");

    const taskCounts =
      await this.taskAssignmentRepository.countTasksForTechniciansOnDate({
        technicianIds,
        date: today,
      });

    const taskCountMap = new Map(
      taskCounts.map((count) => [count.technicianId, count.taskCount])
    );

    const techniciansWithTaskCounts = technicians.map((tech) => ({
      ...tech,
      tasksToday: taskCountMap.get(tech.userId) || 0,
    }));

    return techniciansWithTaskCounts;
  };

  getUserById = async (userId) => {
    const user = await this.userRepository.findUserById({ userId });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  };

  updateUser = async (userId, data) => {
    const user = await this.userRepository.findUserById({ userId });
    if (!user) {
      throw new NotFoundError("User not found");
    }




    const updated = await this.userRepository.updateUser({ userId, data });
    if (!updated) {


      return user;
    }

    return await this.userRepository.findUserById({ userId });
  };

  deleteUser = async (userId) => {
    const user = await this.userRepository.findUserById({ userId });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return await this.userRepository.deleteUser(userId);
  };

  exportServiceCenterUsersToExcel = async ({ serviceCenterId }) => {
    const { rows } = await this.userRepository.findAndCountAll({
      serviceCenterId,
      limit: 10000, // Export limit
      offset: 0,
    });

    const data = rows.map((user) => {
      const u = user.toJSON ? user.toJSON() : user;
      return {
        "User ID": u.userId,
        Name: u.name,
        Email: u.email,
        Phone: u.phone,
        Role: u.role?.roleName || "N/A",
        "Created At": dayjs(u.createdAt).format("YYYY-MM-DD HH:mm"),
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Users");

    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
    return buffer;
  };
}

export default UserService;
