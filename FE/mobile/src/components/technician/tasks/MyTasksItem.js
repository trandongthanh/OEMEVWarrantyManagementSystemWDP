import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  AlertCircle,
  Calendar,
  Car,
  Clock,
} from "lucide-react-native";
import { statusConfig } from "../../../utils/technician/taskUtils";

export default function MyTasksItem({ item }) {
  const statusInfo = statusConfig[item.status] || {
    label: "Unknown",
    icon: AlertCircle,
    color: "#4B5563",
  };
  const StatusIcon = statusInfo.icon;

  return (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <View style={styles.vehicleInfo}>
          <View style={styles.taskTitleRow}>
            <Car size={16} color="#4B5563" />
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.vehicle?.model?.name ?? "Unknown Model"}
            </Text>
          </View>
          <Text style={styles.taskSubtitle} numberOfLines={1}>
            {item.vin ?? "No VIN"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusInfo.color}1A` },
          ]}
        >
          <StatusIcon size={14} color={statusInfo.color} />
          <Text
            style={[styles.statusText, { color: statusInfo.color }]}
            numberOfLines={1}
          >
            {statusInfo.label}
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
              style={styles.caseText}
              numberOfLines={1}
            >
              • {String(gc.contentGuarantee || "")}
            </Text>
          ))}
          {item.guaranteeCases.length > 2 && (
            <Text style={styles.moreCasesText}>
              +{item.guaranteeCases.length - 2} more
            </Text>
          )}
        </View>
      )}

      <View style={styles.taskMetaRow}>
        <View style={styles.metaItem}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {new Date(item.checkInDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {item.odometer?.toLocaleString() ?? "N/A"} km
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  taskSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 22,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    minWidth: 100,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  caseContainer: {
    marginBottom: 12,
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
  caseText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 4,
    lineHeight: 16,
  },
  moreCasesText: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 2,
  },
  taskMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
});