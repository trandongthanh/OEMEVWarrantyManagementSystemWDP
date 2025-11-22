import api from "./api";

/**
 * 💬 Lấy danh sách hội thoại của staff, có phân loại theo trạng thái.
 * @param {string} token - JWT token của staff
 * @param {"waiting"|"active"|"closed"} status - Trạng thái hội thoại
 * @param {number} limit - Giới hạn số lượng hội thoại mỗi lần gọi
 * @param {number} offset - Bỏ qua bao nhiêu hội thoại (phân trang)
 */
export const getMyConversations = async (
  token,
  status = "waiting",
  limit = 20,
  offset = 0
) => {
  try {
    const mapStatusForBackend = (s) => {
      const upper = s.toUpperCase();
      if (upper === "WAITING") return "UNASSIGNED"; // 🔥 Back-end true status
      return upper;
    };

    const backendStatus = mapStatusForBackend(status);
    const url = `/chats/my-conversations`;

    console.log("📡 Fetching conversations:", `${url}?status=${backendStatus}`);

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: backendStatus, limit, offset },
    });

    const conversations =
      res.data?.data?.conversations || res.data?.conversations || [];

    console.log(
      `✅ [${status.toUpperCase()} → ${backendStatus}] loaded:`,
      conversations.length
    );

    if (conversations.length > 0)
      console.log("🧾 Sample conversation:", conversations[0]);

    return conversations;
  } catch (error) {
    console.error(
      "❌ Error fetching conversations:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 💬 Lấy toàn bộ tin nhắn trong 1 hội thoại
 */
export const getMessagesByConversationId = async (
  conversationId,
  token,
  limit = 50,
  offset = 0
) => {
  try {
    const url = `/chats/conversations/${conversationId}/messages`;
    console.log("📡 Fetching messages from:", url);

    const res = await api.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: { limit, offset },
    });

    // ✅ Theo Swagger: { status, data: { messages: [...], pagination: {...} } }
    if (res.data?.status === "success") {
      const messages = res.data?.data?.messages || [];
      console.log(`✅ Messages loaded: ${messages.length}`);
      return messages;
    }

    console.warn("⚠️ Unexpected response format:", res.data);
    return [];
  } catch (error) {
    console.error(
      "❌ Error fetching messages:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 💬 Nhân viên chấp nhận chat
 */
export const acceptAnonymousChat = async (conversationId, token) => {
  try {
    const url = `/chats/conversations/${conversationId}/accept`;
    console.log("📡 Accept chat:", url);

    const res = await api.patch(
      url,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Chat accepted:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error accepting chat:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 💬 Đóng hội thoại
 */
export const closeConversation = async (conversationId, token) => {
  try {
    const url = `/chats/conversations/${conversationId}/close`;
    console.log("📡 Close conversation:", url);

    const res = await api.patch(
      url,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Conversation closed:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error closing chat:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 💬 Khách bắt đầu chat ẩn danh
 */
export const startAnonymousChat = async () => {
  try {
    console.log("📡 Starting anonymous chat...");
    const res = await api.post("/chats/start-anonymous-chat");
    console.log("✅ Anonymous chat started:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error starting anonymous chat:",
      error.response?.data || error.message
    );
    throw error;
  }
};
