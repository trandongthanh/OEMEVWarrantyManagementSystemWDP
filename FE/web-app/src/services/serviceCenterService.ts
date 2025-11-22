import apiClient from "@/lib/apiClient";
import axios from "axios";

export interface ServiceCenter {
  serviceCenterId: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  vehicleCompanyId?: string;
  vehicleCompany?: {
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceCentersResponse {
  serviceCenters: ServiceCenter[];
  total: number;
}

/**
 * Get all service centers using the public API endpoint (for guest users)
 * This endpoint does not require authentication
 */
export const getPublicServiceCenters = async (): Promise<ServiceCenter[]> => {
  try {
    // Use axios directly for the public endpoint since it's at /api/public (not /api/v1)
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://dongthanh.space/api/v1";
    const publicUrl = baseUrl.replace("/api/v1", "/api/public");

    const response = await axios.get<{
      status: string;
      data: Array<{
        service_center_id: string;
        name: string;
        address: string;
        phone: string;
        vehicle_company_id: string;
        vehicleCompany?: {
          name: string;
        };
      }>;
    }>(`${publicUrl}/service-centers`);

    // Map the backend response to our ServiceCenter interface
    const serviceCenters: ServiceCenter[] = response.data.data.map((sc) => ({
      serviceCenterId: sc.service_center_id,
      name: sc.name,
      address: sc.address,
      phone: sc.phone,
      vehicleCompanyId: sc.vehicle_company_id,
      vehicleCompany: sc.vehicleCompany,
    }));

    return serviceCenters;
  } catch (error) {
    console.error("Error fetching public service centers:", error);
    throw error;
  }
};

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
  getPublicServiceCenters,
};

export default serviceCenterService;
