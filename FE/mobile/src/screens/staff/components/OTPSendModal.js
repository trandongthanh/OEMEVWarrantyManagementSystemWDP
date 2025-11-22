import React, { useState, useEffect } from "react";
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
import otpService from "../../../services/otpService";

// 🎨 LIGHT THEME
const COLORS = {
  overlay: "rgba(0,0,0,0.5)",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  danger: "#EF4444",
  inputBg: "#F3F4F6",
};

export default function OTPSendModal({ visible, defaultEmail, vin, onSent, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");
  const isValid = /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    if (visible) {
      setEmail(defaultEmail || "");
      setAlert("");
    }
  }, [visible]);

  const handleSend = async () => {
    if (!isValid) return;
    setLoading(true);
    setAlert("");
    try {
      const res = await otpService.sendOtp(email.trim(), vin);
      if (res.status === "success") onSent(email.trim());
      else setAlert(res.message || "Failed to send OTP.");
    } catch (e) {
      setAlert("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Email Verification</Text>

          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setAlert(""); }}
              placeholder="Enter customer email"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {alert !== "" && <Text style={styles.error}>{alert}</Text>}

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendBtn, (!isValid || loading) && { opacity: 0.5 }]}
              disabled={!isValid || loading}
              onPress={handleSend}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send OTP</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    paddingHorizontal: 20,
  },
  modal: {
    width: "88%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  input: { flex: 1, color: COLORS.text, fontSize: 16, marginLeft: 10 },
  error: { textAlign: "center", color: COLORS.danger, marginTop: 4, marginBottom: 10 },
  row: { flexDirection: "row", marginTop: 20, gap: 12 },
  sendBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  sendText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelText: { color: COLORS.danger, fontWeight: "700", fontSize: 15 },
});