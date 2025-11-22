import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { createProcessingRecord } from "../../services/processingRecordService";
import OTPSendModal from "../../screens/staff/components/OTPSendModal";
import OTPVerifyModal from "../../screens/staff/components/OTPVerifyModal";

// 🎨 LIGHT THEME
const COLORS = {
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  danger: "#EF4444",
  inputBg: "#F3F4F6"
};

const { height } = Dimensions.get("window");

export default function CreateProcessingRecordForm({
  visible,
  vin,
  odometer,
  ownerFullName,
  ownerEmail,
  ownerPhone,
  ownerAddress,
  onClose,
}) {
  const [note, setNote] = useState("");
  const [cases, setCases] = useState([{ contentGuarantee: "" }]);
  const [loading, setLoading] = useState(false);
  const [alertBox, setAlertBox] = useState(null);
  const [showSendOtpModal, setShowSendOtpModal] = useState(false);
  const [showVerifyOtpModal, setShowVerifyOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState(ownerEmail || "");

  useEffect(() => {
    if (visible) {
      setNote("");
      setCases([{ contentGuarantee: "" }]);
      setAlertBox(null);
    }
  }, [visible]);

  const addCase = () => setCases([...cases, { contentGuarantee: "" }]);
  const removeCase = (i) => setCases((prev) => prev.filter((_, idx) => idx !== i));
  const updateCase = (text, i) => {
    const list = [...cases];
    list[i].contentGuarantee = text;
    setCases(list);
  };

  const handleSubmitPressed = () => {
    setOtpEmail(ownerEmail);
    setShowSendOtpModal(true);
  };

  const handleOtpSent = (emailReturned) => {
    setOtpEmail(emailReturned);
    setShowSendOtpModal(false);
    setShowVerifyOtpModal(true);
  };

  const handleOtpVerified = async () => {
    setShowVerifyOtpModal(false);
    await actuallyCreateProcessingRecord();
  };

  const actuallyCreateProcessingRecord = async () => {
    setLoading(true);
    const validCases = cases.filter((c) => c.contentGuarantee.trim() !== "");
    const finalNote = note.trim().length === 0 ? undefined : note.trim();
    const payload = {
      vin,
      odometer: parseInt(odometer),
      visitorInfo: {
        fullName: ownerFullName,
        email: ownerEmail,
        phone: ownerPhone,
        relationship: "Owner",
        note: finalNote,
      },
      guaranteeCases: validCases,
    };

    try {
      const res = await createProcessingRecord(payload);
      if (res.status === "success") {
        setAlertBox({ type: "success", title: "Record Created", message: "Processing record created successfully." });
        setTimeout(() => onClose(true), 1200);
      } else {
        setAlertBox({ type: "error", title: "Error", message: res.message || "Failed to create record." });
      }
    } catch (err) {
      setAlertBox({ type: "error", title: "Server Error", message: err?.message || "Failed to create record." });
    } finally {
      setLoading(false);
    }
  };

  const renderAlert = () => {
    if (!alertBox) return null;
    let borderColor = COLORS.border;
    let bgColor = COLORS.surface;
    let titleColor = COLORS.text;

    if (alertBox.type === "error") {
      borderColor = COLORS.danger;
      bgColor = "#FEF2F2";
      titleColor = COLORS.danger;
    }
    if (alertBox.type === "success") {
      borderColor = "#22C55E";
      bgColor = "#F0FDF4";
      titleColor = "#15803D";
    }

    return (
      <View style={[styles.alertBox, { borderColor, backgroundColor: bgColor }]}>
        <Text style={[styles.alertTitle, {color: titleColor}]}>{alertBox.title}</Text>
        <Text style={styles.alertMsg}>{alertBox.message}</Text>
      </View>
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.center}>
          <View style={[styles.modalBox, { maxHeight: height * 0.95 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Create Processing Record</Text>
              {renderAlert()}

              <Text style={styles.label}>VIN</Text>
              <TextInput style={[styles.input, styles.readonly]} value={vin} editable={false} />

              <Text style={styles.label}>Odometer</Text>
              <TextInput style={[styles.input, styles.readonly]} value={`${odometer}`} editable={false} />

              <Text style={styles.section}>Owner Information</Text>
              <TextInput style={[styles.input, styles.readonly]} value={ownerFullName} editable={false} />
              <TextInput style={[styles.input, styles.readonly]} value={ownerEmail} editable={false} />
              <TextInput style={[styles.input, styles.readonly]} value={ownerPhone} editable={false} />

              <Text style={styles.section}>Additional Notes</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Write a note..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                value={note}
                onChangeText={setNote}
              />

              <View style={styles.row}>
                <Text style={styles.section}>Guarantee Cases *</Text>
                <TouchableOpacity onPress={addCase}>
                  <Ionicons name="add-circle-outline" size={24} color={COLORS.accent} />
                </TouchableOpacity>
              </View>

              {cases.map((item, idx) => (
                <View key={idx} style={styles.caseBox}>
                  <View style={styles.caseHeader}>
                    <Text style={styles.caseTitle}>Case {idx + 1}</Text>
                    {cases.length > 1 && (
                      <TouchableOpacity onPress={() => removeCase(idx)}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={[styles.input, { height: 90, backgroundColor: "#fff" }]}
                    placeholder="Describe issue..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    value={item.contentGuarantee}
                    onChangeText={(t) => updateCase(t, idx)}
                  />
                </View>
              ))}

              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => onClose(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitPressed}>
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <OTPSendModal
        visible={showSendOtpModal}
        defaultEmail={otpEmail}
        vin={vin}
        onSent={handleOtpSent}
        onClose={() => setShowSendOtpModal(false)}
      />

      <OTPVerifyModal
        visible={showVerifyOtpModal}
        vin={vin}
        email={otpEmail}
        onVerified={handleOtpVerified}
        onClose={() => setShowVerifyOtpModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  modalBox: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 12,
    textAlign: "center",
  },
  section: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8
  },
  label: { color: COLORS.textMuted, marginBottom: 4, marginTop: 8, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    padding: 12,
    color: COLORS.text,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 15
  },
  readonly: { color: COLORS.text, backgroundColor: "#F3F4F6", opacity: 0.8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 6
  },
  caseBox: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  caseHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  caseTitle: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  footerRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff"
  },
  cancelText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 16 },
  alertBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  alertTitle: { fontWeight: "700", fontSize: 15 },
  alertMsg: { color: COLORS.textMuted, marginTop: 4, fontSize: 13 },
});