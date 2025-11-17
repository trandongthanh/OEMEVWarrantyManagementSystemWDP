import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import processingRecordService from "../../services/technician/processingRecordService";
import AvatarLogoutMenu from "../../components/technician/AvatarLogoutMenu"; 

const statusConfig = {
  CHECKED_IN: { label: "Checked In", color: "#3B82F6", bg: "#EFF6FF", icon: "checkmark-circle-outline" },
  IN_DIAGNOSIS: { label: "In Diagnosis", color: "#A855F7", bg: "#F3E8FF", icon: "search-outline" },
  WAITING_FOR_PARTS: { label: "Waiting for Parts", color: "#F59E0B", bg: "#FFFBEB", icon: "time-outline" },
  IN_REPAIR: { label: "In Repair", color: "#F97316", bg: "#FFF7ED", icon: "build-outline" },
  COMPLETED: { label: "Completed", color: "#22C55E", bg: "#F0FDF4", icon: "checkmark-done-outline" },
  CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "#FEF2F2", icon: "close-circle-outline" },
};

const getStatusInfo = (status) => {
  return statusConfig[status] || { label: status, color: "#6B7280", bg: "#F3F4F6", icon: "alert-circle-outline" };
};

export default function MyTasksScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); //

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await processingRecordService.getAllRecords({
        page: 1,
        limit: 100, 
      });

      const allRecords = response.data?.data?.records || [];
      
      const activeStatuses = new Set([
        "CHECKED_IN",
        "IN_DIAGNOSIS",
        "WAITING_FOR_PARTS",
        "IN_REPAIR",
        "WAITING_CUSTOMER_APPROVAL",
        "PROCESSING",
        "READY_FOR_PICKUP"
      ]);
      
      const activeTasks = allRecords.filter(task => activeStatuses.has(task.status));

      setTasks(activeTasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, []);

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

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: tasks.length,
      urgent: tasks.filter(
        (t) => t.status === "IN_REPAIR" || t.status === "WAITING_FOR_PARTS"
      ).length,
      today: tasks.filter((t) => {
        const checkInDate = new Date(t.checkInDate).toDateString();
        return checkInDate === today;
      }).length,
      pending: tasks.filter((t) => t.status === "CHECKED_IN").length,
    };
  }, [tasks]);

  const handleTaskPress = (task) => {
    const firstCase = task.guaranteeCases?.[0];
    if (!firstCase) {
      console.warn("Task has no guarantee cases:", task.vin);
      return;
    }

    navigation.navigate("CaseDetails", {
      vin: task.vin,
      recordId: task.vehicleProcessingRecordId,
      caseId: firstCase.guaranteeCaseId,
    });
  };

  const renderTaskItem = (task) => {
    const statusInfo = getStatusInfo(task.status);
    const checkInDate = new Date(task.checkInDate).toLocaleDateString();

    return (
      <TouchableOpacity
        key={task.vehicleProcessingRecordId}
        style={styles.taskCard}
        onPress={() => handleTaskPress(task)}
      >
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
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{task.createdByStaff.name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
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
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.urgent}</Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.today}</Text>
            <Text style={styles.statLabel}>Checked In Today</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterScroll}>
            {['ALL', 'CHECKED_IN', 'IN_DIAGNOSIS', 'WAITING_FOR_PARTS', 'IN_REPAIR'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilterButton,
                  statusFilter === status && styles.statusFilterActive,
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.statusFilterText,
                    statusFilter === status && styles.statusFilterTextActive,
                  ]}
                >
                  {statusConfig[status]?.label || status.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading && filteredTasks.length === 0 ? (
          <ActivityIndicator size="large" color="#1D4ED8" style={{ marginTop: 32 }} />
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubText}>
              Try adjusting your search or filters.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredTasks.map(renderTaskItem)}
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
  statusFilterScroll: {
    marginTop: 12,
  },
  statusFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  statusFilterActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    textTransform: "capitalize",
  },
  statusFilterTextActive: {
    color: "#FFFFFF",
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