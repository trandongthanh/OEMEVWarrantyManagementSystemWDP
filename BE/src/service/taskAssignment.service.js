import { ForbiddenError } from "../error/index.js";

class TaskAssignmentService {
  #taskAssignmentRepository;

  constructor({ taskAssignmentRepository }) {
    this.#taskAssignmentRepository = taskAssignmentRepository;
  }

  getTaskAssignments = async ({ serviceCenterId }) => {
    if (!serviceCenterId) {
      throw new ForbiddenError(
        "Service center context is required to view task assignments"
      );
    }

    const tasks = await this.#taskAssignmentRepository.findAllByServiceCenterId(
      {
        serviceCenterId,
      }
    );

    return { tasks };
  };
}

export default TaskAssignmentService;
