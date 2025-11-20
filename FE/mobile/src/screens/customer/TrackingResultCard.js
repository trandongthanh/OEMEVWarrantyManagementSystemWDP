import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  success: "#22C55E",
  warn: "#EAB308",
  danger: "#EF4444",
  cardBg: "#0F141B",
  badgeBg: "rgba(255,255,255,0.06)",
};

export default function TrackingResultCard({ tracking }) {
  if (!tracking) return null;

  const {
    vin,
    status,
    odometer,
    checkInDate,
    checkOutDate,
    vehicle,
    mainTechnician,
    guaranteeCases,
  } = tracking;

  const modelName = vehicle?.model?.name || "Unknown Model";
  const technicianName = mainTechnician?.name || "—";

  const statusColor =
    {
      COMPLETED: COLORS.success,
      CHECKED_IN: COLORS.warn,
      IN_PROGRESS: COLORS.accent,
      DIAGNOSED: COLORS.warn,
    }[status] || COLORS.accent;

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <Text style={styles.headerTitle}>Service Record Found</Text>
      <Text style={styles.headerSub}>{modelName} • VinFast Auto</Text>

      {/* STATUS BADGE */}
      <View style={[styles.statusBadge, { borderColor: statusColor }]}>
        <Ionicons
          name="checkmark-circle-outline"
          size={18}
          color={statusColor}
        />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {status}
        </Text>
      </View>

      {/* INFO GRID */}
      <View style={styles.grid}>
        <InfoBox icon="car-sport-outline" label="VIN" value={vin} />
        <InfoBox
          icon="calendar-outline"
          label="CHECK-IN"
          value={formatDate(checkInDate)}
        />
        <InfoBox
          icon="speedometer-outline"
          label="ODOMETER"
          value={`${odometer} km`}
        />
        <InfoBox
          icon="hammer-outline"
          label="TECHNICIAN"
          value={technicianName}
        />
      </View>

      {/* SERVICE CASES */}
      {guaranteeCases?.length > 0 && (
        <View style={{ marginTop: 25 }}>
          <Text style={styles.sectionTitle}>
            Service Cases ({guaranteeCases.length})
          </Text>

          {guaranteeCases.map((c, idx) => (
            <View key={idx} style={styles.caseBox}>
              <Text style={styles.caseTitle}>Case #{idx + 1}</Text>

              <View style={styles.caseStatusBadge}>
                <Text style={styles.caseStatusText}>{c.status}</Text>
              </View>

              <Text style={styles.caseDescription}>{c.contentGuarantee}</Text>
            </View>
          ))}
        </View>
      )}

      {/* FOOTER */}
      <View style={[styles.footerBox, { borderColor: COLORS.success }]}>
        <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
        <View>
          <Text style={styles.footerTitle}>Service Completed</Text>
          <Text style={styles.footerText}>
            Checked out on {formatDate(checkOutDate)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <View style={styles.infoBox}>
      <Ionicons name={icon} size={20} color={COLORS.accent} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    alignSelf: "center",
    backgroundColor: COLORS.cardBg,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Header
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },
  headerSub: {
    color: COLORS.textMuted,
    marginTop: 3,
    fontSize: 13,
  },

  // Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.badgeBg,
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // Info Grid
  grid: {
    marginTop: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoBox: {
    width: "48%",
    backgroundColor: "#0D121A",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  infoValue: {
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 3,
    fontSize: 14,
  },

  // Cases
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  caseBox: {
    backgroundColor: "#0D121A",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  caseTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
  },
  caseStatusBadge: {
    backgroundColor: COLORS.badgeBg,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  caseStatusText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 12,
  },
  caseDescription: {
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },

  // Footer
  footerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(34,197,94,0.1)",
  },
  footerTitle: {
    color: COLORS.success,
    fontWeight: "700",
    marginLeft: 10,
  },
  footerText: {
    color: COLORS.textMuted,
    marginLeft: 10,
    marginTop: 2,
  },
});
