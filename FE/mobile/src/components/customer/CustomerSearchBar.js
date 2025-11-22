import React, { useState } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// 🎨 LIGHT THEME COLORS
const COLORS = {
  surface: "#FFFFFF",    // Nền trắng
  border: "#E5E7EB",     // Viền xám nhạt
  text: "#111827",       // Chữ đen
  textMuted: "#9CA3AF",  // Chữ xám placeholder
  accent: "#3B82F6",     // Xanh dương
  accentGlow: "#60A5FA", // Màu shadow khi focus
};

export default function CustomerSearchBar({
  value,
  onChangeText,
  onSearch,
  loading,
}) {
  const [focused, setFocused] = useState(false);

  const handleSearchPress = () => {
    if (!value.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter phone or email before searching.",
        visibilityTime: 2000,
        position: "bottom",
        bottomOffset: 80,
      });
      return;
    }
    onSearch();
  };

  return (
    <>
      <View style={styles.wrapper}>
        <View
          style={[
            styles.searchBox,
            focused && {
              borderColor: COLORS.accent,
              // Shadow xanh nhẹ khi focus
              shadowColor: COLORS.accent,
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        >
          {/* Icon search */}
          <Ionicons
            name="search-outline"
            size={20}
            color={focused ? COLORS.accent : COLORS.textMuted}
            style={{ marginHorizontal: 10 }}
          />

          {/* Input chính */}
          <TextInput
            style={styles.input}
            placeholder="Search by phone or email"
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={onChangeText}
            returnKeyType="search"
            autoCapitalize="none"
            keyboardType="email-address"
            onSubmitEditing={handleSearchPress}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {/* Nút xóa (X) khi có text */}
          {value.length > 0 && !loading && (
            <TouchableOpacity onPress={() => onChangeText("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textMuted}
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          )}

          {/* Loader khi đang tìm kiếm */}
          {loading && (
            <ActivityIndicator
              size="small"
              color={COLORS.accent}
              style={{ marginRight: 10 }}
            />
          )}
        </View>
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface, // ✅ Đã đổi thành #FFFFFF
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border, // ✅ Đã đổi thành viền xám #E5E7EB
    height: 48,
    // Shadow nhẹ nhàng
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text, // ✅ Đã đổi thành chữ đen #111827
    paddingVertical: 0,
    height: "100%", // Đảm bảo input full chiều cao để dễ bấm
  },
});