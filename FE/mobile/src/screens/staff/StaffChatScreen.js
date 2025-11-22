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
import { jwtDecode } from "jwt-decode";

import {
  initSocket,
  joinConversation,
  sendMessageSocket,
  onNewMessage,
  disconnectSocket,
} from "../../services/socketService";

import {
  getMessagesByConversationId,
  closeConversation,
  acceptAnonymousChat,
} from "../../services/chatService";
import ConfirmCloseModal from "../../components/ConfirmCloseModal";

// 🎨 LIGHT THEME COLORS
const COLORS = {
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  border: "#E5E7EB",
  danger: "#EF4444",
  success: "#10B981",
  waiting: "#F59E0B",
  inputBg: "#F9FAFB"
};

export default function StaffChatScreen({ route, navigation }) {
  const { conversationId, token, status: initialStatus, guest } = route.params;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatStatus, setChatStatus] = useState(initialStatus);
  const [closing, setClosing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const flatListRef = useRef(null);

  let staffId = "";
  try {
    const decoded = jwtDecode(token);
    staffId =
      decoded?.userId?.toString() ||
      decoded?.staffId?.toString() ||
      decoded?.id?.toString() ||
      "";
    console.log("👤 Decoded staffId:", staffId);
  } catch (err) {
    console.warn("⚠️ Token decode failed:", err.message);
  }

  useEffect(() => {
    const socket = initSocket(token);
    joinConversation(conversationId);

    onNewMessage((msg) => {
      console.log("📩 New message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => disconnectSocket();
  }, [conversationId, token]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await getMessagesByConversationId(conversationId, token);
        setMessages(res || []);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  const handleSend = () => {
    if (!input.trim() || chatStatus !== "ACTIVE") return;
    if (!staffId) {
      console.warn("⚠️ Missing senderId");
      return;
    }

    const newMsg = {
      conversationId,
      senderId: staffId,
      senderType: "STAFF",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    sendMessageSocket(newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const getStatusColor = () => {
    switch (chatStatus) {
      case "ACTIVE": return COLORS.success;
      case "WAITING": return COLORS.waiting;
      default: return COLORS.danger;
    }
  };

  const handleAcceptChat = async () => {
    try {
      setAccepting(true);
      await acceptAnonymousChat(conversationId, token);
      setChatStatus("ACTIVE");
    } catch (err) {
      console.error("❌ Error accepting chat:", err.response?.data || err);
    } finally {
      setAccepting(false);
    }
  };

  const handleConfirmClose = async () => {
    try {
      setClosing(true);
      await closeConversation(conversationId, token);
      setChatStatus("CLOSED");
      setShowConfirm(false);
    } catch (err) {
      console.error("❌ Error closing chat:", err.response?.data || err);
    } finally {
      setClosing(false);
    }
  };

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

  const displayName = guest?.full_name || guest?.name || "Anonymous Guest";
  const avatarSource = guest?.avatar ? { uri: guest.avatar } : null;
  const avatarLetter = displayName?.charAt(0)?.toUpperCase() || "?";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
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

        {chatStatus === "ACTIVE" && (
          <TouchableOpacity
            onPress={() => setShowConfirm(true)}
            disabled={closing}
            style={styles.closeBtn}
          >
            <Ionicons
              name="lock-closed-outline"
              size={24}
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
              size={24}
              color={accepting ? COLORS.textMuted : COLORS.success}
            />
          </TouchableOpacity>
        )}
      </View>

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
          contentContainerStyle={{ padding: 12, paddingBottom: 90 }}
        />
      )}

      {/* INPUT */}
      {chatStatus === "CLOSED" ? (
        <View style={styles.closedBar}>
          <Ionicons name="lock-closed" size={16} color="#fff" />
          <Text style={styles.closedBarText}>This conversation is closed</Text>
        </View>
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
            editable={chatStatus === "ACTIVE"}
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

      <ConfirmCloseModal
        visible={showConfirm}
        closing={closing}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarText: { color: COLORS.accent, fontWeight: "700", fontSize: 16 },
  statusDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: { color: COLORS.text, fontWeight: "600", fontSize: 16, marginLeft: 10 },
  closeBtn: { padding: 8 },
  acceptBtn: { padding: 8 },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
  },
  staffBubble: { 
    alignSelf: "flex-end", 
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 2
  },
  customerBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  input: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: 15, 
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10
  },
  sendBtn: { 
    backgroundColor: COLORS.accent, 
    padding: 10, 
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closedBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: COLORS.danger,
    borderTopWidth: 0.5,
    borderColor: "#EF4444",
  },
  closedBarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});