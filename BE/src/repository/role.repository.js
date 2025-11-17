import db from "../models/index.cjs";
const { Role, Sequelize } = db;
const { Op } = Sequelize;

class RoleRepository {
  async findAll() {
    const roles = await Role.findAll({
      attributes: ["roleId", "roleName"],
    });
    return roles.map((role) => role.toJSON());
  }

  async findById(roleId) {
    const role = await Role.findByPk(roleId, {
      attributes: ["roleId", "roleName"],
    });
    return role ? role.toJSON() : null;
  }

  async findByNames(names) {
    const roles = await Role.findAll({
      where: {
        roleName: {
          [Op.in]: names,
        },
      },

      attributes: ["roleId", "roleName"],
    });
    return roles.map((role) => role.toJSON());
  }
}

export default RoleRepository;
