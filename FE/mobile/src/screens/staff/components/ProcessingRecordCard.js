import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

  // ✅ Tính tổng số case line
  const totalCaseLines = record?.guaranteeCases?.reduce(
    (sum, c) => sum + (c.caseLines?.length || 0),
    0
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(record.vehicleProcessingRecordId)}
    >
      {/* Header: VIN + Status */}
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Ionicons name="car-outline" size={20} color={COLORS.accent} />
          <Text style={styles.vin}>{record.vin}</Text>
        </View>
        <Text style={[styles.status, { color: statusColor }]}>
          {record.status.replaceAll("_", " ")}
        </Text>
      </View>

      {/* Vehicle model */}
      <Text style={styles.info}>
        <Ionicons name="cube-outline" size={14} color={COLORS.textMuted} />{" "}
        {vehicle}
      </Text>

      {/* Odometer */}
      <Text style={styles.info}>
        <Ionicons
          name="speedometer-outline"
          size={14}
          color={COLORS.textMuted}
        />{" "}
        {record.odometer} km
      </Text>

      {/* Technician */}
      <Text style={styles.info}>
        <Ionicons name="construct-outline" size={14} color={COLORS.textMuted} />{" "}
        {technician}
      </Text>

      {/* Created by staff */}
      <Text style={styles.info}>
        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />{" "}
        {staff}
      </Text>

      {/* Check-in date */}
      <Text style={styles.info}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />{" "}
        {new Date(record.checkInDate).toLocaleDateString("vi-VN")}
      </Text>

      {/* ✅ Total Case Lines */}
      <View style={styles.caseLineRow}>
        <Ionicons name="hammer-outline" size={14} color={COLORS.accent} />
        <Text style={styles.caseLineText}>
          {totalCaseLines > 0
            ? `Total: ${totalCaseLines} case ${
                totalCaseLines > 1 ? "lines" : "line"
              }`
            : "No case lines"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  vin: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
  info: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  status: {
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
  },
  // ✅ Dòng hiển thị tổng số case line
  caseLineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  caseLineText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
