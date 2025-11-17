import apiClient from "@/lib/apiClient";

export interface NotificationResponse {
  notificationId: string;
  userId: string | null;
  roomName: string;
  eventName: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetNotificationsResponse {
  status: string;
  count: number;
  rows: NotificationResponse[];
}

interface MarkAsReadResponse {
  status: string;
  message: string;
}

/**
 * Get all notifications for the authenticated user
 */
export async function getNotifications(
  page: number = 1,
  limit: number = 20
): Promise<NotificationResponse[]> {
  try {
    const response = await apiClient.get<GetNotificationsResponse>(
      "/notifications",
      {
        params: { page, limit },
      }
    );

    // Handle empty or undefined response
    if (!response.data?.rows) {
      console.warn("No notifications in response, returning empty array");
      return [];
    }

    return response.data.rows;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    await apiClient.patch<MarkAsReadResponse>(
      `/notifications/${notificationId}/read`
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await apiClient.post<MarkAsReadResponse>("/notifications/mark-all-as-read");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}
