import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getProcessingRecords } from "../../../services/processingRecordService";
import { useFocusEffect } from "@react-navigation/native";

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
};

// 🧱 Component con
const StatCard = ({ icon, color, title, subtitle, value }) => (
  // Dùng color + '15' cho background nhẹ, border mỏng
  <View style={[styles.statCard, { borderColor: COLORS.border, borderBottomColor: color, borderBottomWidth: 3 }]}>
    <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export default function CasesOverview() {
  const [stats, setStats] = useState({ total: 0, checked_in: 0, in_diagnosis: 0, waiting_for_parts: 0, in_repair: 0, completed: 0, cancelled: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getProcessingRecords(1, 1000);
      const records = res?.data?.records?.records || [];
      const counts = records.reduce(
        (acc, r) => {
          const status = (r.status || "").trim().toUpperCase();
          acc.total += 1;
          if (status === "CHECKED_IN") acc.checked_in += 1;
          else if (status === "IN_DIAGNOSIS") acc.in_diagnosis += 1;
          else if (status === "WAITING_FOR_PARTS") acc.waiting_for_parts += 1;
          else if (status === "IN_REPAIR") acc.in_repair += 1;
          else if (status === "COMPLETED") acc.completed += 1;
          else if (status === "CANCELLED") acc.cancelled += 1;
          return acc;
        },
        { total: 0, checked_in: 0, in_diagnosis: 0, waiting_for_parts: 0, in_repair: 0, completed: 0, cancelled: 0 }
      );
      setStats(counts);
    } catch (err) {
      Toast.show({ type: "error", text1: "Unable to load stats." });
    } finally {
      setLoadingStats(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));
  useEffect(() => { fetchStats(); }, []);

  return (
    <View style={{ marginTop: 24, marginBottom: 40 }}>
      <Text style={styles.sectionTitle}>Cases Overview</Text>

      {loadingStats ? (
        <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.statsContainer}>
          <StatCard icon="document-text-outline" color="#3B82F6" title="Total" subtitle="All records" value={stats.total} />
          <StatCard icon="log-in-outline" color="#EAB308" title="Checked In" subtitle="Received" value={stats.checked_in} />
          <StatCard icon="search-outline" color="#F97316" title="In Diagnosis" subtitle="Inspecting" value={stats.in_diagnosis} />
          <StatCard icon="cube-outline" color="#8B5CF6" title="Waiting Parts" subtitle="Pending" value={stats.waiting_for_parts} />
          <StatCard icon="build-outline" color="#06B6D4" title="In Repair" subtitle="Repairing" value={stats.in_repair} />
          <StatCard icon="checkmark-done-outline" color="#22C55E" title="Completed" subtitle="Done" value={stats.completed} />
          <StatCard icon="close-circle-outline" color="#EF4444" title="Cancelled" subtitle="Stopped" value={stats.cancelled} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: "48%",
    borderWidth: 1,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBox: {
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  statTitle: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  statSubtitle: { color: COLORS.textMuted, fontSize: 11 },
  statValue: { fontSize: 18, fontWeight: "700", marginLeft: "auto" },
});