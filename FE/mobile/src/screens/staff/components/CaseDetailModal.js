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
import CaseLineCard from "./CaseLineCard"; // ✅ import để hiện case lines

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  cardBg: "#161C25",
  warning: "#EAB308",
  success: "#22C55E",
  danger: "#EF4444",
  shadow: "#00000055",
};

export default function CaseDetailModal({ visible, cases, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons
              name="briefcase-outline"
              size={22}
              color={COLORS.accent}
            />
            <Text style={styles.title}>Case Detail List</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {cases?.length ? (
              cases.map((c, idx) => {
                const statusColor =
                  c.status === "DIAGNOSED"
                    ? COLORS.warning
                    : c.status === "PROCESSING"
                    ? COLORS.accent
                    : c.status === "COMPLETED"
                    ? COLORS.success
                    : COLORS.textMuted;

                return (
                  <View
                    key={c.guaranteeCaseId || idx}
                    style={[
                      styles.caseCard,
                      {
                        shadowColor: COLORS.shadow,
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        elevation: 2,
                      },
                    ]}
                  >
                    {/* Case Header */}
                    <View style={styles.caseHeaderRow}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={18}
                        color={statusColor}
                      />
                      <Text style={styles.caseHeaderText}>Case #{idx + 1}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColor + "33" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: statusColor },
                          ]}
                        >
                          {c.status.replaceAll("_", " ")}
                        </Text>
                      </View>
                    </View>

                    {/* Nội dung case */}
                    <Text style={styles.guaranteeText}>
                      {c.contentGuarantee || "No guarantee content."}
                    </Text>

                    {/* Hiển thị các CaseLineCard */}
                    {c.caseLines?.length ? (
                      c.caseLines.map((line, i) => (
                        <CaseLineCard key={i} line={line} />
                      ))
                    ) : (
                      <Text style={styles.emptyLine}>
                        No case lines available.
                      </Text>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={styles.empty}>No case data available.</Text>
            )}
          </ScrollView>

          {/* Close button */}
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
    backgroundColor: "rgba(0,0,0,0.7)",
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
    borderWidth: 1,
    borderColor: COLORS.border,
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
  caseCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  caseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  caseHeaderText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  guaranteeText: {
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 8,
    fontSize: 13,
  },
  closeBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  empty: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  emptyLine: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
});
