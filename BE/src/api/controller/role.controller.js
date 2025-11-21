class RoleController {
  #roleService;

  constructor({ roleService }) {
    this.#roleService = roleService;
  }

  getAllRoles = async (req, res, next) => {
    const { roleName: userRole } = req.user;

    const roles = await this.#roleService.getAllRoles({ userRole });

    res.status(200).json({
      status: "success",
      data: roles,
    });
  };

  getRoleById = async (req, res, next) => {
    const { id } = req.params;
    const role = await this.#roleService.getRoleById(id);
    res.status(200).json({
      status: "success",
      data: role,
    });
  };
}

export default RoleController;
