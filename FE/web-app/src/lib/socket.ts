// Global window type extension for socket.io CDN
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    io?: any;
    __SOCKET_IO_LOADED__?: boolean;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Socket = any; // Using any to avoid importing from socket.io-client

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

// PERMANENT FIX: Use socket.io from CDN ONLY (loaded via script tag in layout.tsx)
// This prevents bundling issues with crypto dependencies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSocketIO(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Socket.IO can only be used on the client side");
  }

  // Check if already loaded
  if (window.io && window.__SOCKET_IO_LOADED__) {
    return window.io;
  }

  // Wait for socket.io to load from CDN (max 15 seconds for slower connections)
  let attempts = 0;
  const maxAttempts = 150; // 15 seconds

  while (!window.io && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;

    if (attempts % 20 === 0) {
      console.log(
        `⏳ Waiting for Socket.IO CDN to load... (${attempts / 10}s)`
      );
    }
  }

  if (!window.io) {
    console.error("❌ Socket.IO CDN failed to load after 15 seconds");
    console.error("Make sure the CDN script is in layout.tsx");
    console.error("URL:", SOCKET_URL);
    throw new Error(
      "Socket.IO failed to load from CDN. Please refresh the page."
    );
  }

  window.__SOCKET_IO_LOADED__ = true;
  console.log("✅ Socket.IO loaded from CDN successfully");
  return window.io;
}

// ==================== Chat Socket ====================

let chatSocket: Socket | null = null;

/**
 * Initialize chat socket connection
 */
export async function initializeChatSocket(token?: string): Promise<Socket> {
  // Only initialize on client side
  if (typeof window === "undefined") {
    throw new Error("Socket can only be initialized on the client side");
  }

  if (chatSocket && chatSocket.connected) {
    return chatSocket;
  }

  const socketIO = await getSocketIO();
  const auth = token ? { token } : {};

  chatSocket = socketIO(`${SOCKET_URL}/chats`, {
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

  return chatSocket as Socket;
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

  console.log(
    `[Frontend] ${senderType} (${senderId}) joining conversation: ${conversationId}`
  );

  chatSocket.emit("joinRoom", {
    conversationId,
    senderId,
    senderType: senderType.toUpperCase(),
  });
}

/**
 * Send a message through socket
 */
export function sendSocketMessage(
  data: {
    conversationId: string;
    senderId: string;
    senderType: "guest" | "staff";
    content: string;
    timestamp: string;
  },
  callback?: (response: {
    success: boolean;
    data?: unknown;
    error?: string;
  }) => void
): void {
  if (!chatSocket) {
    throw new Error("Chat socket not initialized");
  }

  // Convert senderType to uppercase for backend
  const backendData = {
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderType: data.senderType.toUpperCase() as "GUEST" | "STAFF",
    content: data.content,
  };

  console.log(
    `[Frontend] Sending message from ${data.senderType} to conversation ${data.conversationId}`
  );

  if (callback) {
    chatSocket.emit("sendMessage", backendData, callback);
  } else {
    chatSocket.emit(
      "sendMessage",
      backendData,
      (response: { success: boolean; data?: unknown; error?: string }) => {
        console.log("[Frontend] Message send response:", response);
      }
    );
  }
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
export async function initializeNotificationSocket(
  token: string
): Promise<Socket> {
  // Only initialize on client side
  if (typeof window === "undefined") {
    throw new Error("Socket can only be initialized on the client side");
  }

  if (notificationSocket && notificationSocket.connected) {
    return notificationSocket;
  }

  const socketIO = await getSocketIO();

  notificationSocket = socketIO(`${SOCKET_URL}/notifications`, {
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

  return notificationSocket as Socket;
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
