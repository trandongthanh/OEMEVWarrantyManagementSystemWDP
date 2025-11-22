import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 🎨 LIGHT THEME
const COLORS = {
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  avatarBg: "#E5E7EB",
};

export default function ConversationCard({ item, onPress }) {
  const lastMsg = item.lastMessage?.content || item.messages?.[item.messages?.length - 1]?.content || "No messages yet";
  
  let guestName = "Anonymous Guest";
  if (item.customer?.full_name) guestName = item.customer.full_name;
  else if (item.guest?.name) guestName = item.guest.name;
  else if (item.guestId && !item.guestId.startsWith("GUEST-")) guestName = item.guestId;

  const avatarUri = item.customer?.avatar || item.guest?.avatar || null;
  const dotColor = item.status === "ACTIVE" ? "#10B981" : item.status === "WAITING" ? "#F59E0B" : "#9CA3AF";

  const time = item.lastMessage?.createdAt && new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <TouchableOpacity style={styles.messageItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={24} color="#9CA3AF" />
          )}
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        </View>

        <View style={styles.messageInfo}>
          <View style={styles.topRow}>
            <Text style={styles.senderName} numberOfLines={1}>{guestName}</Text>
            {time && <Text style={styles.timeText}>{time}</Text>}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>{lastMsg}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  messageItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.avatarBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    position: "relative",
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  statusDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF", // Viền trắng cắt vào avatar
  },
  messageInfo: { flex: 1, justifyContent: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  senderName: { color: COLORS.text, fontSize: 16, fontWeight: "700", maxWidth: "75%" },
  lastMessage: { color: COLORS.textMuted, fontSize: 14 },
  timeText: { color: COLORS.textMuted, fontSize: 12 },
});