import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import {
  ClipboardList,
  Clock,
  Wrench,
  Activity,
  TrendingUp,
} from "lucide-react-native";
import technicianService from "../../services/technicianService";
import CaseDetailsModal from "../../components/dashboard/CaseDetailsModal";
import { useIsFocused } from "@react-navigation/native";

// --- Hàm lấy style cho status ---
const getStatusStyle = (status) => {
  const stylesMap = {
    CHECKED_IN: { bg: "#E0F2FE", text: "#0369A1" },
    IN_DIAGNOSIS: { bg: "#F3E8FF", text: "#7E22CE" },
    WAITING_FOR_PARTS: { bg: "#FEF9C3", text: "#B45309" },
    IN_REPAIR: { bg: "#FFF7ED", text: "#EA580C" },
    COMPLETED: { bg: "#DCFCE7", text: "#16A34A" },
    CANCELLED: { bg: "#FEE2E2", text: "#DC2626" },
  };
  return stylesMap[status] || { bg: "#F3F4F6", text: "#4B5563" };
};

// --- Component chính ---
export default function DashboardOverview() {
  const [processingRecords, setProcessingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const isFocused = useIsFocused();

  // --- Hàm tải dữ liệu ---
  const loadProcessingRecords = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await technicianService.getAssignedRecords();
      const allRecords = response.data?.records?.records || [];
      setProcessingRecords(allRecords);
    } catch (err) {
      setError("Failed to load processing records");
      console.error("❌ Error loading records:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Tải dữ liệu khi focus ---
  useEffect(() => {
    if (isFocused) {
      loadProcessingRecords();
    }
  }, [isFocused]);

  // --- Xử lý Modal ---
  const handleOpenCase = (vin, recordId, caseId) => {
    setSelectedCase({ vin, recordId, caseId });
  };
  const handleCloseModal = () => {
    setSelectedCase(null);
  };
  const handleSuccess = () => {
    handleCloseModal();
    loadProcessingRecords();
  };

  // --- Tính toán Stats ---
  const activeCount = processingRecords.filter(
    (r) => r.status === "IN_DIAGNOSIS" || r.status === "IN_REPAIR"
  ).length;
  const completedCount = processingRecords.filter(
    (r) => r.status === "COMPLETED"
  ).length;

  // --- Component render Stat Card ---
  const RenderStatCard = ({ icon, label, value, color, IconComponent }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statHeader}>
        <IconComponent color="#FFF" size={24} style={{ opacity: 0.8 }} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // --- Component render Task Item ---
  const RenderTaskItem = ({ item }) => {
    const firstCase = item.guaranteeCases?.[0];
    const recordId =
      item.vehicleProcessingRecordId || firstCase?.vehicleProcessingRecordId;
    const statusStyle = getStatusStyle(item.status);
    const isDisabled = !firstCase || !recordId;

    return (
      <TouchableOpacity
        onPress={() =>
          !isDisabled && handleOpenCase(item.vin, recordId, firstCase.guaranteeCaseId)
        }
        disabled={isDisabled}
        style={[styles.taskItem, isDisabled && styles.taskItemDisabled]}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskVin}>VIN: {item.vin}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status?.replace(/_/g, " ") ?? "Unknown"}
            </Text>
          </View>
        </View>
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#4B5563" />
            <Text style={styles.metaText}>
              Check-in: {new Date(item.checkInDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaTextOdo}>
              Odo: {item.odometer?.toLocaleString() ?? 'N/A'} km
            </Text>
          </View>
        </View>
        {item.guaranteeCases && item.guaranteeCases.length > 0 && (
          <View style={styles.caseContainer}>
            <Text style={styles.caseTitle}>
              Guarantee Cases ({item.guaranteeCases.length}):
            </Text>
            {item.guaranteeCases.map((gc, index) => (
              <Text key={gc.guaranteeCaseId ?? index} style={styles.caseContent}>
                • {gc.contentGuarantee}
              </Text>
            ))}
            {!isDisabled && (
              <Text style={styles.caseActionText}>
                Click to add diagnosis & repairs →
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // --- Render UI chính ---
  return (
    <SafeAreaView style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={processingRecords}
        keyExtractor={(item) => item.vehicleProcessingRecordId || item.vin}
        renderItem={({ item }) => <RenderTaskItem item={item} />}
        ListHeaderComponent={
          <>
            <View style={styles.screenHeader}>
                <View>
                <Text style={styles.title}>My Assigned Cases</Text>
                <Text style={styles.subtitle}>Warranty cases assigned to you</Text>
                </View>
                <View style={styles.headerIcon}>
                <Wrench size={24} color="#2563EB" />
                </View>
            </View>
            <View style={styles.statsContainer}>
              <RenderStatCard
                label="Total Assigned"
                value={processingRecords.length}
                color="#3B82F6"
                IconComponent={ClipboardList}
              />
              <RenderStatCard
                label="Active Cases"
                value={activeCount}
                color="#8B5CF6"
                IconComponent={Activity}
              />
              <RenderStatCard
                label="Completed"
                value={completedCount}
                color="#10B981"
                IconComponent={TrendingUp}
              />
            </View>
            <Text style={styles.listTitle}>All Cases</Text>
          </>
        }
        ListEmptyComponent={
          !isLoading && !error && (
            <View style={styles.emptyContainer}>
              <ClipboardList size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No assigned cases</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any cases assigned to you.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoading && processingRecords.length > 0 ? <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }}/> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadProcessingRecords}
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={styles.listContentContainer}
      />

      {/* --- Modal --- */}
      {selectedCase && (
        <CaseDetailsModal
          isOpen={!!selectedCase}
          onClose={handleCloseModal}
          vin={selectedCase.vin}
          recordId={selectedCase.recordId}
          caseId={selectedCase.caseId}
          onSuccess={handleSuccess}
        />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  listContentContainer: { padding: 16, paddingBottom: 32 },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#4B5563", marginTop: 4 },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  statLabel: { fontSize: 13, fontWeight: "600", color: "#FFF" },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  taskItem: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  taskItemDisabled: { opacity: 0.6, backgroundColor: "#F9FAFB" },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskVin: { fontSize: 16, fontWeight: "600", color: "#111827", flexShrink: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "500" },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#4B5563",
  },
  metaTextOdo: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: 'right',
  },
  caseContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  caseTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  caseContent: {
    fontSize: 12,
    color: "#4B5563",
    backgroundColor: "#F9FAFB",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  caseActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563EB",
    marginTop: 8,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: "#4B5563", marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
});