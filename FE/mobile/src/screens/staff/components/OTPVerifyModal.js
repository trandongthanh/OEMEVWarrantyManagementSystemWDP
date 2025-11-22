import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import otpService from "../../../services/otpService";

// 🎨 LIGHT THEME
const COLORS = {
  overlay: "rgba(0,0,0,0.5)",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  danger: "#EF4444",
  inputBg: "#F9FAFB",
  inputBorder: "#D1D5DB"
};

export default function OTPVerifyModal({ visible, email, onVerified, onClose }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text !== "" && index < 5) inputs.current[index + 1].focus();
      if (text === "" && index > 0) inputs.current[index - 1].focus();
      setAlert("");
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setAlert("OTP must be 6 digits.");
      return;
    }
    setLoading(true);
    setAlert("");
    try {
      const res = await otpService.verifyOtp(email, code);
      if (res.status === "success") onVerified();
      else setAlert(res.message || "Invalid OTP.");
    } catch {
      setAlert("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We’ve sent a 6-digit code to{"\n"}
            <Text style={{ color: COLORS.accent, fontWeight: "600" }}>{email}</Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[styles.otpInput, digit ? styles.otpFilled : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(t) => handleChange(t, index)}
              />
            ))}
          </View>

          {alert ? <Text style={styles.error}>{alert}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
  box: {
    width: "90%",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    color: COLORS.text,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
  otpFilled: {
    borderColor: COLORS.accent,
    backgroundColor: "#EFF6FF", // Xanh nhạt khi có số
  },
  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 18,
    fontSize: 15,
  },
});