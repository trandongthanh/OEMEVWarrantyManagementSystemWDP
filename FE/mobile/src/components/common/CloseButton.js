import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function CloseButton({ onPress, style }) {
  return (
    <Pressable
      android_ripple={{ color: "#ef44441a" }}
      style={[styles.button, style]}
      onPress={onPress}
    >
      <Text style={styles.text}>Close</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1C0F0F",
    borderColor: "#EF4444",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-end", // 🔹 căn phải
    marginTop: 16,
  },
  text: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 14,
  },
});
