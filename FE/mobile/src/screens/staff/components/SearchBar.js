import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
};

export default function SearchBar({ value, onChange, onClear, placeholder }) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
      <TextInput
        placeholder={placeholder || "Search..."}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />
      {value ? (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
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
    borderRadius: 10,
    height: 46, // ✅ Chiều cao cố định bằng filter button
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    marginLeft: 6,
    paddingVertical: 0, // ✅ loại bỏ khoảng thừa trên dưới
  },
});
