import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { technicianService } from "../../services/technician"; 
import AvatarLogoutMenu from "../../components/technician/AvatarLogoutMenu"; 

const statusConfig = {
  COMPLETED: {
    label: "Completed",
    color: "#16A34A",
    bg: "#F0FDF4",
    icon: "checkmark-done-outline",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#EF4444",
    bg: "#FEF2F2",
    icon: "close-circle-outline",
  },
};

const getStatusInfo = (status) => {
  return (
    statusConfig[status] || {
      label: status,
      color: "#6B7280",
      bg: "#F3F4F6",
      icon: "alert-circle-outline",
    }
  );
};

export default function WorkHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); 

  const loadHistory = async () => {
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
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, []);

  const filteredHistory = useMemo(() => {
    let filtered = [...history];

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
  }, [history, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const completed = history.filter(
      (r) => r.status === "COMPLETED"
    ).length;
    const total = history.length;
    const thisMonth = history.filter((r) => {
      const completedDate = new Date(r.checkInDate);
      const now = new Date();
      return (
        completedDate.getMonth() === now.getMonth() &&
        completedDate.getFullYear() === now.getFullYear()
      );
    }).length;
    const successRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
      
    return {
      total,
      completed,
      thisMonth,
      successRate,
    };
  }, [history]);

  const renderHistoryItem = (task) => {
    const statusInfo = getStatusInfo(task.status);
    const checkInDate = new Date(task.checkInDate).toLocaleDateString();

    return (
      <View key={task.vehicleProcessingRecordId} style={styles.taskCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="car-sport-outline" size={20} color="#374151" />
            <Text style={styles.cardTitle}>
              {task.vehicle.model.name}
            </Text>
            <Text style={styles.cardVin}>({task.vin})</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {task.guaranteeCases && task.guaranteeCases.length > 0 && (
          <View style={styles.caseContainer}>
            {task.guaranteeCases.map((gc) => (
              <Text key={gc.guaranteeCaseId} style={styles.caseText}>
                • {gc.contentGuarantee}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{checkInDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="speedometer" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {task.odometer.toLocaleString()} km
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work History</Text>
        <AvatarLogoutMenu />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total History</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by VIN, model, or case..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(itemValue) => setStatusFilter(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="All Statuses" value="ALL" />
              <Picker.Item label="Completed" value="COMPLETED" />
              <Picker.Item label="Cancelled" value="CANCELLED" />
            </Picker>
          </View>
        </View>

        {loading && filteredHistory.length === 0 ? (
          <ActivityIndicator size="large" color="#1D4ED8" style={{ marginTop: 32 }} />
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No history found</Text>
            <Text style={styles.emptySubText}>
              Your completed tasks will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredHistory.map(renderHistoryItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12, 
    paddingHorizontal: 16,
    paddingTop: 40, 
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 16,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: "1%",
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1D4ED8",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#111827",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  picker: {
    height: 50,
    color: "#111827",
  },
  emptyContainer: {
    marginTop: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 16,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  cardVin: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  caseContainer: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  caseText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
});