class UserController {
  constructor({ userService }) {
    this.userService = userService;
  }

  getAllUsers = async (req, res, next) => {
    const filters = req.query;
    const currentUser = req.user;

    const result = await this.userService.getAllUsers({
      filters,
      currentUser,
    });

    res.status(200).json({
      status: "success",
      data: {
        users: result.users,
      },
      pagination: {
        totalItems: result.totalItems,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      },
    });
  };

  getTechnicians = async (req, res, next) => {
    const { serviceCenterId } = req.user;
    const { status } = req.query;
    const technicians = await this.userService.getAllTechnicians({
      status,
      serviceCenterId,
    });

    res.status(200).json({
      status: "success",
      data: technicians,
    });
  };

  getUserById = async (req, res, next) => {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    res.status(200).json({
      status: "success",
      data: user,
    });
  };

  updateUser = async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;
    const updatedUser = await this.userService.updateUser(id, data);
    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  };

  deleteUser = async (req, res, next) => {
    const { id } = req.params;
    await this.userService.deleteUser(id);
    res.status(204).send();
  };
}

export default UserController;
