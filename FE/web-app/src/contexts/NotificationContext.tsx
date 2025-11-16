"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type {
  Notification,
  NotificationSocketData,
  NotificationType,
  NotificationPriority,
} from "@/types/notification";
// CRITICAL FIX: Use dynamic import for socket to prevent bundling issues
// DO NOT import socket functions at top level
// Import authService directly to avoid barrel export chunk bundling
import authService from "@/services/authService";
import {
  getNotifications as fetchNotifications,
  markNotificationAsRead as markNotificationAsReadAPI,
  markAllNotificationsAsRead as markAllNotificationsAsReadAPI,
  type NotificationResponse,
} from "@/services/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: NotificationSocketData) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load initial notifications from backend
  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    setIsLoading(true);
    fetchNotifications(1, 50)
      .then((backendNotifications) => {
        // Convert backend format to frontend format
        const convertedNotifications: Notification[] = backendNotifications.map(
          (n: NotificationResponse) => {
            // Generate title and message based on eventName if not provided
            let title = (n.data?.title as string) || "Notification";
            let message = (n.data?.message as string) || "";
            let type: NotificationType =
              (n.data?.type as NotificationType) || "general";
            let priority: NotificationPriority =
              (n.data?.priority as NotificationPriority) || "medium";
            let navigationAction = n.data?.navigationAction as string;

            // Map eventName to user-friendly notifications
            if (!n.data?.title) {
              switch (n.eventName) {
                case "vehicleProcessingRecordStatusUpdated":
                  const status = n.data?.status as string;
                  const record = n.data?.record as Record<string, unknown>;
                  const vin =
                    (record?.vin as string) ||
                    n.data?.vehicleProcessingRecordId;

                  if (status === "WAITING_CUSTOMER_APPROVAL") {
                    type = "case_updated";
                    priority = "high";
                    title = "Case Awaiting Customer Approval";
                    message = `Vehicle ${vin} diagnosis completed and awaiting customer approval`;
                  } else if (status === "PROCESSING") {
                    type = "case_updated";
                    priority = "medium";
                    title = "Case Processing";
                    message = `Vehicle ${vin} is being processed`;
                  } else if (status === "READY_FOR_PICKUP") {
                    type = "case_updated";
                    priority = "high";
                    title = "Vehicle Ready for Pickup";
                    message = `Vehicle ${vin} repair completed and ready for pickup`;
                  } else if (status === "PROCESSING") {
                    type = "case_updated";
                    priority = "medium";
                    title = "Case In Progress";
                    message = `Vehicle ${vin} is now being processed`;
                  } else if (status === "READY_FOR_PICKUP") {
                    type = "case_updated";
                    priority = "high";
                    title = "Vehicle Ready for Pickup";
                    message = `Vehicle ${vin} is ready for customer pickup`;
                  } else if (status === "CANCELLED") {
                    type = "system_alert";
                    priority = "medium";
                    title = "Case Cancelled";
                    message = `Vehicle processing record ${vin} has been cancelled`;
                  } else {
                    type = "case_updated";
                    priority = "medium";
                    title = "Case Status Updated";
                    message = `Vehicle ${vin} status changed to ${status}`;
                  }
                  navigationAction = "cases";
                  break;

                case "newRepairTaskAssigned":
                  type = "case_assigned";
                  priority = "high";
                  title = "New Repair Task Assigned";
                  message = "You have been assigned a new repair task";
                  navigationAction = "tasks";
                  break;

                case "stock_transfer_request_approved":
                  type = "stock_transfer_approved";
                  priority = "high";
                  title = "Stock Transfer Approved";
                  const requestId1 = n.data?.requestId as string;
                  message = `Stock transfer request #${String(requestId1).slice(
                    0,
                    8
                  )} has been approved`;
                  navigationAction = "stock-transfers";
                  break;

                case "stock_transfer_request_shipped":
                  type = "stock_transfer_request";
                  priority = "medium";
                  title = "Stock Transfer Shipped";
                  const requestId2 = n.data?.requestId as string;
                  message = `Stock transfer request #${String(requestId2).slice(
                    0,
                    8
                  )} has been shipped`;
                  navigationAction = "stock-transfers";
                  break;

                case "stock_transfer_request_received":
                  type = "stock_transfer_approved";
                  priority = "medium";
                  title = "Stock Transfer Received";
                  const requestId3 = n.data?.requestId as string;
                  message = `Stock transfer request #${String(requestId3).slice(
                    0,
                    8
                  )} has been received`;
                  navigationAction = "stock-transfers";
                  break;

                case "stock_transfer_request_rejected":
                  type = "stock_transfer_rejected";
                  priority = "high";
                  title = "Stock Transfer Rejected";
                  const requestId4 = n.data?.requestId as string;
                  const reason =
                    n.data?.rejectionReason || "No reason provided";
                  message = `Stock transfer request #${String(requestId4).slice(
                    0,
                    8
                  )} was rejected: ${reason}`;
                  navigationAction = "stock-transfers";
                  break;

                case "newConversation":
                  type = "new_message";
                  priority = "medium";
                  title = "New Conversation";
                  message = "You have a new conversation";
                  navigationAction = "chat-support";
                  break;

                case "inventory_adjustment_created":
                  type = "system_alert";
                  priority = "medium";
                  const adjustmentType = n.data?.adjustmentType as string;
                  const quantity = n.data?.quantity as number;
                  const adjustReason = n.data?.reason as string;
                  title = `Inventory ${
                    adjustmentType === "IN" ? "Added" : "Removed"
                  }`;
                  message = `${quantity} item(s) ${
                    adjustmentType === "IN" ? "added to" : "removed from"
                  } inventory. Reason: ${adjustReason}`;
                  navigationAction = "inventory";
                  break;

                case "low_stock_alert":
                  type = "system_alert";
                  priority = "high";
                  title = "Low Stock Alert";
                  const stocks =
                    (n.data?.stocks as Record<string, unknown>[]) || [];
                  message = `${stocks.length} item(s) are running low on stock`;
                  navigationAction = "inventory";
                  break;
              }
            }

            return {
              id: n.notificationId,
              type,
              priority,
              title,
              message,
              timestamp: n.createdAt,
              read: n.isRead,
              actionUrl: n.data?.actionUrl as string,
              data: {
                ...n.data,
                navigationAction: navigationAction || n.data?.navigationAction,
              },
              senderId: n.data?.senderId as string,
              senderName: n.data?.senderName as string,
              senderRole: n.data?.senderRole as string,
            };
          }
        );
        setNotifications(convertedNotifications);
        console.log(
          `✅ Loaded ${convertedNotifications.length} notifications from backend`
        );
      })
      .catch((error) => {
        console.error("❌ Failed to load notifications:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Add a new notification
  const addNotification = useCallback(
    (notificationData: NotificationSocketData) => {
      const notification: Notification = {
        id:
          notificationData.notificationId ||
          `notif-${Date.now()}-${Math.random()}`,
        type: notificationData.type,
        priority: notificationData.priority || "medium",
        title: notificationData.title,
        message: notificationData.message,
        timestamp: notificationData.timestamp || new Date().toISOString(),
        read: false,
        actionUrl: notificationData.actionUrl,
        data: notificationData.data,
        senderId: notificationData.senderId,
        senderName: notificationData.senderName,
        senderRole: notificationData.senderRole,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Show browser notification if permission granted
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      }
    },
    []
  );

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    console.log("🔄 markAsRead called for:", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Sync with backend (ignore 404 if already read)
    markNotificationAsReadAPI(notificationId)
      .then(() => {
        console.log("✅ Backend confirmed mark as read:", notificationId);
      })
      .catch((error) => {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 404) {
          console.error("❌ Failed to mark notification as read:", error);
        } else {
          console.log("ℹ️ 404 response (already read or not found)");
        }
        // 404 means already read or not found - UI already updated, ignore
      });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Sync with backend
    markAllNotificationsAsReadAPI().catch((error) => {
      console.error("❌ Failed to mark all notifications as read:", error);
    });
  }, []);

  // Clear a specific notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    // Only initialize if user is authenticated
    const token = authService.getToken();
    if (!token) {
      console.log(
        "❌ No auth token found, skipping notification socket initialization"
      );
      return;
    }

    // CRITICAL: Wait for Socket.IO CDN to be confirmed loaded
    if (typeof window !== "undefined" && !window.__SOCKET_IO_LOADED__) {
      console.log(
        "⏳ Waiting for Socket.IO CDN to load before initializing notifications..."
      );

      // Check every 100ms for up to 15 seconds
      let attempts = 0;
      const maxAttempts = 150;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.__SOCKET_IO_LOADED__) {
          clearInterval(checkInterval);
          console.log(
            "✅ Socket.IO CDN confirmed loaded, initializing notifications"
          );
          initSocket();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error(
            "❌ Socket.IO CDN failed to load, notifications disabled"
          );
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    console.log("🔔 Initializing notification socket...");

    // Use async function to handle promise
    const initSocket = async () => {
      try {
        // CRITICAL: Dynamic import to prevent socket code from loading prematurely
        const { initializeNotificationSocket } = await import("@/lib/socket");

        const socket = await initializeNotificationSocket(token);

        socket.on("connect", () => {
          console.log("✅ Notification socket connected");
          setIsConnected(true);
        });

        socket.on("disconnect", () => {
          console.log("❌ Notification socket disconnected");
          setIsConnected(false);
        });

        // Listen for notification events from backend
        socket.on("notification", (data: NotificationSocketData) => {
          console.log("🔔 New notification received:", data);
          addNotification(data);
        });

        // Listen for case assignment notifications
        socket.on("caseAssigned", (data: NotificationSocketData) => {
          console.log("📋 Case assigned notification:", data);
          addNotification({
            ...data,
            type: "case_assigned",
            priority: "high",
          });
        });

        // Listen for stock transfer notifications
        socket.on("stockTransferRequest", (data: NotificationSocketData) => {
          console.log("📦 Stock transfer request:", data);
          addNotification({
            ...data,
            type: "stock_transfer_request",
            priority: "medium",
          });
        });

        // Listen for case update notifications
        socket.on("caseUpdated", (data: NotificationSocketData) => {
          console.log("🔄 Case updated notification:", data);
          addNotification({
            ...data,
            type: "case_updated",
            priority: "medium",
          });
        });

        // Listen for appointment notifications
        socket.on("appointmentScheduled", (data: NotificationSocketData) => {
          console.log("📅 Appointment scheduled:", data);
          addNotification({
            ...data,
            type: "appointment_scheduled",
            priority: "high",
          });
        });

        // ========== BACKEND SOCKET EVENTS ==========
        //
        // Navigation System:
        // - Instead of hardcoded URLs, we pass `navigationAction` in data
        // - Dashboard components receive `onNavigate` callback prop
        // - When notification is clicked, it calls onNavigate(navigationAction)
        // - This changes the active nav state in the dashboard (e.g., "transfers", "tasks")
        //
        // Navigation Action Mapping by Role:
        // - Manager: "transfers", "tasks", "cases", "schedules", "warehouse"
        // - Staff: "stock-transfers", "cases", "chat-support"
        // - Technician: "tasks", "schedule"
        // - EMV Staff: "transfer-requests", "dashboard"
        //
        // Data Structure:
        // - All notifications include relevant IDs (requestId, taskId, caseId, etc.)
        // - Backend sends: { requestId, sentAt, ... }
        // - Frontend adds: { navigationAction, ...ids }
        // ==========================================================

        // New repair task assigned to technician
        socket.on("newRepairTaskAssigned", (data: Record<string, unknown>) => {
          console.log("🔧 New repair task assigned:", data);
          const taskId = data.taskId || data.id;
          addNotification({
            type: "case_assigned",
            priority: "high",
            title: "New Repair Task Assigned",
            message: `You have been assigned a new repair task`,
            timestamp: (data.sentAt as string) || new Date().toISOString(),
            data: {
              ...data,
              navigationAction: "tasks",
              taskId: taskId,
            },
          });
        });

        // Vehicle processing record status updated
        socket.on(
          "vehicleProcessingRecordStatusUpdated",
          (data: Record<string, unknown>) => {
            console.log("📋 Vehicle processing record updated:", data);
            const recordId = data.vehicleProcessingRecordId || data.id;
            addNotification({
              type: "case_updated",
              priority: "medium",
              title: "Case Status Updated",
              message: `Vehicle processing record has been updated`,
              timestamp: (data.sentAt as string) || new Date().toISOString(),
              data: {
                ...data,
                navigationAction: "cases",
                navigationId: String(recordId),
              },
            });
          }
        );

        // Stock transfer request approved
        socket.on(
          "stock_transfer_request_approved",
          (data: Record<string, unknown>) => {
            console.log("✅ Stock transfer approved:", data);
            const requestId = data.requestId || data.id;
            addNotification({
              type: "stock_transfer_approved",
              priority: "high",
              title: "Stock Transfer Approved",
              message: `Stock transfer request #${String(requestId).slice(
                0,
                8
              )} has been approved`,
              timestamp: (data.sentAt as string) || new Date().toISOString(),
              data: {
                ...data,
                navigationAction: "stock-transfers",
                navigationId: String(requestId),
                navigationType: "detail",
                requestId: requestId,
              },
            });
          }
        );

        // Stock transfer request shipped
        socket.on(
          "stock_transfer_request_shipped",
          (data: Record<string, unknown>) => {
            console.log("📦 Stock transfer shipped:", data);
            const requestId = data.requestId || data.id;
            addNotification({
              type: "stock_transfer_request",
              priority: "medium",
              title: "Stock Transfer Shipped",
              message: `Stock transfer request #${String(requestId).slice(
                0,
                8
              )} has been shipped`,
              timestamp: (data.sentAt as string) || new Date().toISOString(),
              data: {
                ...data,
                navigationAction: "stock-transfers",
                navigationId: String(requestId),
                navigationType: "detail",
                requestId: requestId,
              },
            });
          }
        );

        // Stock transfer request received
        socket.on(
          "stock_transfer_request_received",
          (data: Record<string, unknown>) => {
            console.log("✅ Stock transfer received:", data);
            const requestId = data.requestId || data.id;
            addNotification({
              type: "stock_transfer_approved",
              priority: "medium",
              title: "Stock Transfer Received",
              message: `Stock transfer request #${String(requestId).slice(
                0,
                8
              )} has been received`,
              timestamp: (data.sentAt as string) || new Date().toISOString(),
              data: {
                ...data,
                navigationAction: "stock-transfers",
                navigationId: String(requestId),
                navigationType: "detail",
                requestId: requestId,
              },
            });
          }
        );

        // Stock transfer request rejected
        socket.on(
          "stock_transfer_request_rejected",
          (data: Record<string, unknown>) => {
            console.log("❌ Stock transfer rejected:", data);
            const requestId = data.requestId || data.id;
            const reason = data.rejectionReason || "No reason provided";
            addNotification({
              type: "stock_transfer_rejected",
              priority: "high",
              title: "Stock Transfer Rejected",
              message: `Stock transfer request #${String(requestId).slice(
                0,
                8
              )} was rejected: ${reason}`,
              timestamp: (data.sentAt as string) || new Date().toISOString(),
              data: {
                ...data,
                navigationAction: "stock-transfers",
                navigationId: String(requestId),
                navigationType: "detail",
                requestId: requestId,
              },
            });
          }
        );

        // Stock transfer request cancelled
        socket.on(
          "stock_transfer_request_cancelled",
          (data: Record<string, unknown>) => {
            console.log("🚫 Stock transfer cancelled:", data);
            const requestId = data.requestId || data.id;
            addNotification({
              type: "system_alert",
              priority: "medium",
              title: "Stock Transfer Cancelled",
              message: `Stock transfer request #${String(requestId).slice(
                0,
                8
              )} has been cancelled`,
              timestamp: (data.sentAt as string) || new Date().toISOString(),
              data: {
                ...data,
                navigationAction: "stock-transfers",
                navigationId: String(requestId),
                navigationType: "detail",
                requestId: requestId,
              },
            });
          }
        );

        // New conversation created (chat)
        socket.on("newConversation", (data: Record<string, unknown>) => {
          console.log("💬 New conversation:", data);
          const conversationId = data.conversationId || data.id;
          addNotification({
            type: "new_message",
            priority: "medium",
            title: "New Conversation",
            message: `You have a new conversation`,
            timestamp: (data.sentAt as string) || new Date().toISOString(),
            data: {
              ...data,
              navigationAction: "chat-support",
              navigationId: String(conversationId),
            },
          });
        });

        // Inventory adjustment created
        socket.on(
          "inventory_adjustment_created",
          (data: Record<string, unknown>) => {
            console.log("📦 Inventory adjustment created:", data);
            const adjustmentType = data.adjustmentType as string;
            const quantity = data.quantity as number;
            const reason = data.reason as string;

            addNotification({
              type: "system_alert",
              priority: "medium",
              title: `Inventory ${
                adjustmentType === "IN" ? "Added" : "Removed"
              }`,
              message: `${quantity} item(s) ${
                adjustmentType === "IN" ? "added to" : "removed from"
              } inventory. Reason: ${reason}`,
              timestamp: (data.sentAt as string) || new Date().toISOString(),
              data: {
                ...data,
                navigationAction: "inventory",
              },
            });
          }
        );

        // Low stock alert
        socket.on("low_stock_alert", (data: Record<string, unknown>) => {
          console.log("⚠️ Low stock alert:", data);
          const stocks = (data.stocks as Record<string, unknown>[]) || [];
          const stockCount = stocks.length;

          addNotification({
            type: "system_alert",
            priority: "high",
            title: "Low Stock Alert",
            message: `${stockCount} item(s) are running low on stock`,
            timestamp: (data.sentAt as string) || new Date().toISOString(),
            data: {
              ...data,
              navigationAction: "inventory",
              stocks,
            },
          });
        });

        console.log("✅ All notification socket listeners attached");
      } catch (error) {
        console.error("❌ Failed to initialize notification socket:", error);
      }
    };

    // Initialize socket ONLY if CDN is already loaded
    if (window.__SOCKET_IO_LOADED__) {
      initSocket();
    }
    // Otherwise the interval above will call initSocket() when ready

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up notification socket");
      // Use dynamic import for cleanup too
      import("@/lib/socket").then(({ disconnectNotificationSocket }) => {
        disconnectNotificationSocket();
      });
    };
  }, [addNotification]);

  // Request browser notification permission
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().then((permission) => {
        console.log("🔔 Notification permission:", permission);
      });
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    isConnected,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
