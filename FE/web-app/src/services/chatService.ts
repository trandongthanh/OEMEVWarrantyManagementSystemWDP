import apiClient from "@/lib/apiClient";

/**
 * Chat Service
 *
 * Handles all chat-related API calls for guest and staff users
 */

// ==================== Types ====================

/**
 * Backend Conversation Status (defined in BE/src/models/Conversation.cjs)
 * - UNASSIGNED: No staff assigned yet (guest waiting)
 * - ACTIVE: Staff has accepted and is chatting
 * - CLOSED: Conversation ended by staff
 */
export type ConversationStatus = "UNASSIGNED" | "ACTIVE" | "CLOSED";

export interface GuestChatSession {
  conversationId: string;
  guestId: string;
  status: ConversationStatus;
  createdAt: string;
}

export interface Message {
  messageId: string;
  content: string;
  senderId: string;
  senderType: "guest" | "staff" | "system";
  senderName: string;
  sentAt: string;
  isRead: boolean;
  fileUrl?: string; // Cloudinary URL for uploaded files/images
  fileType?: "image" | "file"; // Type of file attachment
}

export interface Conversation {
  conversationId: string;
  guest?: {
    guestId: string;
    name?: string; // Optional since Guest table only has guestId
  };
  status: ConversationStatus;
  serviceCenterId?: string; // TODO: Backend will add this field
  lastMessage?: {
    content: string;
    sentAt: string;
  };
  unreadCount?: number;
  createdAt: string;
}

export interface StartChatRequest {
  guestId?: string;
  serviceCenterId: string;
  email?: string;
}

export interface StartChatResponse {
  status: "success";
  data: {
    conversation: GuestChatSession;
  };
}

export interface MessagesResponse {
  status: "success";
  data: {
    messages: Message[];
    pagination?: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}

// Backend API response structure (before mapping to frontend)
interface BackendConversation {
  id: string;
  guest?: {
    guestId: string;
    name?: string; // Optional since Guest table only has guestId
  };
  status: ConversationStatus;
  messages?: Array<{
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface ConversationsResponse {
  status: "success";
  data: {
    conversations: BackendConversation[];
    pagination?: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}

// ==================== Guest Chat API ====================

/**
 * Start an anonymous chat session (Guest)
 * @param guestId - Optional guest ID (if not provided with email, backend will generate)
 * @param serviceCenterId - Service center ID to connect to
 * @param email - Optional email for persistent chat history
 */
export async function startAnonymousChat(
  guestId: string | undefined,
  serviceCenterId: string,
  email?: string
): Promise<GuestChatSession> {
  try {
    // Validate guest ID length before sending (max 24 chars)
    if (guestId && guestId.length > 24) {
      console.warn("Guest ID too long, regenerating:", guestId.length, "chars");
      // Clear the bad ID from localStorage and generate a new one
      if (typeof window !== "undefined") {
        localStorage.removeItem("guestChatId");
      }
      guestId = getOrCreateGuestId();
    }

    const payload: StartChatRequest = {
      serviceCenterId,
      ...(email ? { email } : { guestId }),
    };

    console.log(
      "Starting chat with guest ID:",
      guestId,
      `(${guestId?.length || 0} chars)`
    );

    const response = await apiClient.post<StartChatResponse>(
      "/chats/start-anonymous-chat",
      payload
    );

    const conversation = response.data.data.conversation;

    // Map backend response to frontend interface
    // Backend returns 'id' but frontend expects 'conversationId'
    const backendConversation = conversation as unknown as {
      id?: string;
      conversationId?: string;
      guestId: string;
      status: ConversationStatus;
      createdAt: string;
    };

    return {
      conversationId:
        backendConversation.id || backendConversation.conversationId || "",
      guestId: backendConversation.guestId,
      status: backendConversation.status,
      createdAt: backendConversation.createdAt,
    };
  } catch (error: unknown) {
    console.error("Error starting anonymous chat:", error);
    // Re-throw with more context
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    throw new Error("Unable to start chat session. Please try again later.");
  }
}

/**
 * Get messages for a conversation (No auth required for guests)
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  try {
    const response = await apiClient.get<MessagesResponse>(
      `/chats/conversations/${conversationId}/messages`,
      {
        params: { limit, offset },
      }
    );

    return response.data.data.messages;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
}

// ==================== Staff Chat API ====================

/**
 * Accept and join a waiting conversation (Staff only)
 */
export async function acceptConversation(
  conversationId: string
): Promise<void> {
  try {
    await apiClient.patch(`/chats/conversations/${conversationId}/accept`);
  } catch (error) {
    console.error("Error accepting conversation:", error);
    throw error;
  }
}

/**
 * Get all conversations for authenticated staff
 */
export async function getMyConversations(
  status?: ConversationStatus,
  limit: number = 20,
  offset: number = 0
): Promise<Conversation[]> {
  try {
    const response = await apiClient.get<ConversationsResponse>(
      "/chats/my-conversations",
      {
        params: { status, limit, offset },
      }
    );

    // Map backend response to frontend interface
    const conversations = response.data.data.conversations.map((conv) => ({
      conversationId: conv.id,
      guest: conv.guest,
      lastMessage: conv.messages?.[0]
        ? {
            content: conv.messages[0].content,
            sentAt: conv.messages[0].createdAt,
          }
        : undefined,
      unreadCount: 0, // TODO: Implement unread count
      createdAt: conv.createdAt,
      status: conv.status,
    }));

    return conversations;
  } catch (error) {
    console.error("Error fetching my conversations:", error);
    throw error;
  }
}

/**
 * Resume conversations by email (Guest)
 * Returns all conversations associated with the provided email
 */
export async function resumeByEmail(email: string): Promise<Conversation[]> {
  try {
    const response = await apiClient.post<ConversationsResponse>(
      "/chats/resume-by-email",
      { email }
    );

    // Map backend response to frontend interface
    const conversations = response.data.data.conversations.map((conv) => ({
      conversationId: conv.id,
      guest: conv.guest,
      lastMessage: conv.messages?.[0]
        ? {
            content: conv.messages[0].content,
            sentAt: conv.messages[0].createdAt,
          }
        : undefined,
      unreadCount: 0,
      createdAt: conv.createdAt,
      status: conv.status,
    }));

    return conversations;
  } catch (error) {
    console.error("Error resuming conversations by email:", error);
    throw error;
  }
}

/**
 * Close a conversation (Staff only)
 */
export async function closeConversation(conversationId: string): Promise<void> {
  try {
    await apiClient.patch(`/chats/conversations/${conversationId}/close`);
  } catch (error) {
    console.error("Error closing conversation:", error);
    throw error;
  }
}

// ==================== Helper Functions ====================

/**
 * Generate a unique guest ID (stored in localStorage)
 * Format: g_{base36_timestamp}_{random} - max 24 chars
 */
export function getOrCreateGuestId(): string {
  const GUEST_ID_KEY = "guestChatId";

  if (typeof window === "undefined") {
    // Ultra-short: 8-char timestamp + 5-char random = ~16 chars total
    const timestamp = Date.now().toString(36).slice(-8);
    const random = Math.random().toString(36).substr(2, 5);
    return `g_${timestamp}_${random}`;
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY);

  // Clear old guest ID if it's too long (from previous implementation)
  if (guestId && guestId.length > 24) {
    console.log("Clearing old guest ID (too long):", guestId.length, "chars");
    localStorage.removeItem(GUEST_ID_KEY);
    guestId = null;
  }

  if (!guestId) {
    // Ultra-short: 8-char timestamp + 5-char random = ~16 chars total
    const timestamp = Date.now().toString(36).slice(-8);
    const random = Math.random().toString(36).substr(2, 5);
    guestId = `g_${timestamp}_${random}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
    console.log(
      "Generated new guest ID:",
      guestId,
      `(${guestId.length} chars)`
    );
  }

  return guestId;
}

/**
 * Get or create guest chat session
 */
export function getGuestChatSession(): {
  conversationId: string | null;
  guestId: string;
} {
  const CONVERSATION_ID_KEY = "guestConversationId";
  const guestId = getOrCreateGuestId();

  if (typeof window === "undefined") {
    return { conversationId: null, guestId };
  }

  const conversationId = localStorage.getItem(CONVERSATION_ID_KEY);

  return { conversationId, guestId };
}

/**
 * Save guest conversation ID
 */
export function saveGuestConversationId(conversationId: string): void {
  const CONVERSATION_ID_KEY = "guestConversationId";

  if (typeof window !== "undefined") {
    localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
  }
}

/**
 * Save complete guest chat session (conversation ID + email + status)
 */
export function saveGuestChatSession(data: {
  conversationId: string;
  email?: string;
  status: "idle" | "waiting" | "active" | "closed";
}): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("guestConversationId", data.conversationId);
  localStorage.setItem("guestChatStatus", data.status);
  if (data.email) {
    localStorage.setItem("guestChatEmail", data.email);
  }
  localStorage.setItem("guestChatTimestamp", Date.now().toString());
}

/**
 * Get saved guest chat session
 */
export function getSavedGuestChatSession(): {
  conversationId: string | null;
  email: string | null;
  status: "idle" | "waiting" | "active" | "closed" | null;
  timestamp: number | null;
} {
  if (typeof window === "undefined") {
    return { conversationId: null, email: null, status: null, timestamp: null };
  }

  const conversationId = localStorage.getItem("guestConversationId");
  const email = localStorage.getItem("guestChatEmail");
  const status = localStorage.getItem("guestChatStatus") as
    | "idle"
    | "waiting"
    | "active"
    | "closed"
    | null;
  const timestamp = localStorage.getItem("guestChatTimestamp");

  return {
    conversationId,
    email,
    status,
    timestamp: timestamp ? parseInt(timestamp, 10) : null,
  };
}

/**
 * Clear guest chat session
 */
export function clearGuestChatSession(): void {
  const CONVERSATION_ID_KEY = "guestConversationId";

  if (typeof window !== "undefined") {
    localStorage.removeItem(CONVERSATION_ID_KEY);
    localStorage.removeItem("guestChatEmail");
    localStorage.removeItem("guestChatStatus");
    localStorage.removeItem("guestChatTimestamp");
  }
}
