import apiClient from "@/lib/apiClient";

export interface ServiceCenter {
  serviceCenterId: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  vehicleCompanyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceCentersResponse {
  serviceCenters: ServiceCenter[];
  total: number;
}

/**
 * Get all service centers for the company
 * Uses the warehouses endpoint to extract service center info
 */
export const getServiceCenters = async (): Promise<ServiceCenter[]> => {
  try {
    // Get warehouses which contain service center information
    const response = await apiClient.get<{
      status: string;
      data: {
        warehouses: Array<{
          warehouseId: string;
          serviceCenterId: string | null;
          serviceCenter?: {
            serviceCenterId: string;
            name: string;
            address: string;
            phone?: string;
            email?: string;
          };
        }>;
      };
    }>("/warehouses");

    // Extract unique service centers from warehouses
    const serviceCenters: ServiceCenter[] = [];
    const seenIds = new Set<string>();

    response.data.data.warehouses.forEach((warehouse) => {
      if (
        warehouse.serviceCenter &&
        !seenIds.has(warehouse.serviceCenter.serviceCenterId)
      ) {
        seenIds.add(warehouse.serviceCenter.serviceCenterId);
        serviceCenters.push({
          serviceCenterId: warehouse.serviceCenter.serviceCenterId,
          name: warehouse.serviceCenter.name,
          address: warehouse.serviceCenter.address,
          phone: warehouse.serviceCenter.phone,
          email: warehouse.serviceCenter.email,
        });
      }
    });

    return serviceCenters;
  } catch (error) {
    console.error("Error fetching service centers:", error);
    throw error;
  }
};

/**
 * Get a single service center by ID from warehouses
 */
export const getServiceCenterById = async (
  serviceCenterId: string
): Promise<ServiceCenter | null> => {
  try {
    const serviceCenters = await getServiceCenters();
    return (
      serviceCenters.find((sc) => sc.serviceCenterId === serviceCenterId) ||
      null
    );
  } catch (error) {
    console.error("Error fetching service center:", error);
    throw error;
  }
};

export const serviceCenterService = {
  getServiceCenters,
  getServiceCenterById,
};

export default serviceCenterService;
