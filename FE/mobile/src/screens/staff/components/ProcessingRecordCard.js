import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  success: "#10B981",
  danger: "#EF4444",
};

export default function ProcessingRecordCard({ record, onPress }) {
  const vehicle = record.vehicle?.model?.name || "Unknown model";
  const technician = record.mainTechnician?.name || "Unassigned";
  const staff = record.createdByStaff?.name || "Unknown staff";

  const statusColor =
    record.status === "COMPLETED"
      ? COLORS.success
      : record.status === "CANCELLED"
      ? COLORS.danger
      : COLORS.accent;

  const totalCaseLines = record?.guaranteeCases?.reduce(
    (sum, c) => sum + (c.caseLines?.length || 0),
    0
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(record.vehicleProcessingRecordId)}
    >
      {/* Header: VIN + Status */}
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Ionicons name="car-outline" size={20} color={COLORS.accent} />
          <Text style={styles.vin}>{record.vin}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.status, { color: statusColor }]}>
            {record.status.replaceAll("_", " ")}
            </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Info Rows */}
      <View style={styles.infoRow}>
         <Text style={styles.info}>
            <Ionicons name="cube-outline" size={14} color={COLORS.textMuted} /> {vehicle}
        </Text>
        <Text style={styles.info}>
            <Ionicons name="speedometer-outline" size={14} color={COLORS.textMuted} /> {record.odometer} km
        </Text>
      </View>

      <View style={styles.infoRow}>
         <Text style={styles.info}>
             <Ionicons name="construct-outline" size={14} color={COLORS.textMuted} /> {technician}
         </Text>
         <Text style={styles.info}>
             <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} /> {new Date(record.checkInDate).toLocaleDateString("vi-VN")}
         </Text>
      </View>

       <Text style={[styles.info, {marginTop: 4}]}>
        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} /> {staff}
      </Text>

      {/* Total Case Lines */}
      <View style={styles.caseLineRow}>
        <Ionicons name="hammer-outline" size={16} color={COLORS.accent} />
        <Text style={styles.caseLineText}>
          {totalCaseLines > 0
            ? `Total: ${totalCaseLines} case ${totalCaseLines > 1 ? "lines" : "line"}`
            : "No case lines"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  vin: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8
  },
  status: {
    fontWeight: "700",
    fontSize: 12,
    textTransform: "capitalize",
  },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginBottom: 8 },
  infoRow: {
      flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4
  },
  info: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  caseLineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
    backgroundColor: "#F3F4F6", // Nền xám nhạt làm nổi bật dòng này
    padding: 8,
    borderRadius: 8
  },
  caseLineText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
});