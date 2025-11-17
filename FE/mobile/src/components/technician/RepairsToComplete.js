// RepairsToComplete.js
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { caseLineService } from "../../services/technician";
import MarkRepairCompleteButton from "./MarkRepairCompleteButton";
// --- THÊM IMPORT ---
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RepairsToComplete() {
  const [caseLines, setCaseLines] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CẬP NHẬT HÀM NÀY ---
  const fetchInRepairCaseLines = async () => {
    setLoading(true);
    try {
      // 1. Lấy ID của KTV đang đăng nhập
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy ID kỹ thuật viên. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // 2. Gửi ID trong API call, giống logic web
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        repairTechId: userId, // <-- LỌC THEO KỸ THUẬT VIÊN
      });
      
      const inRepairLines = response.data?.caseLines || [];
      setCaseLines(inRepairLines);
    } catch (error) {
      console.error("Error fetching in-repair case lines:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sửa chữa.");
    } finally {
      setLoading(false);
    }
  };
  // --- KẾT THÚC CẬP NHẬT ---

  useFocusEffect(
    useCallback(() => {
      fetchInRepairCaseLines();
    }, [])
  );

  const handleRepairSuccess = () => {
    fetchInRepairCaseLines(); 
  };

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centeredView}>
          <ActivityIndicator size="small" color="#16A34A" />
          <Text style={styles.loadingText}>Đang tải mục sửa chữa...</Text>
        </View>
      );
    }

    if (caseLines.length === 0) {
      return (
        <View style={styles.centeredView}>
          <Ionicons name="checkmark-done-outline" size={24} color="#9CA3AF" />
          <Text style={styles.emptyText}>Không có mục nào chờ hoàn tất</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {caseLines.map((caseLine, index) => {
          const caseLineId = caseLine.id || caseLine.caseLineId || "";
          const pendingCount = caseLines.length - index - 1; 

          return (
            <View key={caseLineId} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {caseLine.typeComponent?.name || "Linh kiện"}
                </Text>

                <View style={styles.itemMeta}>
                  {caseLine.diagnosisText && (
                    <Text style={styles.metaText} numberOfLines={1}>
                      <Text style={styles.metaLabel}>Chẩn đoán:</Text>{" "}
                      {caseLine.diagnosisText}
                    </Text>
                  )}
                  {caseLine.correctionText && (
                    <Text style={styles.metaText} numberOfLines={1}>
                      <Text style={styles.metaLabel}>Sửa chữa:</Text>{" "}
                      {caseLine.correctionText}
                    </Text>
                  )}
                  <Text style={styles.metaText}>
                    <Text style={styles.metaLabel}>Số lượng:</Text>{" "}
                    {caseLine.quantity || 1}
                  </Text>
                  <Text style={styles.metaText} numberOfLines={1}>
                    <Text style={styles.metaLabel}>Case:</Text>{" "}
                    {caseLine.guaranteeCaseId}
                  </Text>
                  <Text style={styles.itemStatus}>
                    Trạng thái: {caseLine.status}
                  </Text>
                </View>

                {caseLine.warrantyStatus === "INELIGIBLE" && (
                  <View style={styles.warningBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color="#B45309"
                    />
                    <Text style={styles.warningText}>
                      Bảo hành không đủ ĐK
                      {caseLine.rejectionReason
                        ? `: ${caseLine.rejectionReason}`
                        : ""}
                    </Text>
                  </View>
                )}
              </View>

              <MarkRepairCompleteButton
                caseLineId={caseLineId}
                showNextSteps={true} 
                pendingRepairsCount={pendingCount} 
                onSuccess={handleRepairSuccess}
                style={styles.completeButton}
              />
            </View>
          );
        })}
      </View>
    );
  }, [loading, caseLines]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconWrapper}>
          <Ionicons name="build" size={20} color="#16A34A" />
        </View>
        <View>
          <Text style={styles.title}>Hoàn tất sửa chữa</Text>
          <Text style={styles.subtitle}>Đánh dấu các sửa chữa đã xong</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{caseLines.length}</Text>
        </View>
      </View>
      {renderContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIconWrapper: {
    padding: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  countBadge: {
    backgroundColor: "#F0FDF4",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: "auto",
  },
  countText: {
    color: "#16A34A",
    fontWeight: "600",
    fontSize: 14,
  },
  centeredView: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  listContainer: {
    maxHeight: 400,
  },
  itemCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  itemMeta: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13, //
    color: "#4B5563",
    marginBottom: 2,
  },
  metaLabel: { //
    fontWeight: "500",
  },
  itemStatus: {
    fontSize: 12,
    color: "#16A34A",
    fontStyle: "italic",
    marginTop: 4,
  },
  warningBox: { //
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 8,
  },
  warningText: { 
    fontSize: 12,
    color: "#B45309",
    marginLeft: 6,
    flex: 1,
  },
  completeButton: {
    marginTop: 12,
  },
});