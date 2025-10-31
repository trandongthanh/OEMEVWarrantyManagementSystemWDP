import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import technicianService from "../../services/technicianService";
import CaseDetailsModal from "../../components/dashboard/CaseDetailsModal";
import { useIsFocused } from "@react-navigation/native";

// --- Import các component con ---
import DashboardHeader from "../../components/technician/dashboard/DashboardHeader";
import TaskItem from "../../components/technician/dashboard/TaskItem";
import EmptyDashboard from "../../components/technician/dashboard/EmptyDashboard";

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

  // --- Component render Task Item (đã được đơn giản hóa) ---
  const renderItem = ({ item }) => {
    const firstCase = item.guaranteeCases?.[0];
    const recordId =
      item.vehicleProcessingRecordId || firstCase?.vehicleProcessingRecordId;
    const isDisabled = !firstCase || !recordId;

    return (
      <TaskItem
        item={item}
        isDisabled={isDisabled}
        onPress={() =>
          !isDisabled &&
          handleOpenCase(item.vin, recordId, firstCase.guaranteeCaseId)
        }
      />
    );
  };

  // --- Render UI chính ---
  return (
    <SafeAreaView style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={processingRecords}
        keyExtractor={(item) => item.vehicleProcessingRecordId || item.vin}
        renderItem={renderItem}
        ListHeaderComponent={
          <DashboardHeader
            total={processingRecords.length}
            active={activeCount}
            completed={completedCount}
          />
        }
        ListEmptyComponent={
          !isLoading && !error && <EmptyDashboard />
        }
        ListFooterComponent={
          isLoading && processingRecords.length > 0 ? (
            <ActivityIndicator
              size="large"
              color="#3B82F6"
              style={{ marginTop: 20 }}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadProcessingRecords}
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
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

// --- Styles (Chỉ giữ lại các style cho layout chính) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContentContainer: {
    padding: 12,
    paddingBottom: 32,
  },
  errorText: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    marginHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
  },
});