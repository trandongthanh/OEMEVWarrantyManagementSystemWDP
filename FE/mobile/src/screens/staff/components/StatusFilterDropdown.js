import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  bg: "#0B0F14",
};

const STATUS_LABELS = [
  "CHECKED_IN",
  "IN_DIAGNOSIS",
  "WAITING_FOR_PARTS",
  "IN_REPAIR",
  "PAID",
  "COMPLETED",
  "CANCELLED",
];

export default function StatusFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const selectStatus = (status) => {
    onChange(status === value ? "" : status);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.trigger} onPress={toggleDropdown}>
        <Ionicons name="filter-outline" size={20} color={COLORS.accent} />
        <Text style={styles.selectedText}>
          {value ? value.replaceAll("_", " ") : "All Status"}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            <FlatList
              data={STATUS_LABELS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isActive = item === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => selectStatus(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}
                    >
                      {item.replaceAll("_", " ")}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  selectedText: {
    color: COLORS.text,
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    width: "80%",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optionActive: {
    backgroundColor: COLORS.accent,
  },
  optionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textTransform: "capitalize",
  },
  optionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
