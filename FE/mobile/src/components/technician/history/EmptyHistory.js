import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";

export default function EmptyHistory() {
  return (
    <View style={styles.emptyContainer}>
      <Clock size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No history found</Text>
      <Text style={styles.emptySubtitle}>
        Your completed work will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});