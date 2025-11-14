import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import technicianService from "../../services/technician/technicianService";
import ComponentsToInstall from "../../components/technician/ComponentsToInstall";
import RepairsToComplete from "../../components/technician/RepairsToComplete";

const getStatusStyles = (status) => {
  const statusColors = {
    CHECKED_IN: { bg: "#EFF6FF", text: "#3B82F6" },
    IN_DIAGNOSIS: { bg: "#FFFBEB", text: "#F59E0B" },
    WAITING_FOR_PARTS: { bg: "#FFFEF3", text: "#F97316" },
    IN_REPAIR: { bg: "#F3E8FF", text: "#8B5CF6" },
    COMPLETED: { bg: "#F0FDF4", text: "#22C55E" },
    CANCELLED: { bg: "#FEF2F2", text: "#EF4444" },
  };
  return statusColors[status] || { bg: "#F3F4F6", text: "#4B5563" };
};

const DashboardOverviewScreen = () => {
  const navigation = useNavigation();
  const [processingRecords, setProcessingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadProcessingRecords = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await technicianService.getAssignedRecords();
      const allRecords = response.data?.records?.records || [];
      setProcessingRecords(allRecords);
    } catch (err) {
      setError("Không thể tải danh sách phiếu sửa chữa.");
      console.error("Lỗi khi tải (loadProcessingRecords):", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProcessingRecords();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProcessingRecords();
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("authToken");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]
    );
  };

  const stats = useMemo(() => {
    const active = processingRecords.filter(
      (r) => r.status === "IN_DIAGNOSIS" || r.status === "IN_REPAIR"
    ).length;
    const completed = processingRecords.filter(
      (r) => r.status === "COMPLETED"
    ).length;
    return { activeCount: active, completedCount: completed };
  }, [processingRecords]);

  const handleOpenCase = (vin, recordId, caseId) => {
    navigation.navigate("TasksTab", {
      screen: "CaseDetails",
      params: { 
        vin,
        recordId,
        caseId,
      },
    });
  };

  const renderContent = () => {
    if (isLoading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (processingRecords.length === 0) {
      return (
        <View style={styles.centered}>
          <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Không có phiếu nào được gán</Text>
          <Text style={styles.emptySubText}>
            Các phiếu sửa chữa gán cho bạn sẽ xuất hiện tại đây.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {processingRecords.map((record) => {
          const recordId = record.vehicleProcessingRecordId;
          if (!recordId) return null;

          return (
            <View key={recordId} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.vinText}>VIN: {record.vin}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusStyles(record.status).bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusStyles(record.status).text },
                    ]}
                  >
                    {record.status.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>

              <View style={styles.recordMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="speedometer-outline" size={16} color="#4B5563" />
                  <Text style={styles.metaText}>
                    {record.odometer.toLocaleString()} km
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                  <Text style={styles.metaText}>
                    {new Date(record.checkInDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {record.guaranteeCases && record.guaranteeCases.length > 0 && (
                <View style={styles.caseListContainer}>
                  <Text style={styles.caseListHeader}>
                    Hồ sơ bảo hành ({record.guaranteeCases.length}):
                  </Text>
                  {record.guaranteeCases.map((guaranteeCase) => {
                    const hasDraft =
                      guaranteeCase.caseLines?.some(
                        (cl) => cl.status === "DRAFT"
                      ) || false;
                    const hasCompleted =
                      guaranteeCase.caseLines?.length > 0 && !hasDraft;

                    let buttonText = "Thêm chẩn đoán";
                    let buttonColor = "#2563EB"; // Blue
                    if (hasDraft) {
                      buttonText = "Sửa chẩn đoán";
                      buttonColor = "#4B5563"; // Gray
                    } else if (hasCompleted) {
                      buttonText = "Xem chẩn đoán";
                      buttonColor = "#16A34A"; // Green
                    }

                    return (
                      <TouchableOpacity
                        key={guaranteeCase.guaranteeCaseId}
                        style={styles.caseButton}
                        onPress={() =>
                          handleOpenCase(
                            record.vin,
                            recordId,
                            guaranteeCase.guaranteeCaseId
                          )
                        }
                      >
                        <View style={styles.caseButtonContent}>
                          <Text style={styles.caseText}>
                            {guaranteeCase.contentGuarantee}
                          </Text>
                          <Text style={[styles.caseActionText, { color: buttonColor }]}>
                            {buttonText} →
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={28} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: "#DBEAFE" }]}>
          <Text style={[styles.statNumber, { color: "#1E40AF" }]}>
            {processingRecords.length}
          </Text>
          <Text style={[styles.statLabel, { color: "#1E3A8A" }]}>
            Tổng cộng
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#F3E8FF" }]}>
          <Text style={[styles.statNumber, { color: "#5B21B6" }]}>
            {stats.activeCount}
          </Text>
          <Text style={[styles.statLabel, { color: "#4C1D95" }]}>Active</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#D1FAE5" }]}>
          <Text style={[styles.statNumber, { color: "#065F46" }]}>
            {stats.completedCount}
          </Text>
          <Text style={[styles.statLabel, { color: "#044229" }]}>Hoàn thành</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phiếu sửa chữa được gán</Text>
      </View>

      {renderContent()}

      <View style={styles.actionItemsContainer}>
        <ComponentsToInstall />
        <View style={{ height: 16 }} />
        <RepairsToComplete />
      </View>
    </ScrollView>
  );
};

// --- StyleSheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
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
  logoutButton: {
    padding: 8,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  // Centered States (Loading, Error, Empty)
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4B5563",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
    textAlign: "center",
  },
  // Record List
  listContainer: {
    paddingHorizontal: 16,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vinText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flexShrink: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  recordMeta: {
    flexDirection: "row",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4B5563",
  },
  // Case List
  caseListContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  caseListHeader: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
  },
  caseButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  caseButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caseText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
  },
  caseActionText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  actionItemsContainer: {
    padding: 16,
  },
});

export default DashboardOverviewScreen;