import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// 🎨 LIGHT THEME COLORS
const COLORS = {
  bg: "#F3F4F6",        // Xám nhạt
  surface: "#FFFFFF",    // Trắng
  border: "#E5E7EB",     // Viền xám
  text: "#111827",       // Đen xám
  textMuted: "#6B7280",  // Xám chữ phụ
  accent: "#3B82F6",     // Xanh dương
  danger: "#EF4444",     // Đỏ
};

export default function StaffInfoScreen() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const staffName = await AsyncStorage.getItem("staffName");
        const userRole = await AsyncStorage.getItem("userRole");
        const userId = await AsyncStorage.getItem("userId");
        setInfo({ staffName, userRole, userId });
      } catch (err) {
        console.error("Failed to load staff info:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name="person"
            size={60}
            color={COLORS.accent}
          />
        </View>
        <Text style={styles.name}>{info?.staffName || "Unknown Staff"}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {info?.userRole?.replace("service_center_", "").toUpperCase() ||
              "NO ROLE"}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>
            {info?.userRole || "service_center_staff"}
          </Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Logged In</Text>
          <Text style={styles.value}>
            {new Date().toLocaleString("en-GB", { hour12: false })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          try {
            await AsyncStorage.clear();
            alert("Logged out successfully!");
            navigation.replace("Login");
          } catch (err) {
            console.error("Logout failed:", err);
          }
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DBEAFE", // Xanh nhạt
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "bold",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  roleText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bg,
    marginHorizontal: 16,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: COLORS.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 40,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 16,
  },
});