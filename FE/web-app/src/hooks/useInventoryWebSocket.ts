"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface InventoryUpdate {
  type: "STOCK_CHANGE" | "ALLOCATION" | "TRANSFER" | "RESERVATION";
  warehouseId: string;
  componentId?: string;
  typeComponentId?: string;
  quantity?: number;
  timestamp: string;
  userId?: string;
  action?: string;
}

interface UseInventoryWebSocketOptions {
  warehouseId?: string;
  onUpdate?: (update: InventoryUpdate) => void;
  autoConnect?: boolean;
}

export function useInventoryWebSocket({
  warehouseId,
  onUpdate,
  autoConnect = true,
}: UseInventoryWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<InventoryUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Get WebSocket URL from environment or default
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      const url = warehouseId
        ? `${wsUrl}/inventory?warehouseId=${warehouseId}`
        : `${wsUrl}/inventory`;

      console.log("[WebSocket] Connecting to:", url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("[WebSocket] Connected to inventory updates");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send authentication if needed
        const token = localStorage.getItem("token");
        if (token) {
          ws.send(JSON.stringify({ type: "AUTH", token }));
        }

        // Subscribe to warehouse-specific updates
        if (warehouseId) {
          ws.send(JSON.stringify({ type: "SUBSCRIBE", warehouseId }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data) as InventoryUpdate;
          console.log("[WebSocket] Received update:", update);
          setLastUpdate(update);
          onUpdate?.(update);
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          console.log(`[WebSocket] Reconnecting in ${delay}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error("[WebSocket] Max reconnect attempts reached");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
    }
  }, [warehouseId, onUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("[WebSocket] Cannot send, connection not open");
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect,
    send,
  };
}

export default useInventoryWebSocket;
