import React, { useState } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6", // xanh neon
  accentGlow: "#60A5FA", // ánh sáng neon
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
              shadowColor: COLORS.accentGlow,
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 6,
            },
          ]}
        >
          {/* Icon search đầu ô */}
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
            onSubmitEditing={handleSearchPress}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

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

      {/* Toast hiển thị lỗi / cảnh báo */}
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
    backgroundColor: "#141A22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2633",
    paddingHorizontal: 6,
    height: 48,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
    marginTop: Platform.OS === "ios" ? 1 : 0,
  },
});
