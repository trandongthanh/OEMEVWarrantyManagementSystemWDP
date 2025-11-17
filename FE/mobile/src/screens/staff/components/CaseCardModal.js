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
import CaseLineCard from "./CaseLineCard"; // ✅ import thêm

const COLORS = {
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  cardBg: "#161C25",
};

export default function CaseCardModal({ visible, caseData, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <Ionicons name="hammer-outline" size={22} color={COLORS.accent} />
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
    backgroundColor: "rgba(0,0,0,0.7)",
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 6,
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  guaranteeText: {
    color: COLORS.textMuted,
    marginBottom: 10,
    fontSize: 13,
    textAlign: "center",
  },
  closeBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  closeText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  empty: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
});
