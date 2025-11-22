import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { approveOrRejectCaseLines } from "../../../services/caseLineService";

// 🎨 LIGHT THEME
const COLORS = {
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  success: "#10B981", // Xanh lá đậm hơn chút
  danger: "#EF4444",
  pending: "#F59E0B", // Màu cam vàng
};

export default function CaseLineCard({ line }) {
  const handleAction = async (action) => {
    try {
      const caseLineId = line?.id;
      if (!caseLineId) {
        Toast.show({ type: "error", text1: "❌ Invalid case line ID" });
        return;
      }
      if (line.status !== "PENDING_APPROVAL") {
        Toast.show({
          type: "info",
          text1: "⏳ Cannot approve/reject yet",
          text2: `Current status: ${line.status}`,
        });
        return;
      }

      const approved = action === "approve" ? [{ id: caseLineId }] : [];
      const rejected = action === "reject" ? [{ id: caseLineId }] : [];

      await approveOrRejectCaseLines(approved, rejected);
      Toast.show({
        type: "success",
        text1: action === "approve" ? "✅ Approved" : "❌ Rejected",
      });
    } catch (err) {
      console.error("❌ Error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to update case line",
      });
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={18} color={COLORS.accent} />
        <Text style={styles.title}>
          {line.diagnosisText || "No diagnosis text"}
        </Text>
      </View>

      {/* Description */}
      <Text style={styles.desc}>
        {line.correctionText || "No correction text"}
      </Text>

      {/* Warranty + Qty + Status */}
      <View style={styles.metaRow}>
        <Text style={styles.status}>
          Warranty:{" "}
          <Text
            style={{
              color: line.warrantyStatus === "ELIGIBLE" ? COLORS.success : COLORS.danger,
              fontWeight: '600'
            }}
          >
            {line.warrantyStatus}
          </Text>{" "}
          | Qty: {line.quantity}
        </Text>
      </View>

      <Text
        style={[
          styles.lineStatus,
          {
            color: line.status === "PENDING_APPROVAL" ? COLORS.pending : COLORS.textMuted,
          },
        ]}
      >
        Status: {line.status.replaceAll("_", " ")}
      </Text>

      {/* Actions */}
      {line.status === "PENDING_APPROVAL" ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: COLORS.success }]}
            onPress={() => handleAction("approve")}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: COLORS.danger }]}
            onPress={() => handleAction("reject")}
          >
            <Ionicons name="close" size={18} color="#fff" />
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.lockedContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color={COLORS.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.disabledText}>
            Waiting for <Text style={{ color: COLORS.pending, fontWeight: '600' }}>{line.status.replaceAll("_", " ")}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Shadow nhẹ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  title: { color: COLORS.text, fontWeight: "700", flex: 1, fontSize: 15 },
  desc: { color: COLORS.textMuted, fontSize: 14, marginBottom: 8 },
  metaRow: { marginBottom: 4 },
  status: { color: COLORS.textMuted, fontSize: 13 },
  lineStatus: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  lockedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#F3F4F6", // Nền xám cho vùng bị khóa
    padding: 6,
    borderRadius: 6
  },
  disabledText: {
    color: COLORS.textMuted,
    fontStyle: "italic",
    fontSize: 12,
  },
});