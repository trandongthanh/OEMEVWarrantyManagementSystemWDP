import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Box, CheckCircle, AlertCircle } from "lucide-react-native";

export default function PartsItem({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.partItem} onPress={onPress}>
      <View style={styles.partIconContainer}>
        <Box size={18} color="#2563EB" />
      </View>
      <View style={styles.partInfo}>
        <Text style={styles.partName} numberOfLines={1}>
          {item.name ?? "No Name"}
        </Text>
        <Text style={styles.partId}>ID: {item.typeComponentId ?? "N/A"}</Text>
        {item.isUnderWarranty !== undefined && (
          <View
            style={[
              styles.warrantyBadge,
              item.isUnderWarranty
                ? styles.warrantyEligibleBg
                : styles.warrantyIneligibleBg,
            ]}
          >
            {item.isUnderWarranty ? (
              <CheckCircle size={12} color="#15803D" />
            ) : (
              <AlertCircle size={12} color="#B91C1C" />
            )}
            <Text
              style={[
                styles.warrantyText,
                item.isUnderWarranty
                  ? styles.warrantyEligibleText
                  : styles.warrantyIneligibleText,
              ]}
            >
              {item.isUnderWarranty ? "Under Warranty" : "Not Covered"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  partItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    alignItems: "center",
  },
  partIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  partId: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  warrantyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  warrantyEligibleBg: {
    backgroundColor: "#D1FAE5",
  },
  warrantyIneligibleBg: {
    backgroundColor: "#FEE2E2",
  },
  warrantyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  warrantyEligibleText: {
    color: "#065F46",
  },
  warrantyIneligibleText: {
    color: "#991B1B",
  },
});