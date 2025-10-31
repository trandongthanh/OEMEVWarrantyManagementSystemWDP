import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import technicianService from "../../services/technicianService";
import { useIsFocused } from "@react-navigation/native";

// --- Import component con ---
import HistoryHeader from "../../components/technician/history/HistoryHeader";
import HistoryItem from "../../components/technician/history/HistoryItem";
import EmptyHistory from "../../components/technician/history/EmptyHistory";

// --- Component chính ---
export default function WorkHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const isFocused = useIsFocused();

  // --- Hàm tải dữ liệu ---
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await technicianService.getAssignedRecords();
      const recordsData = response.data?.records?.records || [];
      const completedTasks = recordsData.filter(
        (record) =>
          record.status === "COMPLETED" || record.status === "CANCELLED"
      );
      setHistory(completedTasks);
    } catch (err) { 
      console.error("Failed to load work history:", err);
    } 
    finally {
      setLoading(false);
    }
  }, []);

  // --- Tải lại khi focus ---
  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  // --- Lọc danh sách ---
  const filteredHistory = useMemo(() => {
    let filtered = [...history];
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.vin?.toLowerCase().includes(query) ||
          task.vehicle?.model?.name?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [history, searchQuery, statusFilter]);

  // --- Tính toán stats ---
  const stats = useMemo(() => {
    const total = history.length;
    const completed = history.filter((r) => r.status === "COMPLETED").length;
    const now = new Date();
    const thisMonth = history.filter((r) => {
      const date = new Date(r.checkInDate);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, thisMonth, successRate };
  }, [history]);

  // --- Render Item ---
  const renderItem = ({ item }) => <HistoryItem item={item} />;

  // --- Render UI chính ---
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.vehicleProcessingRecordId || item.vin}
        renderItem={renderItem}
        ListHeaderComponent={
          <HistoryHeader
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        }
        ListEmptyComponent={!loading && <EmptyHistory />}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadHistory}
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContentContainer: {
    padding: 12,
    paddingBottom: 32,
  },
});