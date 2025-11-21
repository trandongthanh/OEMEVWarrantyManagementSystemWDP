/**
 * Notification types and interfaces
 */

export type NotificationType =
  | "case_assigned"
  | "case_updated"
  | "case_completed"
  | "stock_transfer_request"
  | "stock_transfer_approved"
  | "stock_transfer_rejected"
  | "component_reserved"
  | "new_message"
  | "appointment_scheduled"
  | "appointment_reminder"
  | "system_alert"
  | "general";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, unknown>;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
}

export interface NotificationSocketData {
  notificationId?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  timestamp?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
}
