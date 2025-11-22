import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CaseLineCard from "./CaseLineCard";

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  cardBg: "#F9FAFB", // Nền hơi xám cho card con bên trong modal
  warning: "#F59E0B",
  success: "#10B981",
};

export default function CaseDetailModal({ visible, cases, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="briefcase-outline" size={24} color={COLORS.accent} />
            <Text style={styles.title}>Case Detail List</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {cases?.length ? (
              cases.map((c, idx) => {
                const statusColor =
                  c.status === "DIAGNOSED" ? COLORS.warning :
                  c.status === "PROCESSING" ? COLORS.accent :
                  c.status === "COMPLETED" ? COLORS.success : COLORS.textMuted;

                return (
                  <View key={c.guaranteeCaseId || idx} style={styles.caseCard}>
                    {/* Case Header */}
                    <View style={styles.caseHeaderRow}>
                      <Ionicons name="alert-circle-outline" size={20} color={statusColor} />
                      <Text style={styles.caseHeaderText}>Case #{idx + 1}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
                        <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                          {c.status.replaceAll("_", " ")}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.guaranteeText}>
                      {c.contentGuarantee || "No guarantee content."}
                    </Text>

                    {c.caseLines?.length ? (
                      c.caseLines.map((line, i) => (
                        <CaseLineCard key={i} line={line} />
                      ))
                    ) : (
                      <Text style={styles.emptyLine}>No case lines available.</Text>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={styles.empty}>No case data available.</Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close-outline" size={18} color="#fff" />
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: "100%",
    maxHeight: "90%",
    padding: 16,
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
    marginBottom: 16,
    gap: 8,
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  caseCard: {
    backgroundColor: COLORS.cardBg, // Card con nền xám nhạt để phân biệt với nền trắng Modal
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  caseHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  caseHeaderText: { color: COLORS.text, fontWeight: "700", fontSize: 16, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  guaranteeText: { color: COLORS.textMuted, marginTop: 8, marginBottom: 12, fontSize: 14 },
  closeBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  closeText: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 15 },
  empty: { color: COLORS.textMuted, textAlign: "center", marginTop: 20 },
  emptyLine: { color: COLORS.textMuted, fontSize: 13, fontStyle: "italic", marginTop: 4 },
});