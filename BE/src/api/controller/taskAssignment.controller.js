class TaskAssignmentController {
  #taskAssignmentService;

  constructor({ taskAssignmentService }) {
    this.#taskAssignmentService = taskAssignmentService;
  }

  getTaskAssignments = async (req, res, next) => {
    const { serviceCenterId } = req.user;

    const result = await this.#taskAssignmentService.getTaskAssignments({
      serviceCenterId,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  };
}

export default TaskAssignmentController;
