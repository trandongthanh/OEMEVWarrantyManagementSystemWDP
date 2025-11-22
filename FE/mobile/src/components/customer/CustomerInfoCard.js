import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 🎨 LIGHT THEME COLORS
const COLORS = {
  surface: "#FFFFFF",    // Nền trắng
  border: "#E5E7EB",     // Viền xám nhạt
  text: "#111827",       // Chữ đen
  textMuted: "#6B7280",  // Chữ xám
  accent: "#3B82F6",     // Xanh dương
  avatarBg: "#EFF6FF",   // Nền avatar xanh rất nhạt
};

export default function CustomerInfoCard({ customer }) {
  if (!customer) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.fullName?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{customer.fullName}</Text>
          <Text style={styles.id}>ID: {customer.id}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={18} color={COLORS.accent} />
        <Text style={styles.infoText}>{customer.phone || "No phone"}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={18} color={COLORS.accent} />
        <Text style={styles.infoText}>{customer.email || "No email"}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="home-outline" size={18} color={COLORS.accent} />
        <Text style={styles.infoText}>{customer.address || "No address"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    marginTop: 15,
    // Shadow nhẹ cho nền trắng
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // Đường kẻ mờ ngăn cách header
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.avatarBg, // Nền xanh nhạt
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  id: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
  },
  footer: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "right",
    fontStyle: "italic",
  },
});