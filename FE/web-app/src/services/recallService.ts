import apiClient from "@/lib/apiClient";

/**
 * Recall Campaign Service
 * Handles all recall campaign operations
 *
 * ROLE-BASED ACCESS:
 * - emv_staff: Create, view, update recall campaigns
 */

export interface RecallCampaign {
  recallCampaignId: string;
  name: string;
  description: string;
  issueDate: string;
  issuedByCompanyId: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  affectedVehicleModelIds?: string[];
  affectedVehicleModels?: Array<{
    vehicleModelId: string;
    vehicleModelName: string;
    sku: string;
  }>;
  affectedVehiclesCount?: number;
}

export interface CreateRecallCampaignRequest {
  name: string;
  description: string;
  issueDate: string;
  affectedVehicleModelIds: string[];
}

export interface UpdateRecallCampaignRequest {
  name?: string;
  description?: string;
  issueDate?: string;
}

export interface RecallCampaignListResponse {
  status: "success";
  data: {
    recallCampaigns: RecallCampaign[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface RecallCampaignDetailResponse {
  status: "success";
  data: {
    recallCampaign: RecallCampaign;
  };
}

/**
 * Create a new recall campaign
 * POST /recall-campaigns
 * Role: emv_staff
 */
export async function createRecallCampaign(
  data: CreateRecallCampaignRequest
): Promise<RecallCampaign> {
  try {
    const response = await apiClient.post<RecallCampaignDetailResponse>(
      "/recall-campaigns",
      data
    );

    return response.data.data.recallCampaign;
  } catch (error) {
    console.error("Error creating recall campaign:", error);
    throw error;
  }
}

/**
 * Get list of recall campaigns
 * GET /recall-campaigns
 * Role: emv_staff
 */
export async function getRecallCampaigns(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{
  campaigns: RecallCampaign[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  try {
    const response = await apiClient.get<RecallCampaignListResponse>(
      "/recall-campaigns",
      { params }
    );

    return {
      campaigns: response.data.data.recallCampaigns || [],
      pagination: response.data.data.pagination,
    };
  } catch (error) {
    console.error("Error fetching recall campaigns:", error);
    throw error;
  }
}

/**
 * Get recall campaign by ID
 * GET /recall-campaigns/:id
 * Role: emv_staff
 */
export async function getRecallCampaignById(
  id: string
): Promise<RecallCampaign> {
  try {
    const response = await apiClient.get<RecallCampaignDetailResponse>(
      `/recall-campaigns/${id}`
    );

    return response.data.data.recallCampaign;
  } catch (error) {
    console.error("Error fetching recall campaign:", error);
    throw error;
  }
}

/**
 * Update recall campaign
 * PATCH /recall-campaigns/:id
 * Role: emv_staff
 */
export async function updateRecallCampaign(
  id: string,
  data: UpdateRecallCampaignRequest
): Promise<RecallCampaign> {
  try {
    const response = await apiClient.patch<RecallCampaignDetailResponse>(
      `/recall-campaigns/${id}`,
      data
    );

    return response.data.data.recallCampaign;
  } catch (error) {
    console.error("Error updating recall campaign:", error);
    throw error;
  }
}

/**
 * Activate recall campaign (DRAFT -> ACTIVE)
 * PATCH /recall-campaigns/:id/activate
 * Role: emv_staff
 */
export async function activateRecallCampaign(
  id: string
): Promise<RecallCampaign> {
  try {
    const response = await apiClient.patch<RecallCampaignDetailResponse>(
      `/recall-campaigns/${id}/activate`
    );

    return response.data.data.recallCampaign;
  } catch (error) {
    console.error("Error activating recall campaign:", error);
    throw error;
  }
}

export interface NotifyRecallOwnersRequest {
  recallCampaignId: string;
  vehicleVins: string[];
}

export interface NotifyRecallOwnersResponse {
  status: "success";
  data: {
    notifiedCount: number;
  };
}

/**
 * Notify recall owners at service center
 * POST /service-centers/:serviceCenterId/notify-recall-owners
 * Role: service_center_manager
 */
export async function notifyRecallOwners(
  serviceCenterId: string,
  data: NotifyRecallOwnersRequest
): Promise<{ notifiedCount: number }> {
  try {
    const response = await apiClient.post<NotifyRecallOwnersResponse>(
      `/service-centers/${serviceCenterId}/notify-recall-owners`,
      data
    );

    return response.data.data;
  } catch (error) {
    console.error("Error notifying recall owners:", error);
    throw error;
  }
}

const recallService = {
  createRecallCampaign,
  getRecallCampaigns,
  getRecallCampaignById,
  updateRecallCampaign,
  activateRecallCampaign,
  notifyRecallOwners,
};

export default recallService;
