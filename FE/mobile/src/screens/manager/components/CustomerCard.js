import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  shadow: "rgba(0,0,0,0.25)",
};

export default function CustomerCard({ customer, onEdit }) {
  return (
    <View style={styles.card}>
      {/* Header: tên + nút chỉnh sửa */}
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <Ionicons
            name="person-circle-outline"
            size={26}
            color={COLORS.accent}
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.name}>{customer.fullName}</Text>
            <Text style={styles.subName}>Customer</Text>
          </View>
        </View>

        {/* Nút update */}
        <TouchableOpacity onPress={() => onEdit(customer)}>
          <Ionicons name="create-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Thông tin liên lạc */}
      <View style={styles.cardBody}>
        <Text style={styles.info}>
          <Ionicons name="call-outline" size={15} color={COLORS.textMuted} />{" "}
          {customer.phone || "No phone"}
        </Text>
        <Text style={styles.info}>
          <Ionicons name="mail-outline" size={15} color={COLORS.textMuted} />{" "}
          {customer.email || "No email"}
        </Text>
        <Text style={styles.info}>
          <Ionicons name="home-outline" size={15} color={COLORS.textMuted} />{" "}
          {customer.address || "No address"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  subName: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  info: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
});
