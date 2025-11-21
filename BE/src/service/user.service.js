import dayjs from "dayjs";

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
}

export default UserService;
