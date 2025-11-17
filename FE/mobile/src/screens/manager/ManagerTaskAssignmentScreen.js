import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import {
  getProcessingRecords,
  assignTechnicianToRecord,
} from "../../services/processingRecordService";
import { getTechnicians } from "../../services/technicianService";
import SearchBar from "../staff/components/SearchBar";

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

export default function ManagerTaskAssignmentScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [assigning, setAssigning] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // 🧩 Lấy danh sách hồ sơ
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await getProcessingRecords(1, 20, statusFilter);
      const records = res.records || [];
      setRecords(records);
    } catch (err) {
      console.error("❌ Lỗi tải hồ sơ:", err);
      Toast.show({ type: "error", text1: "Không thể tải danh sách hồ sơ" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🧩 Refresh khi focus lại tab
  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [statusFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  // ===== Lọc theo từ khóa =====
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const lower = searchQuery.toLowerCase();
    return records.filter((r) => {
      const vin = r.vehicle?.vin?.toLowerCase() || "";
      const model = r.vehicle?.model?.toLowerCase() || "";
      const tech = r.mainTechnician?.name?.toLowerCase() || "";
      return (
        vin.includes(lower) || model.includes(lower) || tech.includes(lower)
      );
    });
  }, [records, searchQuery]);

  // ===== Giao kỹ thuật viên =====
  const openTechSelector = async (recordId) => {
    try {
      setSelectedRecordId(recordId);
      setIsTechModalOpen(true);
      const res = await getTechnicians("WORKING");
      setTechnicians(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải kỹ thuật viên:", err);
      Toast.show({ type: "error", text1: "Không thể tải kỹ thuật viên" });
    }
  };

  const assignTech = async (techId) => {
    try {
      setAssigning(techId);
      const res = await assignTechnicianToRecord(selectedRecordId, techId);
      Toast.show({
        type: "success",
        text1: "✅ Giao kỹ thuật viên thành công!",
      });
      fetchRecords();
      setIsTechModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Giao kỹ thuật viên thất bại!";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setAssigning(null);
    }
  };

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);
  const selectStatus = (status) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setIsFilterOpen(false);
  };

  // ====== UI ======
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="people-outline" size={20} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Assign Processing Records</Text>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchFilterRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search by VIN, model, or technician..."
          />
        </View>
        <TouchableOpacity onPress={toggleFilter} style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Filter dropdown */}
      <Modal visible={isFilterOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsFilterOpen(false)}>
          <View style={styles.overlay}>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownTitle}>Filter by Status</Text>
              {STATUS_LABELS.map((item) => {
                const isActive = item === statusFilter;
                return (
                  <TouchableOpacity
                    key={item}
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
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Record list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recordTitle}>VIN: {item.vehicle?.vin}</Text>
                <Text style={styles.textMuted}>
                  Status: {item.status?.replaceAll("_", " ")}
                </Text>
                <Text style={styles.textMuted}>
                  Technician: {item.mainTechnician?.name || "Unassigned"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.assignBtn}
                onPress={() => openTechSelector(item.id)}
              >
                <Ionicons
                  name={
                    item.mainTechnician
                      ? "person-outline"
                      : "person-add-outline"
                  }
                  size={20}
                  color="#fff"
                />
                <Text style={styles.assignText}>
                  {item.mainTechnician ? "Reassign" : "Assign"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No records found.</Text>
          }
        />
      )}

      {/* Technician modal */}
      <Modal visible={isTechModalOpen} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setIsTechModalOpen(false)}>
          <View style={styles.overlay}>
            <View style={styles.techModal}>
              <Text style={styles.dropdownTitle}>Select Technician</Text>
              {technicians.length === 0 ? (
                <Text style={styles.textMuted}>No working technicians</Text>
              ) : (
                technicians.map((tech) => (
                  <TouchableOpacity
                    key={tech.id}
                    style={styles.techItem}
                    onPress={() => assignTech(tech.id)}
                    disabled={assigning === tech.id}
                  >
                    <Text style={styles.techName}>{tech.name}</Text>
                    <Text style={styles.techInfo}>
                      {tech.status} • {tech.activeTaskCount} tasks
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
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
  option: { paddingVertical: 10, paddingHorizontal: 14 },
  optionActive: { backgroundColor: COLORS.accent },
  optionText: { color: COLORS.textMuted, textTransform: "capitalize" },
  optionTextActive: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recordTitle: { color: COLORS.text, fontWeight: "600", marginBottom: 4 },
  assignBtn: {
    backgroundColor: COLORS.accent,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  assignText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: COLORS.textMuted, textAlign: "center", marginTop: 20 },
  techModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  techItem: {
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
  },
  techName: { color: COLORS.text, fontWeight: "600" },
  techInfo: { color: COLORS.textMuted, fontSize: 13 },
});
