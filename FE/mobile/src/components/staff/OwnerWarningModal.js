// components/staff/OwnerWarningModal.js
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  warning: "#FACC15",
  accent: "#3B82F6",
  bg: "#0B0F14",
};

export default function OwnerWarningModal({ visible, onClose, onRegister }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Ionicons name="warning-outline" size={46} color={COLORS.warning} />
          <Text style={styles.title}>Owner Registration Required</Text>
          <Text style={styles.subText}>
            This vehicle does not have a registered owner.{"\n"}
            You must register an owner before creating a warranty claim.
          </Text>

          {/* Hai nút hành động */}
          <View style={styles.actionRow}>
            <LinearGradient
              colors={["#2563EB", "#3B82F6", "#60A5FA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.btn, { flex: 1 }]}
            >
              <TouchableOpacity
                onPress={onRegister}
                activeOpacity={0.9}
                style={styles.btnInner}
              >
                <Text style={styles.btnText}>Register Owner</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onClose}
              activeOpacity={0.9}
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: "90%",
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
      },
    }),
  },
  title: {
    color: COLORS.warning,
    fontWeight: "700",
    fontSize: 17,
    marginTop: 8,
    textAlign: "center",
  },
  subText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 22,
    textAlign: "center",
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  btn: {
    borderRadius: 10,
    flex: 1,
  },
  btnInner: {
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.textMuted,
    fontWeight: "600",
  },
});
