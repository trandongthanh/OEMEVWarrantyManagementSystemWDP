import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { approveOrRejectCaseLines } from "../../../services/caseLineService";

const COLORS = {
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  success: "#22C55E",
  danger: "#EF4444",
  cardBg: "#161C25",
  pending: "#EAB308",
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

      // ✅ Gửi đúng format: { id: "..." }
      const approved = action === "approve" ? [{ id: caseLineId }] : [];
      const rejected = action === "reject" ? [{ id: caseLineId }] : [];

      const res = await approveOrRejectCaseLines(approved, rejected);
      console.log("✅ Response:", res);

      Toast.show({
        type: "success",
        text1:
          action === "approve"
            ? "✅ Approved successfully"
            : "❌ Rejected successfully",
      });
    } catch (err) {
      console.error(
        "❌ Error approving/rejecting case lines:",
        err.response?.data || err
      );
      Toast.show({
        type: "error",
        text1: "Failed to update case line",
        text2: err.response?.data?.message || "Please try again later",
      });
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={16} color={COLORS.accent} />
        <Text style={styles.title}>
          {line.diagnosisText || "No diagnosis text"}
        </Text>
      </View>

      {/* Description */}
      <Text style={styles.desc}>
        {line.correctionText || "No correction text"}
      </Text>

      {/* Warranty + Qty + Status */}
      <Text style={styles.status}>
        Warranty:{" "}
        <Text
          style={{
            color:
              line.warrantyStatus === "ELIGIBLE"
                ? COLORS.success
                : COLORS.danger,
          }}
        >
          {line.warrantyStatus}
        </Text>{" "}
        | Qty: {line.quantity}
      </Text>

      <Text
        style={[
          styles.lineStatus,
          {
            color:
              line.status === "PENDING_APPROVAL"
                ? COLORS.pending
                : COLORS.textMuted,
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
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: COLORS.danger }]}
            onPress={() => handleAction("reject")}
          >
            <Ionicons name="close" size={16} color="#fff" />
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
            Cannot approve yet — waiting for{" "}
            <Text style={{ color: COLORS.pending }}>
              {line.status.replaceAll("_", " ")}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  title: { color: COLORS.text, fontWeight: "600", flex: 1 },
  desc: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6 },
  status: { color: COLORS.textMuted, fontSize: 12 },
  lineStatus: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 13,
  },
  lockedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disabledText: {
    color: COLORS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    fontSize: 12,
  },
});
