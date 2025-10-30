// src/screens/manager/components/ManagerHeader.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0B0F14", // ✅ đồng bộ với background chính
  text: "#E6EAF2",
  accent: "#3B82F6",
};

export default function ManagerHeader({ title, icon = "briefcase-outline" }) {
  return (
    <View style={styles.header}>
      <Ionicons name={icon} size={20} color={COLORS.accent} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.bg, // ✅ cùng tone với màn hình
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
});
