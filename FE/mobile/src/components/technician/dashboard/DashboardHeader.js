import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  ClipboardList,
  Wrench,
  Activity,
  TrendingUp,
} from "lucide-react-native";
import StatCard from "./StatCard";

export default function DashboardHeader({ total, active, completed }) {
  const stats = [
    {
      label: "Total Assigned",
      value: total,
      color: "#3B82F6",
      IconComponent: ClipboardList,
    },
    {
      label: "Active Cases",
      value: active,
      color: "#8B5CF6",
      IconComponent: Activity,
    },
    {
      label: "Completed",
      value: completed,
      color: "#10B981",
      IconComponent: TrendingUp,
    },
  ];

  return (
    <>
      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Assigned Cases</Text>
          <Text style={styles.subtitle}>Warranty cases assigned to you</Text>
        </View>
        <View style={styles.headerIcon}>
          <Wrench size={20} color="#2563EB" />
        </View>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            IconComponent={stat.IconComponent}
          />
        ))}
      </View>

      <Text style={styles.listTitle}>All Cases</Text>
    </>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
});