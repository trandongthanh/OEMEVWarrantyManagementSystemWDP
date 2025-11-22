import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CaseLineCard from "./CaseLineCard";

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
};

export default function CaseCardModal({ visible, caseData, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <Ionicons name="hammer-outline" size={24} color={COLORS.accent} />
            <Text style={styles.title}>
              Case #{caseData?.guaranteeCaseId || ""}
            </Text>
          </View>

          <Text style={styles.guaranteeText}>
            {caseData?.contentGuarantee || "No guarantee content."}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {caseData?.caseLines?.length ? (
              caseData.caseLines.map((line, i) => (
                <CaseLineCard key={i} line={line} />
              ))
            ) : (
              <Text style={styles.empty}>No case lines available.</Text>
            )}
          </ScrollView>

          {/* Back button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="arrow-back-outline" size={18} color="#fff" />
            <Text style={styles.closeText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Nền tối mờ nhẹ hơn
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: "100%",
    maxHeight: "90%",
    padding: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  guaranteeText: {
    color: COLORS.textMuted,
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
  },
  closeBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  closeText: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 16 },
  empty: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
});