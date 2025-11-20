// src/services/chatCustomerService.js
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 🔧 Tạo hoặc lấy guestId (lưu trong AsyncStorage)
 */
const getOrCreateGuestId = async () => {
  try {
    let guestId = await AsyncStorage.getItem("guestChatId");
    if (guestId) {
      console.log("🔄 Using existing guestId:", guestId);
      return guestId;
    }

    // Không dùng crypto / uuid, tự tạo chuỗi đơn giản
    guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
    await AsyncStorage.setItem("guestChatId", guestId);
    console.log("🆕 Generated guestId:", guestId);
    return guestId;
  } catch (err) {
    console.log("⚠️ getOrCreateGuestId error:", err);
    // fallback nếu AsyncStorage lỗi
    return `guest_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  }
};

/**
 * 1️⃣ Chat Ẩn Danh: start-anonymous-chat với guestId
 * body: { serviceCenterId, guestId }
 */
export const startAnonymousChat = async (serviceCenterId) => {
  try {
    const guestId = await getOrCreateGuestId();

    const payload = {
      serviceCenterId,
      guestId,
    };

    console.log("📡 Starting anonymous chat with:", payload);

    const res = await api.post("/chats/start-anonymous-chat", payload);

    console.log("✅ Anonymous chat started:", res.data);

    const conversation =
      res.data?.data?.conversation || res.data?.conversation || {};

    return {
      conversationId: conversation.id || conversation.conversationId || null,
      guestId: conversation.guestId || guestId,
      status: conversation.status,
      createdAt: conversation.createdAt,
    };
  } catch (error) {
    console.error(
      "❌ Error starting anonymous chat:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 2️⃣ Tạo Chat MỚI bằng Email
 * body: { serviceCenterId, email }
 * backend dùng start-anonymous-chat với email (giống web)
 */
export const startNewChatWithEmail = async (serviceCenterId, email) => {
  try {
    const payload = {
      serviceCenterId,
      email,
    };

    console.log("📡 Starting NEW chat with email:", payload);

    const res = await api.post("/chats/start-anonymous-chat", payload);

    console.log("✅ New email chat started:", res.data);

    const conversation =
      res.data?.data?.conversation || res.data?.conversation || {};

    return {
      conversationId: conversation.id || conversation.conversationId || null,
      email,
      status: conversation.status,
      createdAt: conversation.createdAt,
    };
  } catch (error) {
    console.error(
      "❌ Error starting new chat with email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 3️⃣ Tiếp tục chat cũ bằng Email
 * API: /chats/resume-by-email  (bạn đã có trên web)
 * body: { email }
 */
export async function resumeChatByEmail(email) {
  try {
    const response = await api.post("/chats/resume-by-email", { email });

    const conversations = response.data?.data?.conversations || [];

    if (conversations.length === 0) {
      throw new Error("No previous conversation found.");
    }

    // 🔥 Lấy cuộc chat mới nhất
    const latest = conversations.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    return {
      conversationId: latest.id,
      guestId: latest.guest?.guestId || null,
      email,
    };
  } catch (error) {
    console.log("❌ Error resumeChatByEmail:", error);
    throw error;
  }
}

export async function getConversationMessages(
  conversationId,
  limit = 50,
  offset = 0
) {
  try {
    const response = await api.get(
      `/chats/conversations/${conversationId}/messages`,
      {
        params: { limit, offset },
      }
    );

    const raw = response.data?.data?.messages || [];

    // Chuẩn hóa để FE render bubble đúng màu & nội dung
    const normalized = raw.map((msg) => ({
      id: msg.id,
      sender: msg.senderType === "STAFF" ? "support" : "customer", // FE bubble
      message: msg.content || msg.message || "", // backend dùng content
      createdAt: msg.createdAt,
      senderId: msg.senderId,
      senderType: msg.senderType,
    }));

    return normalized;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
}
