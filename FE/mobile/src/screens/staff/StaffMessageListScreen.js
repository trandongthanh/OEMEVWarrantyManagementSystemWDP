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

const COLORS = {
  bg: "#0B0F14",
  text: "#E6EAF2",
  accent: "#3B82F6",
  textMuted: "#9AA7B5",
};

export default function StaffMessageListScreen({ route }) {
  const navigation = useNavigation();
  const token = route?.params?.token;
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("waiting");
  const [counts, setCounts] = useState({ waiting: 0, active: 0, closed: 0 });
  const socketRef = useRef(null);

  /** 🧩 Load danh sách hội thoại và đếm số lượng theo trạng thái */
  const loadMessages = async (status = "waiting") => {
    setLoading(true);
    try {
      const upperStatus = status.toUpperCase();
      const conversations = await getMyConversations(token, upperStatus);

      const filtered = (conversations || []).filter(
        (c) => c.status?.toUpperCase() === upperStatus
      );

      const waitingCount = conversations.filter(
        (c) => c.status?.toUpperCase() === "WAITING"
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

  /** 🧩 Kết nối socket & load ban đầu */
  useEffect(() => {
    if (!token) return;

    loadMessages(filter);

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current.on("newMessage", (msg) => {
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

    return () => socketRef.current?.disconnect();
  }, [token]);

  /** 🧩 Render */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Messages</Text>

        {/* Bộ lọc trạng thái */}
        <ConversationFilterTabs
          filter={filter}
          counts={counts}
          onChange={(tab) => {
            setFilter(tab);
            loadMessages(tab);
          }}
        />

        {/* Danh sách hội thoại */}
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
                    conversationId: item.conversationId || item._id || item.id,
                    token,
                    status: item.status, // ✅ truyền status sang màn chat
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
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});
