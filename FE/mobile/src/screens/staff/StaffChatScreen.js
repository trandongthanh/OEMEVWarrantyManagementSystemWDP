import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import io from "socket.io-client";
import {
  getMessagesByConversationId,
  closeConversation,
  acceptAnonymousChat, // ✅ import thêm
} from "../../services/chatService";
import ConfirmCloseModal from "../../components/ConfirmCloseModal";

const SOCKET_URL = "http://10.0.2.2:3000";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  border: "#1F2833",
  danger: "#EF4444",
  success: "#22C55E",
  waiting: "#FACC15",
};

export default function StaffChatScreen({ route, navigation }) {
  const { conversationId, token, status: initialStatus, guest } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatStatus, setChatStatus] = useState(initialStatus);
  const [closing, setClosing] = useState(false);
  const [accepting, setAccepting] = useState(false); // ✅ state accept
  const [showConfirm, setShowConfirm] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // 🧩 Socket
  useEffect(() => {
    if (!token || !conversationId) return;
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;
    socket.emit("joinConversation", { conversationId });

    socket.on("newMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("connect", () => console.log("🟢 Socket connected"));
    socket.on("disconnect", () => console.log("🔴 Socket disconnected"));

    return () => socket.disconnect();
  }, [conversationId, token]);

  // 🧩 Load messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await getMessagesByConversationId(conversationId, token);
        setMessages(res || []);
      } catch (err) {
        console.error("❌ Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  // 🧩 Send message
  const handleSend = () => {
    if (chatStatus === "CLOSED" || chatStatus === "WAITING") return; // ⛔ Không gửi khi chưa accept
    if (!input.trim() || !socketRef.current) return;

    const newMsg = {
      content: input.trim(),
      conversationId,
      senderType: "STAFF",
      createdAt: new Date().toISOString(),
    };

    socketRef.current.emit("sendMessage", newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    Keyboard.dismiss();
  };

  // 🧩 Auto scroll
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // 🧩 Status color
  const getStatusColor = () => {
    switch (chatStatus) {
      case "ACTIVE":
        return COLORS.success;
      case "WAITING":
        return COLORS.waiting;
      default:
        return COLORS.danger;
    }
  };

  // 🧩 Accept chat
  const handleAcceptChat = async () => {
    try {
      setAccepting(true);
      const res = await acceptAnonymousChat(conversationId, token);
      console.log("✅ Chat accepted:", res);
      setChatStatus("ACTIVE");
    } catch (err) {
      console.error("❌ Error accepting chat:", err.response?.data || err);
    } finally {
      setAccepting(false);
    }
  };

  // 🧩 Confirm close
  const handleConfirmClose = async () => {
    try {
      setClosing(true);
      const res = await closeConversation(conversationId, token);
      console.log("✅ Conversation closed:", res);
      setChatStatus("CLOSED");
      setShowConfirm(false);
    } catch (err) {
      console.error("❌ Error closing chat:", err.response?.data || err);
    } finally {
      setClosing(false);
    }
  };

  // 🧩 Render message
  const renderMessage = ({ item }) => {
    const isStaff = item.senderType === "STAFF";
    return (
      <View
        style={[
          styles.messageBubble,
          isStaff ? styles.staffBubble : styles.customerBubble,
        ]}
      >
        <Text style={{ color: isStaff ? "#fff" : COLORS.text, fontSize: 15 }}>
          {item.content}
        </Text>
      </View>
    );
  };

  // 🧩 Guest info
  const displayName = guest?.full_name || guest?.name || "Anonymous Guest";
  const avatarSource = guest?.avatar ? { uri: guest.avatar } : null;
  const avatarLetter = displayName?.charAt(0)?.toUpperCase() || "?";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <LinearGradient
        colors={["#11161C", "#0C1015"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarContainer}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>
            )}
            <View
              style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
            />
          </View>

          <Text style={styles.name}>{displayName}</Text>
        </View>

        {/* ✅ Action button theo trạng thái */}
        {chatStatus === "ACTIVE" && (
          <TouchableOpacity
            onPress={() => setShowConfirm(true)}
            disabled={closing}
            style={styles.closeBtn}
          >
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={closing ? COLORS.textMuted : COLORS.danger}
            />
          </TouchableOpacity>
        )}

        {chatStatus === "WAITING" && (
          <TouchableOpacity
            onPress={handleAcceptChat}
            disabled={accepting}
            style={styles.acceptBtn}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={accepting ? COLORS.textMuted : COLORS.success}
            />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* MESSAGES */}
      {loading ? (
        <ActivityIndicator
          color={COLORS.accent}
          size="large"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) =>
            item?._id?.toString() || `${item.senderType}-${index}`
          }
          contentContainerStyle={{
            padding: 12,
            paddingBottom: 90,
          }}
        />
      )}

      {/* INPUT / CLOSED */}
      {chatStatus === "CLOSED" ? (
        <LinearGradient
          colors={["#EF4444", "#7F1D1D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.closedBar}
        >
          <Ionicons name="lock-closed" size={16} color="#fff" />
          <Text style={styles.closedBarText}>This conversation is closed</Text>
        </LinearGradient>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={
              chatStatus === "WAITING"
                ? "Accept the chat before messaging..."
                : "Type a message..."
            }
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            editable={chatStatus === "ACTIVE"} // ⛔ Không cho nhập khi WAITING
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              chatStatus !== "ACTIVE" && { opacity: 0.5 },
            ]}
            onPress={handleSend}
            disabled={chatStatus !== "ACTIVE"}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* 🧩 Modal confirm close */}
      <ConfirmCloseModal
        visible={showConfirm}
        closing={closing}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmClose}
      />
    </SafeAreaView>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent + "22",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { color: COLORS.accent, fontWeight: "700", fontSize: 18 },
  statusDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  name: { color: COLORS.text, fontWeight: "700", fontSize: 18, marginLeft: 10 },
  closeBtn: { padding: 6, borderRadius: 8 },
  acceptBtn: { padding: 6, borderRadius: 8 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  staffBubble: { alignSelf: "flex-end", backgroundColor: COLORS.accent },
  customerBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 15 : 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 15, paddingHorizontal: 10 },
  sendBtn: {
    backgroundColor: COLORS.accent,
    padding: 10,
    borderRadius: 8,
  },
  closedBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: COLORS.danger,
    borderTopWidth: 0.5,
    borderColor: "#7F1D1D",
  },
  closedBarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
