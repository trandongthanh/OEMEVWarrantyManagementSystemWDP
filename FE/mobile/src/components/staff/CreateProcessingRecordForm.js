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

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
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

  // RESET
  useEffect(() => {
    if (visible) {
      setNote("");
      setCases([{ contentGuarantee: "" }]);
      setAlertBox(null);
    }
  }, [visible]);

  const addCase = () => setCases([...cases, { contentGuarantee: "" }]);

  const removeCase = (i) =>
    setCases((prev) => prev.filter((_, idx) => idx !== i));

  const updateCase = (text, i) => {
    const list = [...cases];
    list[i].contentGuarantee = text;
    setCases(list);
  };

  // ====================== SUBMIT ======================
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

  // ====================== CREATE RECORD ======================
  const actuallyCreateProcessingRecord = async () => {
    setLoading(true);

    const validCases = cases.filter((c) => c.contentGuarantee.trim() !== "");

    // ⭐ FIX: chuẩn BE không cho note rỗng → gửi undefined
    const finalNote = note.trim().length === 0 ? undefined : note.trim();

    // ⭐ FIX: Backend không cho visitorInfo.address → xoá field này
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
        setAlertBox({
          type: "success",
          title: "Record Created",
          message: "Processing record created successfully.",
        });

        setTimeout(() => onClose(true), 1200);
      } else {
        setAlertBox({
          type: "error",
          title: "Error",
          message: res.message || "Failed to create record.",
        });
      }
    } catch (err) {
      console.log("❌ Error creating record:", err);
      setAlertBox({
        type: "error",
        title: "Server Error",
        message: err?.message || "Failed to create record.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ====================== ALERT BOX ======================
  const renderAlert = () => {
    if (!alertBox) return null;

    let borderColor = COLORS.border;
    let bgColor = COLORS.surface;

    if (alertBox.type === "error") {
      borderColor = COLORS.danger;
      bgColor = "#2A0E0E";
    }

    if (alertBox.type === "success") {
      borderColor = "#22C55E";
      bgColor = "#0E2415";
    }

    return (
      <View
        style={[styles.alertBox, { borderColor, backgroundColor: bgColor }]}
      >
        <Text style={styles.alertTitle}>{alertBox.title}</Text>
        <Text style={styles.alertMsg}>{alertBox.message}</Text>
      </View>
    );
  };

  return (
    <>
      {/* MAIN FORM */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.center}
        >
          <View style={[styles.modalBox, { maxHeight: height * 0.95 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Create Processing Record</Text>

              {renderAlert()}

              <Text style={styles.label}>VIN</Text>
              <TextInput
                style={[styles.input, styles.readonly]}
                value={vin}
                editable={false}
              />

              <Text style={styles.label}>Odometer</Text>
              <TextInput
                style={[styles.input, styles.readonly]}
                value={`${odometer}`}
                editable={false}
              />

              <Text style={styles.section}>Owner Information</Text>

              <TextInput
                style={[styles.input, styles.readonly]}
                value={ownerFullName}
                editable={false}
              />

              <TextInput
                style={[styles.input, styles.readonly]}
                value={ownerEmail}
                editable={false}
              />

              <TextInput
                style={[styles.input, styles.readonly]}
                value={ownerPhone}
                editable={false}
              />

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
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={COLORS.accent}
                  />
                </TouchableOpacity>
              </View>

              {cases.map((item, idx) => (
                <View key={idx} style={styles.caseBox}>
                  <View style={styles.caseHeader}>
                    <Text style={styles.caseTitle}>Case {idx + 1}</Text>

                    {cases.length > 1 && (
                      <TouchableOpacity onPress={() => removeCase(idx)}>
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={COLORS.danger}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    style={[styles.input, { height: 90 }]}
                    placeholder="Describe issue..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    value={item.contentGuarantee}
                    onChangeText={(t) => updateCase(t, idx)}
                  />
                </View>
              ))}

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => onClose(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmitPressed}
                >
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SEND OTP */}
      <OTPSendModal
        visible={showSendOtpModal}
        defaultEmail={otpEmail}
        vin={vin} // ⭐ TRUYỀN VIN
        onSent={handleOtpSent}
        onClose={() => setShowSendOtpModal(false)}
      />

      <OTPVerifyModal
        visible={showVerifyOtpModal}
        vin={vin} // ⭐ TRUYỀN VIN
        email={otpEmail}
        onVerified={handleOtpVerified}
        onClose={() => setShowVerifyOtpModal(false)}
      />
    </>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  modalBox: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  section: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 15,
    marginTop: 12,
  },

  label: {
    color: COLORS.textMuted,
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    padding: 10,
    color: COLORS.text,
    borderRadius: 8,
    marginBottom: 10,
  },

  readonly: {
    color: COLORS.textMuted,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  caseBox: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },

  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  caseTitle: {
    color: COLORS.textMuted,
    fontSize: 13,
  },

  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#1A1111",
  },

  cancelText: {
    color: COLORS.danger,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },

  alertBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  alertTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: COLORS.text,
  },

  alertMsg: {
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
