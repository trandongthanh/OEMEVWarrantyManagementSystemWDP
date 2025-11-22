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

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  bg: "#F9FAFB",
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <Ionicons name="filter-outline" size={18} color={COLORS.textMuted} />
           <Text style={styles.selectedText}>
             {value ? value.replaceAll("_", " ") : "All Status"}
           </Text>
        </View>
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
                    {isActive && <Ionicons name="checkmark" size={16} color={COLORS.accent} />}
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  selectedText: {
    color: COLORS.text,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500'
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)", // Overlay nhạt hơn
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    width: "85%",
    maxHeight: "60%",
    paddingVertical: 8,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  optionActive: {
    backgroundColor: "#EFF6FF", // Xanh rất nhạt
  },
  optionText: {
    color: COLORS.text,
    fontSize: 14,
    textTransform: "capitalize",
  },
  optionTextActive: {
    color: COLORS.accent,
    fontWeight: "600",
  },
});