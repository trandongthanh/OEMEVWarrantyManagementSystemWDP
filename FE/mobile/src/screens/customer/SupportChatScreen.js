// src/screens/customer/SupportChatScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// REST
import {
  startAnonymousChat,
  startNewChatWithEmail,
  resumeChatByEmail,
  getConversationMessages,
} from "../../services/chatCustomerService";

// SOCKET
import {
  initSocket,
  joinConversation,
  sendMessageSocket,
  onNewMessage,
  disconnectSocket,
} from "../../services/socketService";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  blue: "#3B82F6",
  bubbleUser: "#3B82F6",
  bubbleStaff: "#1E293B",
  danger: "#EF4444",
};

const SERVICE_CENTER_ID = "REPLACE_WITH_REAL_SERVICE_CENTER_ID";

export default function SupportChatScreen({ navigation }) {
  const [stage, setStage] = useState("select");

  const [emailForNew, setEmailForNew] = useState("");
  const [emailForResume, setEmailForResume] = useState("");

  const [conversationId, setConversationId] = useState(null);
  const [guestId, setGuestId] = useState(null);
  const [currentEmail, setCurrentEmail] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [loadingMode, setLoadingMode] = useState(null);
  const [error, setError] = useState("");

  const [isClosed, setIsClosed] = useState(false);

  const flatListRef = useRef(null);

  //--------------------------------------------------
  // AUTO SCROLL
  //--------------------------------------------------
  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  //--------------------------------------------------
  // HELPER – detect image
  //--------------------------------------------------
  const isImageUrl = (value) => {
    if (!value || typeof value !== "string") return false;
    return value.match(/\.(png|jpg|jpeg|webp|gif)$/i);
  };

  //--------------------------------------------------
  // SOCKET
  //--------------------------------------------------
  const connectSocketForConversation = (convId) => {
    initSocket(null);
    joinConversation(convId);

    console.log("🔌 Socket connected for conversation:", convId);

    onNewMessage((msg) => {
      console.log("🔥 NEW SOCKET EVENT:", msg);

      // LOG trạng thái nếu server có gửi status
      if (msg.conversationStatus) {
        console.log("📌 CONVERSATION STATUS:", msg.conversationStatus);
      }
      if (msg.status) {
        console.log("📌 STATUS FIELD:", msg.status);
      }

      // detect closed chat
      const isChatClosed =
        msg.systemType === "CHAT_CLOSED" ||
        msg.type === "CHAT_CLOSED" ||
        msg.event === "CHAT_CLOSED" ||
        msg.status === "CLOSED" ||
        msg.conversationStatus === "CLOSED" ||
        (msg.action && msg.action.toUpperCase() === "CLOSED");

      if (isChatClosed) {
        console.log("🔒 CHAT CLOSED DETECTED");
        setIsClosed(true);
        setMessages((prev) => [
          ...prev,
          {
            id: "closed_notice",
            sender: "system",
            message: "🔒 Chat has been closed by support.",
          },
        ]);
        return;
      }

      // normal message
      const isImg = isImageUrl(msg.content);
      const normalized = {
        id: msg.id,
        message: isImg ? null : msg.content,
        imageUrl: msg.imageUrl || msg.image_url || (isImg ? msg.content : null),
        sender: msg.senderType === "STAFF" ? "support" : "customer",
      };

      setMessages((prev) => [...prev, normalized]);
    });
  };

  //--------------------------------------------------
  // START ANONYMOUS CHAT
  //--------------------------------------------------
  const handleStartAnonymous = async () => {
    try {
      setLoadingMode("anon");
      setIsClosed(false);

      console.log("➡ START ANONYMOUS CHAT");

      const session = await startAnonymousChat(SERVICE_CENTER_ID);
      console.log("SESSION:", session);

      setConversationId(session.conversationId);
      setGuestId(session.guestId);
      setCurrentEmail(null);
      setStage("chat");

      const history = await getConversationMessages(session.conversationId);
      console.log("📜 HISTORY:", history);

      setMessages(
        history.map((m) => ({
          ...m,
          sender: m.sender === "STAFF" ? "support" : "customer",
          imageUrl:
            m.imageUrl ||
            m.image_url ||
            (isImageUrl(m.content) ? m.content : null),
          message: isImageUrl(m.content) ? null : m.content,
        }))
      );

      connectSocketForConversation(session.conversationId);
    } catch (err) {
      setError(err?.message || "Unable to start anonymous chat.");
    } finally {
      setLoadingMode(null);
    }
  };

  //--------------------------------------------------
  // START NEW CHAT BY EMAIL
  //--------------------------------------------------
  const handleStartNewByEmail = async () => {
    if (!emailForNew.trim()) return setError("Please enter email.");

    try {
      setLoadingMode("new");
      setIsClosed(false);

      console.log("➡ START NEW CHAT WITH EMAIL:", emailForNew.trim());

      const session = await startNewChatWithEmail(
        SERVICE_CENTER_ID,
        emailForNew.trim()
      );
      console.log("SESSION:", session);

      setConversationId(session.conversationId);
      setCurrentEmail(emailForNew.trim());
      setGuestId(null);
      setStage("chat");

      const history = await getConversationMessages(session.conversationId);
      console.log("📜 HISTORY:", history);

      setMessages(
        history.map((m) => ({
          ...m,
          sender: m.sender === "STAFF" ? "support" : "customer",
          imageUrl:
            m.imageUrl ||
            m.image_url ||
            (isImageUrl(m.content) ? m.content : null),
          message: isImageUrl(m.content) ? null : m.content,
        }))
      );

      connectSocketForConversation(session.conversationId);
    } catch (err) {
      setError(err?.message || "Cannot start new chat.");
    } finally {
      setLoadingMode(null);
    }
  };

  //--------------------------------------------------
  // RESUME CHAT BY EMAIL
  //--------------------------------------------------
  const handleResumeByEmail = async () => {
    if (!emailForResume.trim()) return setError("Please enter email.");

    try {
      setLoadingMode("resume");
      setIsClosed(false);

      console.log("➡ RESUME CHAT:", emailForResume.trim());

      const session = await resumeChatByEmail(emailForResume.trim());
      console.log("SESSION:", session);

      setConversationId(session.conversationId);
      setCurrentEmail(emailForResume.trim());
      setGuestId(null);
      setStage("chat");

      const history = await getConversationMessages(session.conversationId);
      console.log("📜 HISTORY:", history);

      setMessages(
        history.map((m) => ({
          ...m,
          sender: m.sender === "STAFF" ? "support" : "customer",
          imageUrl:
            m.imageUrl ||
            m.image_url ||
            (isImageUrl(m.content) ? m.content : null),
          message: isImageUrl(m.content) ? null : m.content,
        }))
      );

      connectSocketForConversation(session.conversationId);
    } catch (err) {
      setError(err?.message || "Cannot resume chat.");
    } finally {
      setLoadingMode(null);
    }
  };

  //--------------------------------------------------
  // SEND MESSAGE
  //--------------------------------------------------
  const handleSendMessage = () => {
    if (isClosed) {
      console.log("❌ Cannot send message — chat closed.");
      return;
    }
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    console.log("📤 SEND:", text);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "customer", message: text },
    ]);

    sendMessageSocket({
      conversationId,
      senderId: guestId || currentEmail,
      senderType: "GUEST",
      content: text,
      imageUrl: null,
    });
  };

  //--------------------------------------------------
  // RENDER MESSAGE
  //--------------------------------------------------
  const renderMessage = ({ item }) => {
    if (item.sender === "system") {
      return (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <Text style={{ color: COLORS.textMuted, fontStyle: "italic" }}>
            {item.message}
          </Text>
        </View>
      );
    }

    const isMine = item.sender === "customer";

    return (
      <View
        style={[
          styles.msgRow,
          { justifyContent: isMine ? "flex-end" : "flex-start" },
        ]}
      >
        {!isMine && (
          <View style={styles.avatarIcon}>
            <Ionicons
              name="person-circle-outline"
              size={28}
              color={COLORS.textMuted}
            />
          </View>
        )}

        {item.imageUrl ? (
          <View
            style={[
              styles.imageBubble,
              isMine ? styles.bubbleMine : styles.bubbleStaff,
            ]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.imageMessage}
            />
          </View>
        ) : (
          <View
            style={[
              styles.msgBubble,
              isMine ? styles.bubbleMine : styles.bubbleStaff,
            ]}
          >
            <Text style={styles.msgText}>{item.message}</Text>
          </View>
        )}
      </View>
    );
  };

  //--------------------------------------------------
  // SELECT UI
  //--------------------------------------------------
  if (stage === "select") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSimple}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Support</Text>
          <Ionicons name="headset-outline" size={22} color={COLORS.blue} />
        </View>

        <View style={styles.selectWrapper}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chat ngay (không email)</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleStartAnonymous}
            >
              <Text style={styles.primaryBtnText}>Start Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chat mới bằng email</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="email@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={emailForNew}
              onChangeText={setEmailForNew}
            />
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleStartNewByEmail}
            >
              <Text style={styles.secondaryBtnText}>Start New Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tiếp tục chat cũ</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="email@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={emailForResume}
              onChangeText={setEmailForResume}
            />
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={handleResumeByEmail}
            >
              <Text style={styles.linkBtnText}>Continue Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  //--------------------------------------------------
  // CHAT UI
  //--------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.text}
              style={{ marginRight: 12 }}
            />
          </TouchableOpacity>

          <Ionicons
            name="person-circle-outline"
            size={40}
            color={COLORS.text}
            style={{ marginRight: 10 }}
          />

          <View>
            <Text style={styles.headerTitle}>Support</Text>
            <Text style={styles.headerSubtitle}>
              {currentEmail || "Anonymous Guest"}
            </Text>
          </View>
        </View>

        <Ionicons name="headset-outline" size={24} color={COLORS.blue} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        style={{ flex: 1 }}
      />

      {isClosed && (
        <View style={{ padding: 10, alignItems: "center" }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
            🔒 Chat has been closed by support. You can no longer send messages.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputBarWrapper}>
          <View style={styles.inputBar}>
            <TextInput
              editable={!isClosed}
              style={[styles.chatInput, isClosed && { opacity: 0.4 }]}
              placeholder="Message..."
              placeholderTextColor={COLORS.textMuted}
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity disabled={isClosed} onPress={handleSendMessage}>
              <Ionicons
                name="send"
                size={20}
                color={isClosed ? COLORS.textMuted : COLORS.blue}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --------------------------------------
// STYLES
// --------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  headerSimple: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatHeader: {
    height: 70,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.6,
    borderColor: "#1F2833",
  },

  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },

  selectWrapper: { padding: 16 },
  errorText: { color: COLORS.danger, marginBottom: 8 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1F2833",
    marginBottom: 14,
  },

  cardTitle: { color: COLORS.text, fontWeight: "700", marginBottom: 8 },

  inputBox: {
    backgroundColor: "#0B0F14",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1F2833",
    color: COLORS.text,
    padding: 10,
    marginBottom: 8,
  },

  primaryBtn: {
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryBtnText: { color: "#fff", fontWeight: "700" },

  secondaryBtn: {
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryBtnText: { color: "#fff", fontWeight: "600" },

  linkBtn: { marginTop: 4 },
  linkBtnText: { color: COLORS.blue, textDecorationLine: "underline" },

  msgRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },

  avatarIcon: {
    marginRight: 6,
  },

  msgBubble: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },

  bubbleMine: {
    backgroundColor: COLORS.bubbleUser,
    borderBottomRightRadius: 4,
  },

  bubbleStaff: {
    backgroundColor: COLORS.bubbleStaff,
    borderBottomLeftRadius: 4,
  },

  msgText: {
    color: "#fff",
    fontSize: 15,
  },

  imageBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.bubbleStaff,
  },

  imageMessage: {
    width: 240,
    height: 240,
    resizeMode: "cover",
  },

  inputBarWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
  },

  inputBar: {
    backgroundColor: "#1A222C",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  chatInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    marginRight: 10,
  },
});
