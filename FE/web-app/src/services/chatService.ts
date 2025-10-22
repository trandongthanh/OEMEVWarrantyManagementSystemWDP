import apiClient from "@/lib/apiClient";

/**
 * Chat Service
 *
 * Handles all chat-related API calls for guest and staff users
 */

// ==================== Types ====================
export interface GuestChatSession {
  conversationId: string;
  guestId: string;
  status: "waiting" | "active" | "closed" | "UNASSIGNED" | "ACTIVE";
  createdAt: string;
}

export interface Message {
  messageId: string;
  content: string;
  senderId: string;
  senderType: "guest" | "staff";
  senderName: string;
  sentAt: string;
  isRead: boolean;
}

export interface Conversation {
  conversationId: string;
  guest?: {
    guestId: string;
    name: string;
  };
  status: "waiting" | "active" | "closed" | "UNASSIGNED" | "ACTIVE" | "CLOSED";
  lastMessage?: {
    content: string;
    sentAt: string;
  };
  unreadCount?: number;
  createdAt: string;
}

export interface StartChatRequest {
  guestId: string;
  serviceCenterId: string;
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

export interface ConversationsResponse {
  status: "success";
  data: {
    conversations: Conversation[];
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
 */
export async function startAnonymousChat(
  guestId: string,
  serviceCenterId: string
): Promise<GuestChatSession> {
  try {
    const response = await apiClient.post<StartChatResponse>(
      "/chats/start-anonymous-chat",
      {
        guestId,
        serviceCenterId,
      }
    );

    // Map backend status to frontend status
    const conversation = response.data.data.conversation;
    const mappedConversation: GuestChatSession = {
      ...conversation,
      status: (conversation.status === "UNASSIGNED"
        ? "waiting"
        : conversation.status === "ACTIVE"
        ? "active"
        : "closed") as "waiting" | "active" | "closed",
    };

    return mappedConversation;
  } catch (error) {
    console.error("Error starting anonymous chat:", error);
    throw error;
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
  status?: "waiting" | "active" | "closed",
  limit: number = 20,
  offset: number = 0
): Promise<Conversation[]> {
  try {
    // Map frontend status to backend status for API call
    const backendStatus =
      status === "waiting"
        ? "UNASSIGNED"
        : status === "active"
        ? "ACTIVE"
        : status === "closed"
        ? "CLOSED"
        : undefined;

    const response = await apiClient.get<ConversationsResponse>(
      "/chats/my-conversations",
      {
        params: { status: backendStatus, limit, offset },
      }
    );

    // Map backend statuses to frontend statuses
    const conversations = response.data.data.conversations.map((conv) => ({
      ...conv,
      status: (conv.status === "UNASSIGNED"
        ? "waiting"
        : conv.status === "ACTIVE"
        ? "active"
        : conv.status === "CLOSED"
        ? "closed"
        : conv.status) as
        | "waiting"
        | "active"
        | "closed"
        | "UNASSIGNED"
        | "ACTIVE"
        | "CLOSED",
    }));

    return conversations;
  } catch (error) {
    console.error("Error fetching my conversations:", error);
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
 */
export function getOrCreateGuestId(): string {
  const GUEST_ID_KEY = "guestChatId";

  if (typeof window === "undefined") {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
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
 * Clear guest chat session
 */
export function clearGuestChatSession(): void {
  const CONVERSATION_ID_KEY = "guestConversationId";

  if (typeof window !== "undefined") {
    localStorage.removeItem(CONVERSATION_ID_KEY);
  }
}
