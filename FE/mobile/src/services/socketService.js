import io from "socket.io-client";

let socket = null;

// ⚠️ Dùng IP LAN thật của máy backend (ipconfig → IPv4)
const SOCKET_URL = "http://192.168.100.191:3000/chats"; // namespace /chats

// 🧩 1️⃣ Khởi tạo socket
export const initSocket = (token) => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: token ? { token } : {},
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🟢 Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("⚠️ Connect error:", err.message);
  });

  return socket;
};

// 🧩 2️⃣ Join vào phòng chat — đảm bảo chạy sau khi socket connect
export const joinConversation = (conversationId) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized yet!");
    return;
  }

  if (socket.connected) {
    console.log("📡 Joining room:", conversationId);
    socket.emit("joinRoom", { conversationId });
  } else {
    console.log("⌛ Waiting for socket to connect before joining...");
    socket.once("connect", () => {
      console.log("📡 Connected, now joining:", conversationId);
      socket.emit("joinRoom", { conversationId });
    });
  }
};

// 🧩 3️⃣ Lắng nghe tin nhắn realtime
export const onNewMessage = (callback) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized!");
    return;
  }

  socket.off("newMessage"); // tránh bị nhân đôi listener

  socket.on("newMessage", (data) => {
    console.log("📩 New message realtime:", data);
    callback(data.newMessage || data);
  });
};

// 🧩 4️⃣ Gửi tin nhắn qua socket
export const sendMessageSocket = (message) => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Socket not connected — cannot send message");
    return;
  }

  console.log("📤 Sending message:", message);

  socket.emit("sendMessage", message, (ack) => {
    if (ack?.success) console.log("✅ Sent successfully:", ack.data);
    else console.log("❌ Send error:", ack?.error);
  });
};

// 🧩 5️⃣ Ngắt kết nối
export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};
