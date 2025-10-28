import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ManagerDashboardHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏠 Manager Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: "#E6EAF2", fontSize: 18, fontWeight: "600" },
});
