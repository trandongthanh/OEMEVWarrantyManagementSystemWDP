import apiPublic from "./apiPublic";

/**
 * 🚀 Bắt đầu chat bằng email (đúng với backend của bạn)
 */
export const startChatByEmail = async (email) => {
  try {
    console.log("📡 Starting chat with email:", email);

    const res = await apiPublic.post("/api/chat/resume-by-email", { email });

    console.log("✅ Chat started:", res.data);

    return {
      conversationId: res.data?.data?.conversation?.id,
      email,
    };
  } catch (error) {
    console.error(
      "❌ Error starting chat:",
      error.response?.data || error.message
    );
    throw error;
  }
};
