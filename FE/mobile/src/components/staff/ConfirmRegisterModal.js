// src/components/staff/ConfirmRegisterModal.js
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
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
            size={40}
            color={COLORS.danger}
          />
          <Text style={styles.title}>Customer Not Found</Text>
          <Text style={styles.text}>
            The system couldn’t find any customer with this information.
          </Text>
          <Text style={[styles.text, { marginBottom: 20 }]}>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  text: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  confirmBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    width: 180,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 12,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
