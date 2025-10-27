import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  accent: "#3B82F6",
  textMuted: "#9AA7B5",
  white: "#FFFFFF",
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
              color={isActive ? COLORS.white : COLORS.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}{" "}
              <Text style={{ fontSize: 12, opacity: 0.8 }}>({count})</Text>
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
    backgroundColor: "#1A222C",
    borderRadius: 14,
    padding: 4,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  tabItemActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
