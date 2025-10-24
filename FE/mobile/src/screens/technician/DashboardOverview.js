import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Activity,
  TrendingUp,
} from "lucide-react-native";
import technicianService from "../../services/technicianService";
import CaseDetailsModal from "../../components/dashboard/CaseDetailsModal";
import { useIsFocused } from "@react-navigation/native";

// Cấu hình màu sắc cho trạng thái
const getStatusStyle = (status) => {
  const styles = {
    CHECKED_IN: { bg: "#E0F2FE", text: "#0369A1" }, // bg-blue-100 text-blue-700
    IN_DIAGNOSIS: { bg: "#F3E8FF", text: "#7E22CE" }, // bg-purple-100 text-purple-700
    WAITING_FOR_PARTS: { bg: "#FEF9C3", text: "#B45309" }, // bg-yellow-100 text-yellow-700
    IN_REPAIR: { bg: "#FFF7ED", text: "#EA580C" }, // bg-orange-100 text-orange-700
    COMPLETED: { bg: "#DCFCE7", text: "#16A34A" }, // bg-green-100 text-green-700
    CANCELLED: { bg: "#FEE2E2", text: "#DC2626" }, // bg-red-100 text-red-700
  };
  return styles[status] || { bg: "#F3F4F6", text: "#4B5563" }; // bg-gray-100 text-gray-700
};

export default function DashboardOverview() {
  const [processingRecords, setProcessingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const isFocused = useIsFocused(); // Hook để biết màn hình có đang được focus

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

  useEffect(() => {
    if (isFocused) {
      loadProcessingRecords();
    }
  }, [isFocused, loadProcessingRecords]);

  const handleOpenCase = (vin, recordId, caseId) => {
    setSelectedCase({ vin, recordId, caseId });
  };

  const handleCloseModal = () => {
    setSelectedCase(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    loadProcessingRecords(); // Tải lại danh sách sau khi lưu thành công
  };

  const activeCount = processingRecords.filter(
    (r) => r.status === "IN_DIAGNOSIS" || r.status === "IN_REPAIR"
  ).length;
  const completedCount = processingRecords.filter(
    (r) => r.status === "COMPLETED"
  ).length;

  const renderStatCard = (icon, label, value, color, IconComponent) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statHeader}>
        <IconComponent color="#FFF" size={24} style={{ opacity: 0.8 }} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubLabel}>All your cases</Text>
    </View>
  );

  const renderTaskItem = ({ item }) => {
    const firstCase = item.guaranteeCases?.[0];
    const recordId = item.vehicleProcessingRecordId || firstCase?.vehicleProcessingRecordId;
    const statusStyle = getStatusStyle(item.status);
    const isDisabled = !firstCase || !recordId;

    return (
      <TouchableOpacity
        onPress={() =>
          handleOpenCase(item.vin, recordId, firstCase.guaranteeCaseId)
        }
        disabled={isDisabled}
        style={[styles.taskItem, isDisabled && styles.taskItemDisabled]}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskVin}>VIN: {item.vin}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.replace(/_/g, " ")}
            </Text>
          </View>
        </View>
        <View style={styles.taskMeta}>
          <Text style={styles.taskMetaText}>
            <Clock size={12} color="#4B5563" /> Check-in:{" "}
            {new Date(item.checkInDate).toLocaleDateString()}
          </Text>
          <Text style={styles.taskMetaText}>
            Odometer: {item.odometer.toLocaleString()} km
          </Text>
        </View>
        {item.guaranteeCases && item.guaranteeCases.length > 0 && (
          <View style={styles.caseContainer}>
            <Text style={styles.caseTitle}>
              Guarantee Cases ({item.guaranteeCases.length}):
            </Text>
            {item.guaranteeCases.map((gc) => (
              <Text key={gc.guaranteeCaseId} style={styles.caseContent}>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Assigned Cases</Text>
          <Text style={styles.subtitle}>Warranty cases assigned to you</Text>
        </View>
        <View style={styles.headerIcon}>
          <Wrench size={24} color="#2563EB" />
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={processingRecords}
        keyExtractor={(item) => item.vehicleProcessingRecordId || item.vin}
        renderItem={renderTaskItem}
        ListHeaderComponent={
          <>
            <View style={styles.statsContainer}>
              {renderStatCard(
                "clipboard",
                "Total Assigned",
                processingRecords.length,
                "#3B82F6", // Blue
                ClipboardList
              )}
              {renderStatCard(
                "activity",
                "Active Cases",
                activeCount,
                "#8B5CF6", // Purple
                Activity
              )}
              {renderStatCard(
                "trending-up",
                "Completed",
                completedCount,
                "#10B981", // Green
                TrendingUp
              )}
            </View>
            <Text style={styles.listTitle}>All Cases</Text>
          </>
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <ClipboardList size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No assigned cases</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any cases assigned to you.
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadProcessingRecords}
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

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
    </View>
  );
}

// ... (Styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: {
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
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statValue: { fontSize: 28, fontWeight: "bold", color: "#FFF" },
  statLabel: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  statSubLabel: { fontSize: 12, color: "#FFF", opacity: 0.8, marginTop: 2 },
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
  taskVin: { fontSize: 16, fontWeight: "600", color: "#111827" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "500" },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  taskMetaText: {
    fontSize: 13,
    color: "#4B5563",
    display: "flex",
    alignItems: "center",
  },
  caseContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  caseTitle: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 4 },
  caseContent: {
    fontSize: 12,
    color: "#4B5563",
    backgroundColor: "#F9FAFB",
    padding: 4,
    borderRadius: 4,
  },
  caseActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563EB",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: "#4B5563", marginTop: 4 },
});

