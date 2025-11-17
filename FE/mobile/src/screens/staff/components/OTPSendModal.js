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

const COLORS = {
  bg: "rgba(0,0,0,0.55)",
  surface: "#12171F",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
};

export default function OTPSendModal({
  visible,
  defaultEmail,
  vin, // ⭐ VIN HERE
  onSent,
  onClose,
}) {
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
      const res = await otpService.sendOtp(email.trim(), vin); // ⭐ SEND VIN
      if (res.status === "success") {
        onSent(email.trim());
      } else {
        setAlert(res.message || "Failed to send OTP.");
      }
    } catch (e) {
      setAlert("Server error sending OTP.");
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
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setAlert("");
              }}
              placeholder="Enter email"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {alert !== "" && <Text style={styles.error}>{alert}</Text>}

          {/* ROW BUTTONS */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.cancelBtn]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!isValid || loading) && { opacity: 0.5 },
              ]}
              disabled={!isValid || loading}
              onPress={handleSend}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendText}>Send OTP</Text>
              )}
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
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
  },
  modal: {
    width: "88%",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  title: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1F27",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 8,
  },
  error: {
    textAlign: "center",
    color: COLORS.danger,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
  },
  sendBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 8,
  },
  sendText: { color: "#fff", fontWeight: "700" },
  cancelText: { color: COLORS.danger, fontWeight: "700" },
});
