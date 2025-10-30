"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Socket } from "socket.io-client";

interface StockTransferNotification {
  requestId: string;
  status: string;
  message: string;
  timestamp: string;
}

interface UseStockTransferNotificationsProps {
  notificationSocket: Socket | null;
  onStatusChange?: (data: StockTransferNotification) => void;
}

export function useStockTransferNotifications({
  notificationSocket,
  onStatusChange,
}: UseStockTransferNotificationsProps) {
  useEffect(() => {
    if (!notificationSocket) return;

    const handleStockTransferStatusChanged = (
      data: StockTransferNotification
    ) => {
      // Show toast notification
      const statusMessages = {
        APPROVED: "✅ Stock transfer request approved",
        REJECTED: "❌ Stock transfer request rejected",
        SHIPPED: "🚚 Stock transfer shipment sent",
        RECEIVED: "📦 Stock transfer received",
        CANCELLED: "⏹️ Stock transfer request cancelled",
      };

      const message =
        statusMessages[data.status as keyof typeof statusMessages] ||
        `Stock transfer status changed to ${data.status}`;

      toast.info(message, {
        description: data.message || `Request ID: ${data.requestId}`,
        duration: 5000,
      });

      // Callback for additional actions (e.g., refetch data)
      onStatusChange?.(data);
    };

    // Listen for stock transfer status changes
    notificationSocket.on(
      "stockTransferStatusChanged",
      handleStockTransferStatusChanged
    );

    // Cleanup
    return () => {
      notificationSocket.off(
        "stockTransferStatusChanged",
        handleStockTransferStatusChanged
      );
    };
  }, [notificationSocket, onStatusChange]);
}
