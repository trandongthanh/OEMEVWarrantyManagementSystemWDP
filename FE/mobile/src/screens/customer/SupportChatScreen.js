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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// REST
import { startChatByEmail } from "../../services/chatCustomerService";

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
  accent: "#3B82F6",
  customer: "#1E293B",
  support: "#2563EB",
};

export default function SupportChatScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("email"); // "email" | "chat"

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);

  const flatListRef = useRef(null);

  // Auto scroll khi có message mới
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, [messages]);

  /**
   * 1️⃣ User nhập email → bắt đầu chat
   */
  const startChat = async () => {
    if (!email.trim()) return;

    try {
      const data = await startChatByEmail(email.trim());

      setConversationId(data.conversationId);
      setStage("chat");

      // Welcome message
      setMessages([
        {
          id: "welcome",
          sender: "support",
          message: "Xin chào! Tôi có thể hỗ trợ gì cho bạn hôm nay?",
        },
      ]);

      // Init socket
      initSocket(null);

      // Join room
      joinConversation(data.conversationId);

      // Listen realtime
      onNewMessage((msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } catch (err) {
      console.log("❌ Init chat error:", err);
    }
  };

  /**
   * 2️⃣ Gửi tin nhắn
   */
  const sendMsg = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: "customer",
      message: input.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);

    sendMessageSocket({
      conversationId,
      sender: email,
      message: input.trim(),
      imageUrl: null,
    });

    setInput("");
  };

  const renderMessage = ({ item }) => {
    const mine = item.sender === "customer";

    return (
      <View
        style={[
          styles.bubbleWrapper,
          { alignItems: mine ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.bubble,
            mine ? styles.customerBubble : styles.supportBubble,
          ]}
        >
          <Text style={styles.bubbleText}>{item.message}</Text>
        </View>
      </View>
    );
  };

  // =============================================
  // UI
  // =============================================

  if (stage === "email")
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emailBox}>
          <Text style={styles.title}>Start a Conversation</Text>

          <TextInput
            style={styles.emailInput}
            placeholder="your.email@example.com"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.startBtn} onPress={startChat}>
            <Text style={styles.startBtnText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Customer Support</Text>

        <Ionicons name="headset-outline" size={22} color={COLORS.accent} />
      </View>

      {/* LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        style={{ flex: 1 }}
      />

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputBarWrapper}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textMuted}
              value={input}
              onChangeText={setInput}
            />

            <TouchableOpacity onPress={sendMsg} style={styles.sendBtn}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // EMAIL BOX
  emailBox: {
    marginTop: 80,
    padding: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  emailInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "#1F2833",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  startBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  // HEADER
  header: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#1F2833",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },

  // CHAT
  bubbleWrapper: {
    marginVertical: 4,
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  bubbleText: {
    color: "#fff",
    fontSize: 15,
  },
  customerBubble: {
    backgroundColor: COLORS.customer,
  },
  supportBubble: {
    backgroundColor: COLORS.support,
  },

  inputBarWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  inputBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#1F2833",
  },
  input: {
    flex: 1,
    color: COLORS.text,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginLeft: 8,
  },
});
