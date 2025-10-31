import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatCard({ icon, label, value, color, IconComponent }) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statHeader}>
        <IconComponent color="#FFF" size={20} style={{ opacity: 0.8 }} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    minHeight: 90,
    justifyContent: "space-between",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    lineHeight: 16,
  },
});