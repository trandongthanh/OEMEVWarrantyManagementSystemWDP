import dayjs from "dayjs";

class UserService {
  constructor({ userRepository, taskAssignmentRepository }) {
    this.userRepository = userRepository;
    this.taskAssignmentRepository = taskAssignmentRepository;
  }

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
