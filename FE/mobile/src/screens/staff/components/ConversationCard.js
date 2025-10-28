import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ConversationCard({ item, onPress }) {
  const lastMsg =
    item.lastMessage?.content ||
    item.messages?.[item.messages?.length - 1]?.content ||
    "No messages yet";

  let guestName = "Anonymous Guest";
  if (item.customer?.full_name) guestName = item.customer.full_name;
  else if (item.guest?.name) guestName = item.guest.name;
  else if (item.guestId && !item.guestId.startsWith("GUEST-"))
    guestName = item.guestId;

  const avatarUri = item.customer?.avatar || item.guest?.avatar || null;

  const dotColor =
    item.status === "ACTIVE"
      ? "#22C55E"
      : item.status === "WAITING"
      ? "#FACC15"
      : "#6B7280";

  const time =
    item.lastMessage?.createdAt &&
    new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <TouchableOpacity
      style={styles.messageItem}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.row}>
        {/* 🧍 Avatar + chấm trạng thái */}
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={28} color="#E6EAF2" />
          )}
          {/* 🔵 Chấm trạng thái nằm đè lên avatar */}
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        </View>

        <View style={styles.messageInfo}>
          <View style={styles.topRow}>
            <Text style={styles.senderName} numberOfLines={1}>
              {guestName}
            </Text>
            {time && <Text style={styles.timeText}>{time}</Text>}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMsg}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  messageItem: {
    backgroundColor: "#11161C",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1F2833",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1A1F27",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusDot: {
    position: "absolute",
    bottom: -2, // 🔹 cho nằm thấp ra ngoài một chút
    right: -2, // 🔹 lệch ra ngoài avatar một phần
    width: 18, // 🔹 to hơn (so với 12 cũ)
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#11161C", // 🔹 viền nền cho nổi bật
  },
  messageInfo: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  senderName: {
    color: "#E6EAF2",
    fontSize: 16,
    fontWeight: "600",
    maxWidth: "75%",
  },
  lastMessage: {
    color: "#9AA7B5",
    fontSize: 14,
  },
  timeText: {
    color: "#9AA7B5",
    fontSize: 12,
  },
});
