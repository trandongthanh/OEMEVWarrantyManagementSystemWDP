import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Package } from "lucide-react-native";

export default function EmptyParts({ searchQuery }) {
  return (
    <View style={styles.emptyContainer}>
      <Package size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>No components available</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Try adjusting your search"
          : "Select a vehicle and category."}
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