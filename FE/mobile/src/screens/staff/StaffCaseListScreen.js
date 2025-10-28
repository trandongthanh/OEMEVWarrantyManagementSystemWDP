import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList as RNFlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"; // ✅ Thêm dòng này
import {
  getProcessingRecords,
  getProcessingRecordById,
} from "../../services/processingRecordService";
import RecordDetailModal from "./components/RecordDetailModal";
import ProcessingRecordCard from "./components/ProcessingRecordCard";
import SearchBar from "./components/SearchBar";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
};

const STATUS_LABELS = [
  "CHECKED_IN",
  "IN_DIAGNOSIS",
  "WAITING_FOR_PARTS",
  "IN_REPAIR",
  "PAID",
  "COMPLETED",
  "CANCELLED",
];

export default function StaffCaseListScreen() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [recordDetail, setRecordDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ✅ Dùng useFocusEffect để reload API mỗi khi tab được chọn lại
  useFocusEffect(
    useCallback(() => {
      fetchCases();
    }, [statusFilter])
  );

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await getProcessingRecords(1, 20, statusFilter);
      const records = res.data.records?.records || [];
      setCases(records);
    } catch (err) {
      console.error("❌ Failed to load processing records:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCases();
  };

  // ===== Fetch chi tiết khi mở modal =====
  const openDetail = async (id) => {
    if (!id) return;
    try {
      setSelectedId(id);
      setDetailVisible(true);
      setLoadingDetail(true);

      const res = await getProcessingRecordById(id);
      setRecordDetail(res.data?.record || null);
    } catch (error) {
      console.error("❌ Error fetching record detail:", error);
      setRecordDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedId(null);
    setRecordDetail(null);
  };

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const selectStatus = (status) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setIsFilterOpen(false);
  };

  // ===== Lọc danh sách theo từ khóa =====
  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return cases;
    const lower = searchQuery.toLowerCase();
    return cases.filter((record) => {
      const vin = record.vin?.toLowerCase() || "";
      const model = record.vehicle?.model?.name?.toLowerCase() || "";
      const staff = record.createdByStaff?.name?.toLowerCase() || "";
      const technician = record.mainTechnician?.name?.toLowerCase() || "";
      return (
        vin.includes(lower) ||
        model.includes(lower) ||
        staff.includes(lower) ||
        technician.includes(lower)
      );
    });
  }, [cases, searchQuery]);

  // ====== Giao diện chính ======
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="briefcase-outline" size={20} color={COLORS.accent} />
        <Text style={styles.headerTitle}>My Processing Cases</Text>
      </View>

      {/* Search + Filter Row */}
      <View style={styles.searchFilterRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search by VIN, model, staff, or technician..."
          />
        </View>
        <TouchableOpacity onPress={toggleFilter} style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Filter */}
      <Modal visible={isFilterOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsFilterOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdown}>
                <Text style={styles.dropdownTitle}>Filter by Status</Text>
                <RNFlatList
                  data={STATUS_LABELS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const isActive = item === statusFilter;
                    return (
                      <TouchableOpacity
                        style={[styles.option, isActive && styles.optionActive]}
                        onPress={() => selectStatus(item)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isActive && styles.optionTextActive,
                          ]}
                        >
                          {item.replaceAll("_", " ")}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Danh sách hồ sơ */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredCases}
          keyExtractor={(item, index) =>
            item.vehicleProcessingRecordId || index.toString()
          }
          renderItem={({ item }) => (
            <ProcessingRecordCard record={item} onPress={openDetail} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No records found.</Text>
          }
        />
      )}

      {/* Modal chi tiết */}
      <RecordDetailModal
        visible={detailVisible}
        recordId={selectedId}
        record={recordDetail}
        loading={loadingDetail}
        onClose={closeDetail}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  filterBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownTitle: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 14,
    marginBottom: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optionActive: {
    backgroundColor: COLORS.accent,
  },
  optionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textTransform: "capitalize",
  },
  optionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
