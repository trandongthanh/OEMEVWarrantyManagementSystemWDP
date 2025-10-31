import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock } from "lucide-react-native";
import { getStatusStyle } from "../../../utils/technician/dashboardUtils";

export default function TaskItem({ item, isDisabled, onPress }) {
  const statusStyle = getStatusStyle(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.taskItem, isDisabled && styles.taskItemDisabled]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.vinContainer}>
          <Text style={styles.taskVin} numberOfLines={1}>
            VIN: {item.vin}
          </Text>
          <Text style={styles.vehicleModel} numberOfLines={1}>
            {item.vehicle?.model?.name ?? "Unknown Model"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text
            style={[styles.statusText, { color: statusStyle.text }]}
            numberOfLines={1}
          >
            {item.status?.replace(/_/g, " ") ?? "Unknown"}
          </Text>
        </View>
      </View>

      <View style={styles.taskMeta}>
        <View style={styles.metaItem}>
          <Clock size={14} color="#4B5563" />
          <Text style={styles.metaText}>
            {new Date(item.checkInDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaTextOdo}>
            Odo: {item.odometer?.toLocaleString() ?? "N/A"} km
          </Text>
        </View>
      </View>

      {item.guaranteeCases && item.guaranteeCases.length > 0 && (
        <View style={styles.caseContainer}>
          <Text style={styles.caseTitle}>
            Cases ({item.guaranteeCases.length}):
          </Text>
          {item.guaranteeCases.slice(0, 2).map((gc, index) => (
            <Text
              key={gc.guaranteeCaseId ?? index}
              style={styles.caseContent}
              numberOfLines={1}
            >
              • {gc.contentGuarantee}
            </Text>
          ))}
          {item.guaranteeCases.length > 2 && (
            <Text style={styles.moreCasesText}>
              +{item.guaranteeCases.length - 2} more cases
            </Text>
          )}
          {!isDisabled && (
            <Text style={styles.caseActionText}>
              Tap to add diagnosis & repairs →
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  taskItemDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  vinContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskVin: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
  },
  metaTextOdo: {
    fontSize: 12,
    color: "#4B5563",
  },
  caseContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  caseTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  caseContent: {
    fontSize: 11,
    color: "#4B5563",
    backgroundColor: "#F9FAFB",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  moreCasesText: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 2,
  },
  caseActionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#2563EB",
    marginTop: 8,
  },
});