import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 🎨 LIGHT THEME COLORS
const COLORS = {
  surface: "#FFFFFF",    // Nền trắng
  border: "#E5E7EB",     // Viền xám nhạt
  text: "#111827",       // Chữ đen đậm
  textMuted: "#9CA3AF",  // Chữ xám (placeholder)
  inputBg: "#F9FAFB",    // (Tuỳ chọn) Nền input nếu muốn hơi xám nhẹ, hiện tại đang dùng Surface
};

export default function SearchBar({ value, onChange, onClear, placeholder }) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
      <TextInput
        placeholder={placeholder || "Search..."}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12, // ✅ Bo góc 12 cho đồng bộ với các thẻ khác
    height: 48,       // ✅ Chiều cao chuẩn 48px
    paddingHorizontal: 12,
    // Shadow nhẹ để nổi bật trên nền xám
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 0, // Căn giữa text theo chiều dọc tốt hơn trên Android
    height: "100%",
  },
});