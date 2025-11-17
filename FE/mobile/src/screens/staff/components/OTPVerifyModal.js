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

const COLORS = {
  bg: "rgba(0,0,0,0.55)",
  surface: "#141820",
  text: "#FFFFFF",
  textMuted: "#A6A6A6",
  accent: "#3B82F6",
  danger: "#EF4444",
};

export default function OTPVerifyModal({
  visible,
  email,
  onVerified,
  onClose,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text !== "" && index < 5) {
        inputs.current[index + 1].focus();
      }
      if (text === "" && index > 0) {
        inputs.current[index - 1].focus();
      }

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
      if (res.status === "success") {
        onVerified();
      } else {
        setAlert(res.message || "Invalid OTP.");
      }
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
            We’ve sent a 6-digit code to{" "}
            <Text style={{ color: COLORS.accent, fontWeight: "600" }}>
              {email}
            </Text>
          </Text>

          {/* OTP 6 boxes */}
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

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ================== STYLES ==================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
  },

  box: {
    width: "90%",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 22,
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#1E2430",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    color: COLORS.text,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },

  otpFilled: {
    borderColor: COLORS.accent,
  },

  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },

  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  cancelText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
  },
});
