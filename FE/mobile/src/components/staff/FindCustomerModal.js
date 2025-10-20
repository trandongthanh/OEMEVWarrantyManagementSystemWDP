import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { findCustomer } from "../../services/customerService";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
};

export default function FindCustomerModal({ visible, vin, onClose }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!input.trim()) {
      setError("Please enter phone number or email.");
      return;
    }

    setError("");
    setCustomer(null);
    setLoading(true);

    // 🧠 Xác định là phone hay email
    const isEmail = /\S+@\S+\.\S+/.test(input);
    const phone = isEmail ? "" : input;
    const email = isEmail ? input : "";

    // ✅ Log giá trị trước khi gọi API
    console.log("📤 Sending findCustomer request with:", { phone, email });

    try {
      const data = await findCustomer(phone, email);
      console.log("✅ API Response:", JSON.stringify(data, null, 2));

      if (data.status === "success" && data.data?.customer) {
        setCustomer(data.data.customer);
      } else {
        console.warn("⚠️ No customer found in response:", data);
        setError("Customer not found.");
      }
    } catch (err) {
      console.error(
        "❌ Error calling findCustomer:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Customer not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="person-outline" size={22} color="#fff" />
            <Text style={styles.title}>Find Customer</Text>
          </View>

          <Text style={styles.vinText}>
            VIN Found: <Text style={{ color: COLORS.accent }}>{vin}</Text>
          </Text>

          {/* Input */}
          <Text style={styles.label}>Phone number or Email</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +84123456789 or customer@example.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="default"
            autoCapitalize="none"
            value={input}
            onChangeText={setInput}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Search button */}
          <TouchableOpacity
            style={[styles.searchBtn, loading && { opacity: 0.7 }]}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={["#2563EB", "#3B82F6", "#60A5FA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <Text style={styles.btnText}>Search Customer</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          {/* Show result */}
          {customer && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Customer found ✅</Text>
              <Text style={styles.resultInfo}>
                Full Name: {customer.fullName}
              </Text>
              <Text style={styles.resultInfo}>Phone: {customer.phone}</Text>
              <Text style={styles.resultInfo}>Email: {customer.email}</Text>
              <Text style={styles.resultInfo}>Address: {customer.address}</Text>

              <TouchableOpacity
                onPress={() =>
                  console.log(
                    `📄 Ready to register ${customer.fullName} as owner of ${vin}`
                  )
                }
                style={styles.confirmBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.confirmText}>Register This Customer</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// 🎨 Styles (giữ nguyên)
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    width: "95%",
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  vinText: {
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    color: COLORS.text,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchBtn: {
    marginTop: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  gradientBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginTop: 4,
  },
  resultBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 10,
  },
  resultTitle: {
    color: COLORS.accent,
    fontWeight: "700",
    marginBottom: 6,
  },
  resultInfo: {
    color: COLORS.text,
    marginBottom: 4,
  },
  confirmBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: 18,
    alignItems: "center",
  },
  closeText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
