import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Toast from "react-native-toast-message";
import { login } from "../services/authService";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  accentSoft: "#2563EB",
  danger: "#EF4444",
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Information ⚠️",
        text2: "Please enter both username and password.",
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await login(username, password);
      if (res.status === "success" && res.data?.token) {
        const token = res.data.token;
        const decoded = jwtDecode(token);
        const role = decoded.roleName;
        const userId = decoded.userId;

        await AsyncStorage.multiSet([
          ["authToken", token],
          ["userRole", role],
          ["userId", userId],
          ["staffName", username],
        ]);

        Toast.show({
          type: "success",
          text1: "Welcome back 🚗",
          text2: `${username}`,
          position: "top",
          visibilityTime: 1800,
        });

        setTimeout(() => {
          switch (role) {
            case "service_center_manager":
              navigation.replace("ManagerDashboardTabs");
              break;
            case "service_center_staff":
              navigation.replace("StaffDashboardTabs");
              break;
            case "service_center_technician":
              navigation.replace("TechnicianDashboard");
              break;
            default:
              Toast.show({
                type: "info",
                text1: "Unknown Role",
                text2: `Your role "${role}" is not recognized.`,
              });
          }
        }, 800);
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "Invalid username or password.",
          position: "top",
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      Toast.show({
        type: "error",
        text1: "Server Error",
        text2: "Unable to connect to the server.",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0B0F14", "#0D141D"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center", width: "100%" }}
      >
        <View style={styles.header}>
          <Ionicons name="car-sport-outline" size={50} color={COLORS.accent} />
          <Text style={styles.appName}>EV Warranty</Text>
          <Text style={styles.subtitle}>
            Vehicle Warranty Management System
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.textMuted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textMuted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>© 2025 EV Warranty Center</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 10,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    letterSpacing: 0.4,
    marginTop: 4,
  },
  form: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  footerText: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 12,
    position: "absolute",
    bottom: 20,
    width: "100%",
  },
});
