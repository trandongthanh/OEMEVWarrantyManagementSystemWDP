import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProcessingRecordById } from "../../../services/processingRecordService";
import CloseButton from "../../../components/common/CloseButton";
import CaseDetailModal from "../components/CaseDetailModal";

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  bg: "#F9FAFB"
};

export default function RecordDetailModal({ visible, recordId, onClose }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);

  useEffect(() => {
    if (visible && recordId) fetchDetail();
    else setRecord(null);
  }, [visible, recordId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getProcessingRecordById(recordId);
      setRecord(res.data?.record || null);
    } catch (err) {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;
  const totalCaseLines = record?.guaranteeCases?.reduce((sum, c) => sum + (c.caseLines?.length || 0), 0);

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalBox}>
              <View style={styles.header}>
                <Ionicons name="document-text-outline" size={24} color={COLORS.accent} />
                <Text style={styles.title}>Record Details</Text>
              </View>

              {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>
              ) : record ? (
                <>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.item}>
                      <Ionicons name="car-outline" size={18} color={COLORS.accent} />{" "}
                      <Text style={styles.bold}>{record.vin}</Text>
                    </Text>

                    <Text style={styles.item}>
                      <Ionicons name="cube-outline" size={18} color={COLORS.textMuted} />{" "}
                      {record.vehicle?.model?.name || "Unknown model"}
                    </Text>

                    <Text style={styles.item}>
                      <Ionicons name="speedometer-outline" size={18} color={COLORS.textMuted} />{" "}
                      {record.odometer} km
                    </Text>

                    <View style={styles.statusRow}>
                        <Ionicons name="flag-outline" size={18} color={record.status === 'COMPLETED' ? COLORS.success : COLORS.accent} />
                        <View style={[styles.statusBadge, {
                            backgroundColor: record.status === "COMPLETED" ? "#DCFCE7" : "#DBEAFE"
                        }]}>
                            <Text style={[styles.statusText, {
                                color: record.status === "COMPLETED" ? COLORS.success : COLORS.accent
                            }]}>{record.status.replaceAll("_", " ")}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.item}>
                      <Ionicons name="construct-outline" size={18} color={COLORS.textMuted} />{" "}
                      {record.mainTechnician?.name || "Unassigned"}
                    </Text>

                    <Text style={styles.item}>
                      <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />{" "}
                      {record.createdByStaff?.name || "Unknown staff"}
                    </Text>

                    <Text style={styles.item}>
                      <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />{" "}
                      {new Date(record.checkInDate).toLocaleDateString("vi-VN")}
                    </Text>

                    {record.guaranteeCases?.length > 0 && (
                      <View style={styles.caseBox}>
                        <Text style={styles.caseHeader}>Warranty Cases</Text>
                        {record.guaranteeCases.map((c, index) => (
                          <View key={index} style={styles.caseItem}>
                            <Ionicons name="alert-circle-outline" size={16} color={COLORS.warning} style={{ marginRight: 6 }} />
                            <Text style={styles.caseText}>
                              {c.contentGuarantee}{" "}
                              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>({c.status.replaceAll("_", " ")})</Text>
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </ScrollView>

                  {record.guaranteeCases?.length > 0 && totalCaseLines > 0 ? (
                    <View style={styles.footerRow}>
                      <Pressable style={styles.smallBtn} onPress={() => setShowCaseModal(true)}>
                        <Ionicons name="hammer-outline" size={16} color="#fff" />
                        <Text style={styles.smallBtnText}>View {totalCaseLines} Lines</Text>
                      </Pressable>

                      <Pressable style={styles.closeBtnSmall} onPress={onClose}>
                        <Ionicons name="close-outline" size={16} color={COLORS.text} />
                        <Text style={styles.closeBtnText}>Close</Text>
                      </Pressable>
                    </View>
                  ) : (
                     <View style={{marginTop: 16}}>
                        <CloseButton onPress={onClose} />
                     </View>
                  )}
                </>
              ) : (
                <Text style={styles.empty}>No record information found.</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      <CaseDetailModal
        visible={showCaseModal}
        cases={record?.guaranteeCases || []}
        onClose={() => setShowCaseModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 8,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  item: { color: COLORS.text, fontSize: 15, marginBottom: 10, lineHeight: 22 },
  bold: { fontWeight: "700" },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10},
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },
  caseBox: {
    marginTop: 16,
    backgroundColor: COLORS.bg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  caseHeader: { color: COLORS.accent, fontWeight: "700", marginBottom: 8, fontSize: 14 },
  caseItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  caseText: { color: COLORS.text, flexShrink: 1, fontSize: 14, lineHeight: 20 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  smallBtnText: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 14 },
  closeBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  closeBtnText: { color: COLORS.text, fontWeight: "600", marginLeft: 4, fontSize: 14 },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  empty: { textAlign: "center", color: COLORS.textMuted, marginTop: 20, fontSize: 14 },
});