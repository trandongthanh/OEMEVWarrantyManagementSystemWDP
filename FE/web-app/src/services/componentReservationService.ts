import apiClient from "@/lib/apiClient";

/**
 * Component Reservation Service
 *
 * Handles the component lifecycle during repair:
 * 1. Pickup: Parts coordinator picks up from warehouse (RESERVED → PICKED_UP)
 * 2. Install: Technician installs on vehicle (PICKED_UP → INSTALLED)
 * 3. Return: Parts coordinator returns old component (INSTALLED → RETURNED)
 *
 * ROLE-BASED ACCESS:
 * - parts_coordinator_service_center: pickup, return
 * - service_center_technician: installComponent
 */

export interface ComponentReservation {
  reservationId: string;
  caselineId: string;
  stockId: string;
  warehouseId: string;
  componentId: string;
  quantityReserved: number;
  status: "RESERVED" | "PICKED_UP" | "INSTALLED" | "RETURNED";
  pickedUpBy?: string | null;
  pickedUpAt?: string | null;
  installedAt?: string | null;
  oldComponentSerial?: string | null;
  oldComponentReturned?: boolean;
  returnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  component?: {
    componentId: string;
    serialNumber: string;
    status: string;
    vehicleVin?: string | null;
  };
  caseLine?: {
    id: string;
    status: string;
  };
  warehouse?: {
    warehouseId: string;
    warehouseName: string;
  };
}

export interface PickupResponse {
  status: "success";
  data: {
    reservation: ComponentReservation;
    component: {
      componentId: string;
      serialNumber: string;
      status: string;
    };
    caseLine: {
      id: string;
      status: string;
    };
  };
}

export interface InstallComponentResponse {
  status: "success";
  data: {
    reservation: ComponentReservation;
    component: {
      componentId: string;
      serialNumber: string;
      status: string;
      vehicleVin: string;
      installedAt: string;
    };
  };
}

export interface ReturnComponentRequest {
  serialNumber: string;
}

export interface ReturnComponentResponse {
  status: "success";
  data: {
    reservation: ComponentReservation;
    component: {
      componentId: string;
      serialNumber: string;
      status: string;
    };
  };
}

class ComponentReservationService {
  /**
   * Pickup reserved components from warehouse
   * PATCH /component-reservations/{reservationId}/pickup
   *
   * Updates:
   * - Reservation: RESERVED → PICKED_UP
   * - Component: status → WITH_TECHNICIAN
   * - CaseLine: READY_FOR_REPAIR → IN_REPAIR (if first pickup)
   *
   * @role parts_coordinator_service_center
   */
  async pickupComponent(
    reservationId: string,
    pickedUpByTechId: string
  ): Promise<PickupResponse> {
    try {
      const response = await apiClient.patch(
        `/component-reservations/${reservationId}/pickup`,
        { pickedUpByTechId }
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error picking up component:", error);
      throw error;
    }
  }

  /**
   * Install component on vehicle
   * PATCH /component-reservations/{reservationId}/installComponent
   *
   * Updates:
   * - Reservation: PICKED_UP → INSTALLED
   * - Component: status → INSTALLED, links to vehicle VIN
   *
   * @role service_center_technician
   */
  async installComponent(
    reservationId: string
  ): Promise<InstallComponentResponse> {
    try {
      const response = await apiClient.patch(
        `/component-reservations/${reservationId}/installComponent`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error installing component:", error);
      throw error;
    }
  }

  /**
   * Return old component after replacement
   * PATCH /component-reservations/{reservationId}/return
   *
   * Updates:
   * - Reservation: INSTALLED → RETURNED
   * - Old component: marked as RETURNED
   *
   * @role parts_coordinator_service_center
   */
  async returnComponent(
    reservationId: string,
    data: ReturnComponentRequest
  ): Promise<ReturnComponentResponse> {
    try {
      const response = await apiClient.patch(
        `/component-reservations/${reservationId}/return`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error returning component:", error);
      throw error;
    }
  }

  /**
   * Get component reservation details
   * GET /component-reservations/{reservationId}
   *
   * Note: This endpoint might not exist in backend yet,
   * but useful for tracking reservation status
   */
  async getReservationById(reservationId: string): Promise<{
    status: "success";
    data: { reservation: ComponentReservation };
  }> {
    try {
      const response = await apiClient.get(
        `/component-reservations/${reservationId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching reservation details:", error);
      throw error;
    }
  }
}

const componentReservationService = new ComponentReservationService();
export default componentReservationService;
