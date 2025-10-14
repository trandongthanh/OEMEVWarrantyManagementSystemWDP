import apiClient from "@/lib/apiClient";

/**
 * User Service
 * Handles user-related API calls
 */

export interface User {
  userId: string;
  username: string;
  email: string;
  phone: string;
  name: string;
  address: string;
  roleId: string;
  serviceCenterId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  email: string;
  phone: string;
  name: string;
  address: string;
  roleId: string;
  serviceCenterId?: string;
}

export interface Technician {
  userId: string;
  name: string;
  activeTaskCount: number;
  workSchedule?: {
    workDate: string;
    status: "WORKING" | "DAY_OFF" | "LEAVE_REQUESTED" | "LEAVE_APPROVED";
  };
}

/**
 * Create a new user (Admin only)
 * @param userData - User creation data
 * @returns Created user
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const response = await apiClient.post<{
      status: string;
      data: { newUser: User };
    }>("/users", userData);
    return response.data.data.newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Get all technicians with their availability and workload (Manager only)
 * @param status - Optional filter by work status
 * @returns List of technicians
 */
export const getTechnicians = async (
  status?: "WORKING" | "DAY_OFF" | "LEAVE_REQUESTED" | "LEAVE_APPROVED"
): Promise<Technician[]> => {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get<{
      status: string;
      data: Technician[];
    }>("/users/technicians", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    throw error;
  }
};

/**
 * User service object
 */
export const userService = {
  createUser,
  getTechnicians,
};

export default userService;
