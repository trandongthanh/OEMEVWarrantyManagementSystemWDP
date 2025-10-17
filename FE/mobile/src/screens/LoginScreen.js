import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { login } from "../services/authService";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password!");
      return;
    }

    try {
      setLoading(true);
      const res = await login(username, password);
      console.log("✅ Login response:", res);

      if (res.status === "success" && res.data?.token) {
        const token = res.data.token;

        // ✅ Giải mã token để lấy thông tin user
        const decoded = jwtDecode(token);
        console.log("🔍 Decoded JWT:", decoded);

        const role = decoded.roleName;
        const userId = decoded.userId;

        // ✅ Lưu token và role vào AsyncStorage
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userRole", role);
        await AsyncStorage.setItem("userId", userId);

        Alert.alert("🎉 Login Successful", `Welcome ${username}`);

        // ✅ Điều hướng theo vai trò
        setTimeout(() => {
          switch (role) {
            case "service_center_manager":
              navigation.replace("ManagerDashboard");
              break;
            case "service_center_staff":
              navigation.replace("StaffDashboard");
              break;
            case "service_center_technician":
              navigation.replace("TechnicianDashboard");
              break;
            default:
              Alert.alert(
                "Unknown Role",
                `Your role "${role}" is not recognized.`
              );
          }
        }, 800);
      } else {
        Alert.alert("Login Failed", "Invalid username or password.");
      }
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      Alert.alert("Login Failed", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>EV Warranty Management</Text>
      <Text style={styles.subtitle}>Vehicle Warranty Management System</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>© 2025 EV Warranty Center</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B3D91",
  },
  subtitle: {
    color: "#666",
    marginBottom: 30,
  },
  form: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#0B3D91",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerText: {
    position: "absolute",
    bottom: 20,
    color: "#888",
    fontSize: 12,
  },
});
