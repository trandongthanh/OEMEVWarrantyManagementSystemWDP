import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ManagerDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👨‍💼 Manager Dashboard</Text>
      <Text style={styles.subtext}>
        Welcome! Manage staff, technicians, and reports here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, fontWeight: "bold", color: "#0B3D91" },
  subtext: { color: "#555", marginTop: 10 },
});
