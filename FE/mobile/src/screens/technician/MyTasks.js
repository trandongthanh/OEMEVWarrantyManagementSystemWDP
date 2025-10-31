// src/screens/technician/MyTasks.js
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
import MyTasksHeader from "../../components/technician/tasks/MyTasksHeader";
import MyTasksItem from "../../components/technician/tasks/MyTasksItem";
import EmptyTasks from "../../components/technician/tasks/EmptyTasks";

// --- Component chính ---
export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const isFocused = useIsFocused();

  // --- Hàm tải dữ liệu ---
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await technicianService.getAssignedRecords();
      setTasks(response.data?.records?.records || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Tải lại khi focus ---
  useEffect(() => {
    if (isFocused) {
      loadTasks();
    }
  }, [isFocused]);

  // --- Lọc danh sách ---
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.vin?.toLowerCase().includes(query) ||
          task.vehicle?.model?.name?.toLowerCase().includes(query) ||
          task.guaranteeCases?.some((gc) =>
            gc.contentGuarantee?.toLowerCase().includes(query)
          )
      );
    }
    return filtered;
  }, [tasks, searchQuery, statusFilter]);

  // --- Tính toán stats ---
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: tasks.length,
      urgent: tasks.filter(
        (t) => t.status === "IN_REPAIR" || t.status === "WAITING_FOR_PARTS"
      ).length,
      today: tasks.filter(
        (t) => new Date(t.checkInDate).toDateString() === today
      ).length,
      pending: tasks.filter((t) => t.status === "CHECKED_IN").length,
    };
  }, [tasks]);

  // --- Render Item cho FlatList ---
  const renderItem = ({ item }) => <MyTasksItem item={item} />;

  // --- Render UI chính ---
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item, index) =>
          String(item.vehicleProcessingRecordId || item.vin || index)
        }
        renderItem={renderItem}
        ListHeaderComponent={
          <MyTasksHeader
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        }
        ListEmptyComponent={
          !loading && (
            <EmptyTasks
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadTasks}
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