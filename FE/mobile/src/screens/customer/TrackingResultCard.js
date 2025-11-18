import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  success: "#22C55E",
  warn: "#EAB308",
  danger: "#EF4444",
};

export default function TrackingResultCard({ data }) {
  if (!data) return null;

  const { vin, checkInDate, checkOutDate, status, visitorInfo, odometer } =
    data;

  const statusColor =
    {
      CHECKED_IN: COLORS.warn,
      IN_PROGRESS: COLORS.accent,
      COMPLETED: COLORS.success,
      CANCELLED: COLORS.danger,
    }[status] || COLORS.accent;

  return (
    <View style={styles.card}>
      {/* VIN */}
      <View style={styles.row}>
        <Ionicons name="car-sport-outline" size={22} color={COLORS.accent} />
        <Text style={styles.label}>VIN:</Text>
        <Text style={styles.value}>{vin}</Text>
      </View>

      {/* STATUS */}
      <View style={styles.statusBox}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={statusColor}
        />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {status.replaceAll("_", " ")}
        </Text>
      </View>

      {/* Visitor Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Info</Text>
        <InfoItem label="Name" value={visitorInfo.fullName} />
        <InfoItem label="Email" value={visitorInfo.email} />
        <InfoItem label="Phone" value={visitorInfo.phone} />
        <InfoItem label="Relationship" value={visitorInfo.relationship} />
      </View>

      {/* Odometer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        <InfoItem label="Odometer" value={`${odometer} km`} />
        <InfoItem
          label="Checked In"
          value={new Date(checkInDate).toLocaleString()}
        />
        <InfoItem
          label="Checked Out"
          value={new Date(checkOutDate).toLocaleString()}
        />
      </View>
    </View>
  );
}

const InfoItem = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  label: {
    color: COLORS.textMuted,
    marginHorizontal: 8,
    fontSize: 14,
  },
  value: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },

  statusBox: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignSelf: "flex-start",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 6,
    fontWeight: "700",
  },

  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    color: COLORS.textMuted,
    width: 110,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
});
