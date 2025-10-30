import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProcessingRecordById } from "../../../services/processingRecordService";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  success: "#22C55E",
  danger: "#EF4444",
  warning: "#EAB308",
};

export default function RecordDetailModal({ visible, recordId, onClose }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && recordId) {
      fetchDetail();
    } else {
      setRecord(null);
    }
  }, [visible, recordId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getProcessingRecordById(recordId);
      setRecord(res.data?.record || null);
    } catch (err) {
      console.error(
        "❌ Failed to fetch record detail:",
        err.response?.data || err
      );
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalBox}>
              {/* Header */}
              <View style={styles.header}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={COLORS.accent}
                />
                <Text style={styles.title}>Record Detail</Text>
              </View>

              {/* Nội dung */}
              {loading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={COLORS.accent} />
                </View>
              ) : record ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* VIN */}
                  <Text style={styles.item}>
                    <Ionicons
                      name="car-outline"
                      size={16}
                      color={COLORS.accent}
                    />{" "}
                    <Text style={styles.bold}>{record.vin}</Text>
                  </Text>

                  {/* Model */}
                  <Text style={styles.item}>
                    <Ionicons
                      name="cube-outline"
                      size={16}
                      color={COLORS.textMuted}
                    />{" "}
                    {record.vehicle?.model?.name || "Unknown model"}
                  </Text>

                  {/* Odometer */}
                  <Text style={styles.item}>
                    <Ionicons
                      name="speedometer-outline"
                      size={16}
                      color={COLORS.textMuted}
                    />{" "}
                    {record.odometer} km
                  </Text>

                  {/* Status */}
                  <Text
                    style={[
                      styles.item,
                      {
                        color:
                          record.status === "COMPLETED"
                            ? COLORS.success
                            : record.status === "CANCELLED"
                            ? COLORS.danger
                            : COLORS.accent,
                      },
                    ]}
                  >
                    <Ionicons name="flag-outline" size={16} /> {record.status}
                  </Text>

                  {/* Technician */}
                  <Text style={styles.item}>
                    <Ionicons
                      name="construct-outline"
                      size={16}
                      color={COLORS.textMuted}
                    />{" "}
                    {record.mainTechnician?.name || "Unassigned"}
                  </Text>

                  {/* Created by Staff */}
                  <Text style={styles.item}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={COLORS.textMuted}
                    />{" "}
                    {record.createdByStaff?.name || "Unknown staff"}
                  </Text>

                  {/* Check-in Date */}
                  <Text style={styles.item}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={COLORS.textMuted}
                    />{" "}
                    {new Date(record.checkInDate).toLocaleDateString("vi-VN")}
                  </Text>

                  {/* Warranty Cases */}
                  {record.guaranteeCases?.length > 0 && (
                    <View style={styles.caseBox}>
                      <Text style={styles.caseHeader}>Warranty Cases</Text>
                      {record.guaranteeCases.map((c, index) => (
                        <View key={index} style={styles.caseItem}>
                          <Ionicons
                            name="alert-circle-outline"
                            size={14}
                            color={COLORS.warning}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.caseText}>
                            {c.contentGuarantee}{" "}
                            <Text style={{ color: COLORS.textMuted }}>
                              ({c.status.replaceAll("_", " ")})
                            </Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>
              ) : (
                <Text style={styles.empty}>No record information found.</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    width: "100%",
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  item: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "700",
  },
  caseBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  caseHeader: {
    color: COLORS.accent,
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 15,
  },
  caseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  caseText: {
    color: COLORS.text,
    flexShrink: 1,
    fontSize: 13.5,
    lineHeight: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  empty: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 20,
    fontSize: 14,
  },
});
