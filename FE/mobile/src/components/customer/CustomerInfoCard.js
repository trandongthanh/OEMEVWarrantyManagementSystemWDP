import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
};

export default function CustomerInfoCard({ customer, onCreateClaim }) {
  if (!customer) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.fullName?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{customer.fullName}</Text>
          <Text style={styles.id}>ID: {customer.id}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={18} color={COLORS.accent} />
        <Text style={styles.infoText}>{customer.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={18} color={COLORS.accent} />
        <Text style={styles.infoText}>{customer.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="home-outline" size={18} color={COLORS.accent} />
        <Text style={styles.infoText}>{customer.address}</Text>
      </View>

      {/* Created date */}
      <Text style={styles.dateText}>
        🕓 Created:{" "}
        {new Date(customer.createdAt).toLocaleString("vi-VN", {
          hour12: false,
        })}
      </Text>

      {/* Button */}
      <TouchableOpacity style={styles.claimBtn} onPress={onCreateClaim}>
        <Ionicons
          name="document-text-outline"
          size={18}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.claimText}>Create Warranty Claim</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent + "22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  id: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 8,
  },
  dateText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "right",
  },
  claimBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 10,
  },
  claimText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
