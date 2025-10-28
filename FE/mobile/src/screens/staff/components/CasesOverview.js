import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getProcessingRecords } from "../../../services/processingRecordService";
import { useFocusEffect } from "@react-navigation/native"; // ✅ thêm hook này

const COLORS = {
  surface: "#11161C",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
};

// 🧱 Component con hiển thị 1 ô thống kê
const StatCard = ({ icon, color, title, subtitle, value }) => (
  <View style={[styles.statCard, { borderColor: color }]}>
    <View style={[styles.iconBox, { backgroundColor: color + "25" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

// 📊 Component chính
export default function CasesOverview() {
  const [stats, setStats] = useState({
    total: 0,
    checked_in: 0,
    in_diagnosis: 0,
    waiting_for_parts: 0,
    in_repair: 0,
    completed: 0,
    cancelled: 0,
  });
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
        {
          total: 0,
          checked_in: 0,
          in_diagnosis: 0,
          waiting_for_parts: 0,
          in_repair: 0,
          completed: 0,
          cancelled: 0,
        }
      );

      setStats(counts);
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      Toast.show({
        type: "error",
        text1: "Unable to load processing record stats.",
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // ✅ Mỗi lần tab được focus -> tự reload lại API
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  // ⏱️ Gọi lần đầu khi mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={{ marginTop: 25, marginBottom: 40 }}>
      <Text style={styles.sectionTitle}>Cases Overview</Text>

      {loadingStats ? (
        <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.statsContainer}>
          <StatCard
            icon="document-text-outline"
            color="#60A5FA"
            title="Total"
            subtitle="All records"
            value={stats.total}
          />
          <StatCard
            icon="log-in-outline"
            color="#FACC15"
            title="Checked In"
            subtitle="Received vehicles"
            value={stats.checked_in}
          />
          <StatCard
            icon="search-outline"
            color="#F59E0B"
            title="In Diagnosis"
            subtitle="Under inspection"
            value={stats.in_diagnosis}
          />
          <StatCard
            icon="cube-outline"
            color="#FB923C"
            title="Waiting Parts"
            subtitle="Pending parts"
            value={stats.waiting_for_parts}
          />
          <StatCard
            icon="build-outline"
            color="#34D399"
            title="In Repair"
            subtitle="Being repaired"
            value={stats.in_repair}
          />
          <StatCard
            icon="checkmark-done-outline"
            color="#22C55E"
            title="Completed"
            subtitle="Finished cases"
            value={stats.completed}
          />
          <StatCard
            icon="close-circle-outline"
            color="#EF4444"
            title="Cancelled"
            subtitle="Stopped cases"
            value={stats.cancelled}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
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
    borderWidth: 1.3,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    width: "48%",
  },
  iconBox: {
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  statTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
  },
  statSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
