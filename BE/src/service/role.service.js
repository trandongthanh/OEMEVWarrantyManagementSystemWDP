import { NotFoundError } from "../error/index.js";

class RoleService {
  #roleRepository;

  constructor({ roleRepository }) {
    this.#roleRepository = roleRepository;
  }

  async getAllRoles({ userRole }) {
    const ROLE_SERVICE_CENTER = [
      "service_center_staff",
      "service_center_technician",
      "service_center_manager",
      "parts_coordinator_service_center",
    ];

    if (userRole === "service_center_manager") {
      return await this.#roleRepository.findByNames(ROLE_SERVICE_CENTER);
    }

    if (userRole === "emv_admin") {
      return await this.#roleRepository.findAll();
    }

    return [];
  }

  async getRoleById(roleId) {
    const role = await this.#roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID ${roleId} not found.`);
    }
    return role;
  }
}

export default RoleService;

