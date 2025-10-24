import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Search,
  Calendar,
  Car,
  User,
  X,
} from "lucide-react-native";
import technicianService from "../../services/technicianService";

// Cấu hình cho Status
const statusConfig = {
  CHECKED_IN: { label: "Checked In", icon: CheckCircle, color: "#0369A1" },
  IN_DIAGNOSIS: { label: "In Diagnosis", icon: Clock, color: "#7E22CE" },
  WAITING_FOR_PARTS: {
    label: "Waiting for Parts",
    icon: AlertCircle,
    color: "#B45309",
  },
  IN_REPAIR: { label: "In Repair", icon: Wrench, color: "#EA580C" },
  COMPLETED: { label: "Completed", icon: CheckCircle, color: "#16A34A" },
  CANCELLED: { label: "Cancelled", icon: X, color: "#DC2626" },
};
const STATUS_OPTIONS = [
  "ALL",
  "CHECKED_IN",
  "IN_DIAGNOSIS",
  "WAITING_FOR_PARTS",
  "IN_REPAIR",
  "COMPLETED",
];

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await technicianService.getAssignedRecords();
      setTasks(response.data?.records?.records || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.vin.toLowerCase().includes(query) ||
          task.vehicle.model.name.toLowerCase().includes(query) ||
          task.guaranteeCases.some((gc) =>
            gc.contentGuarantee.toLowerCase().includes(query)
          )
      );
    }
    return filtered;
  }, [tasks, searchQuery, statusFilter]);

  // Tính toán stats
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

  const renderTaskItem = ({ item }) => {
    const statusInfo = statusConfig[item.status] || {
      label: "Unknown",
      icon: AlertCircle,
      color: "#4B5563",
    };
    const StatusIcon = statusInfo.icon;

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.taskTitleRow}>
              <Car size={16} color="#4B5563" />
              <Text style={styles.taskTitle}>{item.vehicle.model.name}</Text>
            </View>
            <Text style={styles.taskSubtitle}>({item.vin})</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusInfo.color}1A` }, // Thêm 1A cho opacity
            ]}
          >
            <StatusIcon size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        <View style={styles.caseContainer}>
          {item.guaranteeCases?.map((gc) => (
            <Text key={gc.guaranteeCaseId} style={styles.caseText}>
              • {gc.contentGuarantee}
            </Text>
          ))}
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
              {item.odometer.toLocaleString()} km
            </Text>
          </View>
          <View style={styles.metaItem}>
            <User size={14} color="#6B7280" />
            <Text style={styles.metaText}>{item.createdByStaff.name}</Text>
          </View>
        </View>
      </View>
    );
  };

  const StatCard = ({ icon, label, value, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}1A` }]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.vehicleProcessingRecordId || item.vin}
        renderItem={renderTaskItem}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>My Tasks</Text>
            <Text style={styles.subtitle}>
              Manage your assigned warranty cases and repairs
            </Text>

            <View style={styles.statsRow}>
              <StatCard
                icon={<ClipboardList size={22} color="#3B82F6" />}
                label="Total Tasks"
                value={stats.total}
                color="#3B82F6"
              />
              <StatCard
                icon={<AlertCircle size={22} color="#EF4444" />}
                label="Urgent"
                value={stats.urgent}
                color="#EF4444"
              />
              <StatCard
                icon={<Calendar size={22} color="#10B981" />}
                label="Today"
                value={stats.today}
                color="#10B981"
              />
              <StatCard
                icon={<Clock size={22} color="#F59E0B" />}
                label="Pending"
                value={stats.pending}
                color="#F59E0B"
              />
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
              <View style={styles.searchInput}>
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  style={{ flex: 1, marginLeft: 8 }}
                  placeholder="Search by VIN, model..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={(itemValue) => setStatusFilter(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#6B7280"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <Picker.Item
                      key={status}
                      label={status.replace(/_/g, " ")}
                      value={status}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            {loading && <ActivityIndicator size="large" color="#3B82F6" />}
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <ClipboardList size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No tasks found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

// ... (Styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 15, color: "#4B5563", marginTop: 4, marginBottom: 16 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  filterContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
  },
  picker: { width: "100%", height: 44 },
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
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  taskSubtitle: { fontSize: 13, color: "#6B7280", marginLeft: 22 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: { fontSize: 12, fontWeight: "500" },
  caseContainer: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  caseText: { fontSize: 13, color: "#4B5563", marginBottom: 4 },
  taskMetaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: { fontSize: 12, color: "#6B7280" },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
  },
  emptySubtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
});

