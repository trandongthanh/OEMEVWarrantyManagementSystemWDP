import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import io from "socket.io-client";
import { getMyConversations } from "../../services/chatService";
import ConversationCard from "./components/ConversationCard";
import ConversationFilterTabs from "./components/ConversationFilterTabs";

const SOCKET_URL = "http://10.0.2.2:3000";

// 🎨 LIGHT THEME COLORS
const COLORS = {
  bg: "#F3F4F6",
  text: "#111827",
  accent: "#3B82F6",
  textMuted: "#6B7280",
};

export default function StaffMessageListScreen({ route }) {
  const navigation = useNavigation();
  const tokenParam = route?.params?.token;

  const token =
    typeof tokenParam === "object" && tokenParam?.token
      ? tokenParam.token
      : tokenParam;

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("waiting");
  const [counts, setCounts] = useState({ waiting: 0, active: 0, closed: 0 });
  const socketRef = useRef(null);

  const mapFilterToBackendStatus = {
    waiting: "UNASSIGNED",
    active: "ACTIVE",
    closed: "CLOSED",
  };

  const loadMessages = async (status = "waiting") => {
    setLoading(true);
    try {
      const backendStatus = mapFilterToBackendStatus[status];
      const conversations = await getMyConversations(token, backendStatus);

      const filtered = (conversations || []).filter(
        (c) => c.status?.toUpperCase() === backendStatus
      );

      const waitingCount = conversations.filter(
        (c) => c.status?.toUpperCase() === "UNASSIGNED"
      ).length;

      const activeCount = conversations.filter(
        (c) => c.status?.toUpperCase() === "ACTIVE"
      ).length;

      const closedCount = conversations.filter(
        (c) => c.status?.toUpperCase() === "CLOSED"
      ).length;

      setCounts({
        waiting: waitingCount,
        active: activeCount,
        closed: closedCount,
      });

      setMessages(filtered);
    } catch (err) {
      console.error("❌ Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || typeof token !== "string") {
      console.warn("⚠️ Token invalid, cannot connect socket:", token);
      return;
    }

    loadMessages(filter);

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("⚠️ Socket connect error:", err.message);
    });

    socket.on("newMessage", (msg) => {
      console.log("💬 New message:", msg);
      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex(
          (c) => c.id === msg.conversationId || c._id === msg.conversationId
        );
        if (idx !== -1) {
          updated[idx].lastMessage = msg;
          const [chat] = updated.splice(idx, 1);
          return [chat, ...updated];
        }
        return prev;
      });
    });

    socket.on("disconnect", () => console.log("🔴 Socket disconnected"));

    return () => {
      console.log("🧹 Closing socket connection...");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Messages</Text>

        <ConversationFilterTabs
          filter={filter}
          counts={counts}
          onChange={(tab) => {
            setFilter(tab);
            loadMessages(tab);
          }}
        />

        {loading ? (
          <ActivityIndicator color={COLORS.accent} size="large" />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <ConversationCard
                item={item}
                onPress={() =>
                  navigation.navigate("StaffChatScreen", {
                    conversationId: item.id || item._id,
                    token,
                    status: item.status,
                    guest: item.guest,
                  })
                }
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No {filter} conversations found.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  header: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});