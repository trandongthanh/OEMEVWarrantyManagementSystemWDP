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
  const [messages, setMessages] = useState([
    {
      id: "1",
      from: "support",
      text: "Xin chào! 👋\nTôi có thể hỗ trợ gì cho bạn hôm nay?",
    },
  ]);

  const [input, setInput] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      from: "customer",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Auto reply (demo)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_bot",
          from: "support",
          text: "Cảm ơn bạn! Hệ thống sẽ phản hồi sớm.",
        },
      ]);
    }, 900);
  };

  const renderMessage = ({ item }) => {
    const isCustomer = item.from === "customer";

    return (
      <View
        style={[
          styles.bubbleWrapper,
          { alignItems: isCustomer ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.bubble,
            isCustomer ? styles.customerBubble : styles.supportBubble,
          ]}
        >
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

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

      {/* CHAT LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        style={{ flex: 1 }}
      />

      {/* INPUT BAR */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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

            <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
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

  // CHAT BUBBLES
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
    lineHeight: 20,
  },
  customerBubble: {
    backgroundColor: COLORS.customer,
    borderBottomRightRadius: 4,
  },
  supportBubble: {
    backgroundColor: COLORS.support,
    borderBottomLeftRadius: 4,
  },

  // INPUT BAR
  inputBarWrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 15 : 10,
    backgroundColor: COLORS.bg,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2833",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: COLORS.accent,
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
