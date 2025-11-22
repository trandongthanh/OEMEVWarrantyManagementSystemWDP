import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { technicianService } from "../../services/technician";
import AvatarLogoutMenu from "../../components/technician/AvatarLogoutMenu";
import CompleteDiagnosisButton from "../../components/technician/CompleteDiagnosisButton";

const statusConfig = {
  CHECKED_IN: { label: "Checked In", color: "#1D4ED8", bg: "#EFF6FF", icon: "checkmark-circle-outline" },
  IN_DIAGNOSIS: { label: "In Diagnosis", color: "#A855F7", bg: "#F3E8FF", icon: "search-outline" },
  WAITING_FOR_PARTS: { label: "Waiting Parts", color: "#B45309", bg: "#FFFBEB", icon: "time-outline" },
  IN_REPAIR: { label: "In Repair", color: "#C2410C", bg: "#FFF7ED", icon: "build-outline" },
  COMPLETED: { label: "Completed", color: "#15803D", bg: "#F0FDF4", icon: "checkmark-done-outline" },
  CANCELLED: { label: "Cancelled", color: "#B91C1C", bg: "#FEF2F2", icon: "close-circle-outline" },
  WAITING_CUSTOMER_APPROVAL: { label: "Wait Approval", color: "#0F766E", bg: "#F0FDFA", icon: "help-circle-outline" },
  PROCESSING: { label: "Processing", color: "#A855F7", bg: "#F3E8FF", icon: "sync-outline" },
  READY_FOR_PICKUP: { label: "Ready Pickup", color: "#15803D", bg: "#F0FDF4", icon: "cube-outline" },
};

const caselineStatusConfig = {
  DRAFT: { label: "Draft", color: "#4B5563", bg: "#F9FAFB", borderColor: "#E5E7EB", icon: "document-text-outline" },
  PENDING_APPROVAL: { label: "Pending", color: "#CA8A04", bg: "#FEFCE8", borderColor: "#FEF08A", icon: "time-outline" },
  WAITING_FOR_PARTS: { label: "Wait Parts", color: "#EA580C", bg: "#FFF7ED", borderColor: "#FFEDD5", icon: "cube-outline" },
  PARTS_AVAILABLE: { label: "Parts Ready", color: "#16A34A", bg: "#F0FDF4", borderColor: "#BBF7D0", icon: "checkmark-circle-outline" },
  READY_FOR_REPAIR: { label: "Ready Repair", color: "#9333EA", bg: "#FAF5FF", borderColor: "#E9D5FF", icon: "construct-outline" },
  IN_REPAIR: { label: "Repairing", color: "#2563EB", bg: "#EFF6FF", borderColor: "#BFDBFE", icon: "hammer-outline" },
  COMPLETED: { label: "Done", color: "#16A34A", bg: "#F0FDF4", borderColor: "#BBF7D0", icon: "checkmark-done-outline" },
  REJECTED: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2", borderColor: "#FECACA", icon: "close-circle-outline" },
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
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadTasks = async () => {
    if (!refreshing) setLoading(true);
    try {
      const response = await technicianService.getAssignedRecords();
      const allRecords = response.data?.records?.records || [];
      
      const activeStatuses = new Set([
        "CHECKED_IN", "IN_DIAGNOSIS", "WAITING_FOR_PARTS",
        "IN_REPAIR", "WAITING_CUSTOMER_APPROVAL", "PROCESSING", "READY_FOR_PICKUP"
      ]);
      
      const activeTasks = allRecords.filter(task => activeStatuses.has(task.status));
      setTasks(activeTasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
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
      urgent: tasks.filter((t) => t.status === "IN_REPAIR" || t.status === "WAITING_FOR_PARTS").length,
      today: tasks.filter((t) => new Date(t.checkInDate).toDateString() === today).length,
      pending: tasks.filter((t) => t.status === "CHECKED_IN").length,
    };
  }, [tasks]);

  const handleTaskPress = (task) => {
    const firstCase = task.guaranteeCases?.[0];
    if (!firstCase) return;
    navigation.navigate("CaseDetails", {
      vin: task.vin,
      recordId: task.vehicleProcessingRecordId,
      caseId: firstCase.guaranteeCaseId,
    });
  };

  const renderTaskItem = ({ item: task }) => {
    const statusInfo = getStatusInfo(task.status);
    const checkInDate = new Date(task.checkInDate).toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => handleTaskPress(task)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="car-sport" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.cardTitle}>{task.vehicle.model.name}</Text>
              <Text style={styles.cardVin}>VIN: {task.vin}</Text>
            </View>
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
            <Text style={styles.caseHeaderTitle}>WARRANTY CASES ({task.guaranteeCases.length})</Text>
            
            {task.guaranteeCases.map((gc) => {
              const caseLinesByStatus = gc.caseLines?.reduce((acc, cl) => {
                const status = cl.status || "DRAFT";
                if (!acc[status]) acc[status] = [];
                acc[status].push(cl);
                return acc;
              }, {}) || {};

              const hasCaseLines = gc.caseLines && gc.caseLines.length > 0;

              return (
                <View key={gc.guaranteeCaseId} style={styles.caseItem}>
                  <Text style={styles.caseText} numberOfLines={2}>
                    • {gc.contentGuarantee}
                  </Text>

                  {hasCaseLines && (
                    <View style={styles.statusChipsContainer}>
                      {Object.entries(caseLinesByStatus).map(([status, lines]) => {
                        const config = caselineStatusConfig[status];
                        if (!config) return null;
                        
                        return (
                          <View 
                            key={status} 
                            style={[
                              styles.statusChip, 
                              { backgroundColor: config.bg, borderColor: config.borderColor }
                            ]}
                          >
                            <Ionicons name={config.icon} size={12} color={config.color} style={{marginRight: 4}} />
                            <Text style={[styles.statusChipText, { color: config.color }]}>
                              {lines.length} {config.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            {task.status === "IN_DIAGNOSIS" && (
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
                <CompleteDiagnosisButton
                  recordId={task.vehicleProcessingRecordId}
                  caseLines={task.guaranteeCases.flatMap(gc => gc.caseLines || [])}
                  onSuccess={() => {
                    loadTasks();
                  }}
                  style={{ width: '100%' }} 
                />
              </View>
            )}
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

  const renderStatusFilterItem = ({ item: status }) => (
    <TouchableOpacity
      style={[
        styles.statusFilterButton,
        statusFilter === status && styles.statusFilterActive,
      ]}
      onPress={() => setStatusFilter(status)}
    >
      <Text style={[
        styles.statusFilterText,
        statusFilter === status && styles.statusFilterTextActive,
      ]}>
        {statusConfig[status]?.label || status.replace(/_/g, " ")}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
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
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by VIN, model..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.statusFilterListContainer}>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <AvatarLogoutMenu />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#1D4ED8" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.vehicleProcessingRecordId}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No tasks found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { backgroundColor: "#FFFFFF", paddingVertical: 12, paddingHorizontal: 16, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  listContentContainer: { paddingBottom: 20 },
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 12, marginTop: 16 },
  statBox: { width: "23%", backgroundColor: "#FFFFFF", paddingVertical: 12, borderRadius: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, marginHorizontal: "1%" },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#1D4ED8" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2, textAlign: "center" },
  filterContainer: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  searchInputContainer: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: "#111827" },
  statusFilterListContainer: { marginTop: 12 }, 
  statusFilterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 8 },
  statusFilterActive: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  statusFilterText: { fontSize: 13, fontWeight: "500", color: "#374151", textTransform: "capitalize" },
  statusFilterTextActive: { color: "#FFFFFF" },
  emptyContainer: { marginTop: 64, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#111827", marginTop: 16 },
  emptySubText: { fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: "center" },
  taskCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, marginHorizontal: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, borderWidth: 1, borderColor: "#F3F4F6" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  cardTitleContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
  iconBox: { width: 36, height: 36, backgroundColor: "#EFF6FF", borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginLeft: 8 },
  cardVin: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
  caseContainer: { marginBottom: 12, paddingLeft: 4 },
  caseHeaderTitle: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase" },
  caseItem: { marginBottom: 10 },
  caseText: { fontSize: 14, color: "#374151", fontWeight: "500", marginBottom: 6 },
  statusChipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginLeft: 8 },
  statusChip: { flexDirection: "row", alignItems: "center", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1 },
  statusChipText: { fontSize: 11, fontWeight: "600" },
  metaContainer: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 4 },
  metaText: { fontSize: 12, color: "#6B7280", marginLeft: 4, fontWeight: "500" },
}); 