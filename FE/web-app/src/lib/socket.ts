import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

// ==================== Chat Socket ====================

let chatSocket: Socket | null = null;

/**
 * Initialize chat socket connection
 */
export function initializeChatSocket(token?: string): Socket {
  if (chatSocket && chatSocket.connected) {
    return chatSocket;
  }

  const auth = token ? { token } : {};

  chatSocket = io(`${SOCKET_URL}/chats`, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000, // 20 second timeout
    forceNew: false,
    upgrade: true,
    auth,
  });

  chatSocket.on("connect", () => {
    console.log("Chat socket connected:", chatSocket?.id);
  });

  chatSocket.on("disconnect", (reason: string) => {
    console.log("Chat socket disconnected:", reason);
  });

  chatSocket.on("connect_error", (error: Error) => {
    console.error("Chat socket connection error:", error);
    console.error("Socket URL:", `${SOCKET_URL}/chats`);
    console.error(
      "Socket state:",
      chatSocket?.connected ? "connected" : "disconnected"
    );
  });

  chatSocket.on("reconnect", (attemptNumber: number) => {
    console.log("Chat socket reconnected after", attemptNumber, "attempts");
  });

  chatSocket.on("reconnect_error", (error: Error) => {
    console.error("Chat socket reconnection error:", error);
  });

  return chatSocket;
}

/**
 * Get existing chat socket instance
 */
export function getChatSocket(): Socket | null {
  return chatSocket;
}

/**
 * Disconnect chat socket
 */
export function disconnectChatSocket(): void {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
}

/**
 * Join a chat room/conversation
 */
export function joinChatRoom(
  conversationId: string,
  senderId: string,
  senderType: "guest" | "staff"
): void {
  if (!chatSocket) {
    throw new Error("Chat socket not initialized");
  }

  chatSocket.emit("joinRoom", {
    conversationId,
    senderId,
    senderType: senderType.toUpperCase(),
  });
}

/**
 * Send a message through socket
 */
export function sendSocketMessage(data: {
  conversationId: string;
  senderId: string;
  senderType: "guest" | "staff";
  content: string;
  timestamp: string;
}): void {
  if (!chatSocket) {
    throw new Error("Chat socket not initialized");
  }

  // Convert senderType to uppercase for backend
  const backendData = {
    ...data,
    senderType: data.senderType.toUpperCase() as "GUEST" | "STAFF",
  };

  chatSocket.emit("sendMessage", backendData);
}

/**
 * Send typing indicator
 */
export function sendTypingIndicator(conversationId: string): void {
  if (!chatSocket) {
    throw new Error("Chat socket not initialized");
  }

  chatSocket.emit("typing", { conversationId });
}

// ==================== Notification Socket ====================

let notificationSocket: Socket | null = null;

/**
 * Initialize notification socket with authentication token
 */
export function initializeNotificationSocket(token: string): Socket {
  if (notificationSocket && notificationSocket.connected) {
    return notificationSocket;
  }

  notificationSocket = io(`${SOCKET_URL}/notifications`, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token,
    },
  });

  notificationSocket.on("connect", () => {
    console.log("Notification socket connected:", notificationSocket?.id);
  });

  notificationSocket.on("disconnect", (reason: string) => {
    console.log("Notification socket disconnected:", reason);
  });

  notificationSocket.on("connect_error", (error: Error) => {
    console.error("Notification socket connection error:", error);
  });

  return notificationSocket;
}

/**
 * Get existing notification socket instance
 */
export function getNotificationSocket(): Socket | null {
  return notificationSocket;
}

/**
 * Disconnect notification socket
 */
export function disconnectNotificationSocket(): void {
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
  }
}
