import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Clock,
  CheckCircle,
  Calendar,
  User,
  Car,
  Search,
  X,
  FileText,
  TrendingUp,
} from "lucide-react-native";
import technicianService from "../../services/technicianService";
import { useIsFocused } from "@react-navigation/native";

// --- Cấu hình Status ---
const statusConfig = {
  COMPLETED: { label: "Completed", icon: CheckCircle, color: "#16A34A" },
  CANCELLED: { label: "Cancelled", icon: X, color: "#DC2626" },
};
const STATUS_OPTIONS = [
    { label: "All Status", value: "ALL" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
];

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
    } finally {
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
  const RenderHistoryItem = ({ item }) => {
    const statusInfo = statusConfig[item.status] || {
      label: "Unknown",
      icon: CheckCircle,
      color: "#4B5563",
    };
    const StatusIcon = statusInfo.icon;

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={styles.taskTitleRow}>
              <Car size={16} color="#4B5563" />
              <Text style={styles.taskTitle} numberOfLines={1}>
                 {item.vehicle?.model?.name ?? 'Unknown Model'}
              </Text>
            </View>
            <Text style={styles.taskSubtitle}>({item.vin ?? 'No VIN'})</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusInfo.color}1A` },
            ]}
          >
            <StatusIcon size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]} numberOfLines={1}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        <View style={styles.taskMetaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {new Date(item.checkInDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {item.odometer?.toLocaleString() ?? 'N/A'} km
            </Text>
          </View>
          <View style={styles.metaItem}>
            <User size={14} color="#6B7280" />
            <Text style={styles.metaText} numberOfLines={1}>
               {item.createdByStaff?.name ?? 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // --- Render Stat Card ---
  const StatCard = ({ icon, label, value, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}1A` }]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // --- Render UI chính ---
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.vehicleProcessingRecordId || item.vin}
        renderItem={({ item }) => <RenderHistoryItem item={item} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Work History</Text>
            <Text style={styles.subtitle}>
              Review your complete work history
            </Text>

            <View style={styles.statsRow}>
              <StatCard
                icon={<FileText size={20} color="#8B5CF6" />}
                label="Total"
                value={stats.total}
                color="#8B5CF6"
              />
              <StatCard
                icon={<CheckCircle size={20} color="#10B981" />}
                label="Completed"
                value={stats.completed}
                color="#10B981"
              />
              <StatCard
                icon={<Calendar size={20} color="#3B82F6" />}
                label="This Month"
                value={stats.thisMonth}
                color="#3B82F6"
              />
              <StatCard
                icon={<TrendingUp size={20} color="#6366F1" />}
                label="Success %"
                value={`${stats.successRate}%`}
                color="#6366F1"
              />
            </View>

            <View style={styles.filterContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#9CA3AF" style={styles.searchIcon}/>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by VIN, model..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={(itemValue) => setStatusFilter(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#6B7280"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Clock size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No history found</Text>
              <Text style={styles.emptySubtitle}>
                Your completed work will appear here.
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadHistory}
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  listContentContainer: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 15, color: "#4B5563", marginTop: 4, marginBottom: 16 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2, textAlign: 'center' },
  filterContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', color: '#111827' },
  pickerWrapper: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
  },
  picker: { width: "100%", height: 44, color: "#111827" },
  taskItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#111827", flexShrink: 1 },
  taskSubtitle: { fontSize: 13, color: "#6B7280", marginLeft: 22 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    marginLeft: 8,
  },
  statusText: { fontSize: 11, fontWeight: "600", flexShrink: 1 },
  taskMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: '45%',
  },
  metaText: { fontSize: 12, color: "#6B7280", flexShrink: 1 },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
  },
  emptySubtitle: { fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
});