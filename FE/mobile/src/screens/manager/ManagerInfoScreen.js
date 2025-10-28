import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
};

export default function ManagerInfoScreen() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const managerName = await AsyncStorage.getItem("managerName");
        const userRole = await AsyncStorage.getItem("userRole");
        const userId = await AsyncStorage.getItem("userId");
        setInfo({ managerName, userRole, userId });
      } catch (err) {
        console.error("Failed to load manager info:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      alert("Logged out successfully!");
      navigation.replace("Login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0B0F14", "#11161C"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="person-circle-outline"
          size={70}
          color={COLORS.accent}
        />
        <Text style={styles.name}>{info?.managerName || "Manager"}</Text>
        <Text style={styles.role}>
          {info?.userRole?.replace("service_center_", "").toUpperCase() ||
            "MANAGER"}
        </Text>
      </View>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>🆔 Manager ID</Text>
        <Text style={styles.value}>{info?.userId || "N/A"}</Text>

        <Text style={styles.label}>🏢 Role</Text>
        <Text style={styles.value}>
          {info?.userRole || "service_center_manager"}
        </Text>

        <Text style={styles.label}>🕒 Logged In</Text>
        <Text style={styles.value}>
          {new Date().toLocaleString("en-GB", { hour12: false })}
        </Text>
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  name: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 8,
  },
  role: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 14,
    marginTop: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
  value: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
  },
  logoutBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 40,
  },
  logoutText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 15,
  },
});
