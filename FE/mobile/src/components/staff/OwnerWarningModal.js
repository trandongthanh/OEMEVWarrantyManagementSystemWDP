import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  warning: "#F59E0B",
  accent: "#3B82F6",
  bg: "#F9FAFB",
  overlay: "rgba(0,0,0,0.5)"
};

export default function OwnerWarningModal({ visible, onClose, onRegister }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.iconBox}>
             <Ionicons name="warning-outline" size={40} color={COLORS.warning} />
          </View>
          <Text style={styles.title}>Owner Registration Required</Text>
          <Text style={styles.subText}>
            This vehicle does not have a registered owner.{"\n"}
            You must register an owner before creating a warranty claim.
          </Text>

          <View style={styles.actionRow}>
            <LinearGradient
              colors={["#2563EB", "#3B82F6", "#60A5FA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.btn, { flex: 1, borderRadius: 10, marginRight: 10 }]}
            >
              <TouchableOpacity onPress={onRegister} activeOpacity={0.9} style={styles.btnInner}>
                <Text style={styles.btnText}>Register Owner</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: "100%",
    maxWidth: 340,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconBox: {
      backgroundColor: "#FFFBEB",
      padding: 12,
      borderRadius: 40,
      marginBottom: 16
  },
  title: {
    color: "#B45309", // Vàng đậm hơn cho dễ đọc
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8
  },
  subText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden'
  },
  btnInner: {
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 15 },
});