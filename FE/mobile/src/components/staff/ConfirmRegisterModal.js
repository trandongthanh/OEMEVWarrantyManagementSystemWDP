import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// 🎨 LIGHT THEME
const COLORS = {
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  danger: "#EF4444",
};

export default function ConfirmRegisterModal({ visible, onClose, onConfirm }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.danger}
            style={{marginBottom: 10}}
          />
          <Text style={styles.title}>Customer Not Found</Text>
          <Text style={styles.text}>
            The system couldn’t find any customer with this information.
          </Text>
          <Text style={[styles.text, { marginBottom: 24, fontWeight: '500' }]}>
            Would you like to register a new owner?
          </Text>

          {/* Confirm button */}
          <TouchableOpacity onPress={onConfirm} activeOpacity={0.9}>
            <LinearGradient
              colors={["#2563EB", "#3B82F6", "#60A5FA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmBtn}
            >
              <Text style={styles.confirmText}>Register New Owner</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    alignItems: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  text: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
    fontSize: 15
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    width: 200,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '500'
  },
});