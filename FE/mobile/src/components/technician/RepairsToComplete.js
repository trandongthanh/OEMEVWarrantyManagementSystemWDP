import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { caseLineService } from "../../services/technician";

export default function RepairsToComplete() {
  const [caseLines, setCaseLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  const fetchInRepairCaseLines = async () => {
    setLoading(true);
    try {
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
      });
      const inRepairLines = response.data?.caseLines || [];
      setCaseLines(inRepairLines);
    } catch (error) {
      console.error("Error fetching in-repair case lines:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInRepairCaseLines();
    }, [])
  );

  const handleMarkComplete = async (caseLineId) => {
    if (!caseLineId) return;

    setCompletingId(caseLineId);
    try {
      await caseLineService.markRepairComplete(caseLineId);
      await fetchInRepairCaseLines();
    } catch (error) {
      console.error("Error marking repair complete:", error);
    } finally {
      setCompletingId(null);
    }
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
        {caseLines.map((caseLine) => {
          const caseLineId = caseLine.id || caseLine.caseLineId || "";
          const isCompleting = completingId === caseLineId;

          return (
            <View key={caseLineId} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {caseLine.typeComponent?.name || "Linh kiện"}
                </Text>

                <View style={styles.itemMeta}>
                  <Text style={styles.metaText} numberOfLines={1}>
                    Case: {caseLine.guaranteeCaseId}
                  </Text>
                  <Text style={styles.metaText} numberOfLines={1}>
                    Chẩn đoán: {caseLine.diagnosisText}
                  </Text>
                </View>
                <Text style={styles.itemStatus}>
                  Trạng thái: {caseLine.status}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleMarkComplete(caseLineId)}
                disabled={isCompleting || !caseLineId}
                style={[
                  styles.completeButton,
                  isCompleting && styles.disabledButton,
                ]}
              >
                {isCompleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.completeButtonText}>
                  {isCompleting ? "Đang..." : "Hoàn tất"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  }, [loading, caseLines, completingId]);

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  itemMeta: {
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
  },
  itemStatus: {
    fontSize: 12,
    color: "#16A34A",
    fontStyle: "italic",
  },
  completeButton: {
    flexDirection: "row",
    backgroundColor: "#16A34A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#166534", // Darker green
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
});