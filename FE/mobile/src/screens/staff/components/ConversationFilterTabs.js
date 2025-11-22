import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 🎨 LIGHT THEME
const COLORS = {
  accent: "#3B82F6",
  text: "#111827",
  textMuted: "#6B7280",
  bg: "#E5E7EB", // Màu nền của thanh tab
  activeBg: "#FFFFFF", // Màu nền của tab đang chọn
};

export default function ConversationFilterTabs({ filter, counts, onChange }) {
  const tabs = [
    { key: "waiting", icon: "time-outline", label: "Waiting" },
    { key: "active", icon: "chatbubbles-outline", label: "Active" },
    { key: "closed", icon: "checkmark-circle-outline", label: "Closed" },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = filter === tab.key;
        const count = counts[tab.key] || 0;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            activeOpacity={0.9}
            onPress={() => onChange(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              // Active: màu xanh, Inactive: màu xám
              color={isActive ? COLORS.accent : COLORS.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}{" "}
              <Text style={{ fontSize: 11, opacity: 0.7 }}>({count})</Text>
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.bg, // Nền xám
    borderRadius: 12,
    padding: 4,
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  tabItemActive: {
    backgroundColor: COLORS.activeBg, // Nền trắng khi active
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLORS.accent, // Chữ xanh khi active
    fontWeight: "700",
  },
});