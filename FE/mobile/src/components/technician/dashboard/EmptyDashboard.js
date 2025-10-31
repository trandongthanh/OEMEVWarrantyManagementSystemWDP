import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ClipboardList } from "lucide-react-native";

export default function EmptyDashboard() {
  return (
    <View style={styles.emptyContainer}>
      <ClipboardList size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No assigned cases</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any cases assigned to you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});