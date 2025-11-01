"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  Trash2,
  Clock,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Package,
  MessageSquare,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Notification, NotificationType } from "@/types/notification";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (navId: string) => void;
}

export function NotificationPanel({
  isOpen,
  onClose,
  onNavigate,
}: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    isConnected,
  } = useNotifications();

  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "case_assigned":
      case "case_updated":
        return <AlertCircle className="w-5 h-5" />;
      case "case_completed":
        return <CheckCircle className="w-5 h-5" />;
      case "stock_transfer_request":
      case "stock_transfer_approved":
      case "stock_transfer_rejected":
        return <Package className="w-5 h-5" />;
      case "component_reserved":
        return <CheckCircle className="w-5 h-5" />;
      case "new_message":
        return <MessageSquare className="w-5 h-5" />;
      case "appointment_scheduled":
      case "appointment_reminder":
        return <Calendar className="w-5 h-5" />;
      case "system_alert":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationStyle = (type: NotificationType, read: boolean) => {
    const baseStyles = read ? "opacity-75" : "";

    switch (type) {
      case "case_assigned":
      case "case_updated":
        return `${baseStyles} border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100`;
      case "case_completed":
        return `${baseStyles} border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-transparent hover:from-green-100`;
      case "stock_transfer_request":
      case "stock_transfer_approved":
      case "stock_transfer_rejected":
        return `${baseStyles} border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-transparent hover:from-purple-100`;
      case "component_reserved":
        return `${baseStyles} border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent hover:from-emerald-100`;
      case "new_message":
        return `${baseStyles} border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-transparent hover:from-indigo-100`;
      case "appointment_scheduled":
      case "appointment_reminder":
        return `${baseStyles} border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-transparent hover:from-orange-100`;
      case "system_alert":
        return `${baseStyles} border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-transparent hover:from-red-100`;
      default:
        return `${baseStyles} border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-transparent hover:from-gray-100`;
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case "case_assigned":
      case "case_updated":
        return "text-blue-600 bg-blue-100";
      case "case_completed":
        return "text-green-600 bg-green-100";
      case "stock_transfer_request":
      case "stock_transfer_approved":
      case "stock_transfer_rejected":
        return "text-purple-600 bg-purple-100";
      case "component_reserved":
        return "text-emerald-600 bg-emerald-100";
      case "new_message":
        return "text-indigo-600 bg-indigo-100";
      case "appointment_scheduled":
      case "appointment_reminder":
        return "text-orange-600 bg-orange-100";
      case "system_alert":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (
    notification: Notification,
    onNavigate?: (navId: string) => void
  ) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle navigation action from notification data
    const navigationAction = notification.data?.navigationAction as
      | string
      | undefined;

    if (navigationAction && onNavigate) {
      // Use the navigation callback passed from dashboard (changes active nav state)
      onNavigate(navigationAction);
      onClose();
    } else if (notification.actionUrl) {
      // Fallback to URL navigation
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - covers everything including sidebar button (z-60) and header (z-50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-[9998]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header - Dark theme matching sidebar exactly (#2d2d2d) */}
            <div className="bg-[#2d2d2d] text-white p-5 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Notifications
                    </h2>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {unreadCount} unread message
                        {unreadCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? "bg-green-400 animate-pulse"
                      : "bg-red-400 animate-pulse"
                  }`}
                />
                <span className="text-xs text-gray-300 font-medium">
                  {isConnected ? "Live updates active" : "Reconnecting..."}
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            {notifications.length > 0 && (
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      filter === "all"
                        ? "bg-white text-blue-600 shadow-md ring-2 ring-blue-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    All
                    <span
                      className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                        filter === "all"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {notifications.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setFilter("unread")}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      filter === "unread"
                        ? "bg-white text-blue-600 shadow-md ring-2 ring-blue-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <span
                        className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                          filter === "unread"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Actions */}
            {notifications.length > 0 && (
              <div className="border-b border-gray-200 p-3 flex gap-2 bg-white">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                  <div className="p-6 bg-gray-100 rounded-2xl mb-4">
                    <Bell className="w-16 h-16 opacity-30" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {filter === "unread"
                      ? "No unread notifications"
                      : "No notifications"}
                  </h3>
                  <p className="text-sm text-center text-gray-500">
                    {filter === "unread"
                      ? "You've read all your notifications"
                      : "You're all caught up! Notifications will appear here."}
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100, height: 0 }}
                        layout
                        className={`group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${getNotificationStyle(
                          notification.type,
                          notification.read
                        )}`}
                        onClick={() =>
                          handleNotificationClick(notification, onNavigate)
                        }
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Enhanced Icon */}
                            <div
                              className={`flex-shrink-0 p-2.5 rounded-xl ${getIconColor(
                                notification.type
                              )} transition-transform group-hover:scale-110`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3
                                  className={`text-sm font-bold leading-tight ${
                                    !notification.read
                                      ? "text-gray-900"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg"
                                  aria-label="Remove notification"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  {notification.senderName && (
                                    <span className="text-gray-400">
                                      • {notification.senderName}
                                    </span>
                                  )}
                                </div>

                                {notification.actionUrl && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="w-4 h-4 text-blue-500" />
                                  </div>
                                )}
                              </div>

                              {/* Unread Indicator */}
                              {!notification.read && (
                                <div className="absolute top-4 right-4">
                                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(panelContent, document.body);
}
