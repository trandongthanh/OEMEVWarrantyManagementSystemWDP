import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  danger: "#EF4444",
};

export default function ConfirmCloseModal({
  visible,
  onCancel,
  onConfirm,
  closing = false,
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={COLORS.danger}
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.title}>Close Conversation?</Text>
          <Text style={styles.text}>
            Are you sure you want to close this chat? You will no longer be able
            to send or receive messages afterward.
          </Text>

          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, { backgroundColor: COLORS.border }]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.btn,
                { backgroundColor: closing ? "#991B1B" : COLORS.danger },
              ]}
              onPress={onConfirm}
              disabled={closing}
            >
              <Text style={styles.confirmText}>
                {closing ? "Closing..." : "Yes, Close"}
              </Text>
            </Pressable>
          </View>
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
  box: {
    width: "80%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 6,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});
