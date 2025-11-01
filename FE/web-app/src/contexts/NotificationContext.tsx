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
} from "@/types/notification";
import {
  initializeNotificationSocket,
  disconnectNotificationSocket,
} from "@/lib/socket";
import { authService } from "@/services";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: NotificationSocketData) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
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

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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

    console.log("🔔 Initializing notification socket...");
    const socket = initializeNotificationSocket(token);

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
        addNotification({
          type: "case_updated",
          priority: "medium",
          title: "Case Status Updated",
          message: `Vehicle processing record has been updated`,
          timestamp: (data.sentAt as string) || new Date().toISOString(),
          data: { ...data, navigationAction: "cases" },
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
            requestId: requestId,
          },
        });
      }
    );

    // New conversation created (chat)
    socket.on("newConversation", (data: Record<string, unknown>) => {
      console.log("💬 New conversation:", data);
      addNotification({
        type: "new_message",
        priority: "medium",
        title: "New Conversation",
        message: `You have a new conversation`,
        timestamp: (data.sentAt as string) || new Date().toISOString(),
        data: { ...data, navigationAction: "chat-support" },
      });
    });

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up notification socket");
      disconnectNotificationSocket();
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
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
