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

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
  warningBg: "#2C1A1A",
};

const RELATIONSHIP_OPTIONS = [
  "Owner",
  "Family Member",
  "Mechanic",
  "Friend",
  "Other",
];

const { height } = Dimensions.get("window");

export default function CreateProcessingRecordForm({
  visible,
  vin,
  odometer,
  onClose,
}) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [note, setNote] = useState("");
  const [cases, setCases] = useState([{ contentGuarantee: "" }]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [alertBox, setAlertBox] = useState(null);

  useEffect(() => {
    if (visible) {
      setVisitorName("");
      setVisitorPhone("");
      setRelationship("");
      setNote("");
      setCases([{ contentGuarantee: "" }]);
      setAlertBox(null);
    }
  }, [visible]);

  const handleAddCase = () => setCases([...cases, { contentGuarantee: "" }]);
  const handleRemoveCase = (i) =>
    setCases((prev) => prev.filter((_, index) => index !== i));

  const handleCaseChange = (text, i) => {
    const updated = [...cases];
    updated[i].contentGuarantee = text;
    setCases(updated);
  };

  const handleSubmit = async () => {
    setAlertBox(null);

    if (!vin || !odometer) {
      setAlertBox({
        type: "error",
        title: "Missing Information",
        message: "VIN and Odometer are required.",
      });
      return;
    }

    const validCases = cases.filter(
      (c) => c.contentGuarantee && c.contentGuarantee.trim() !== ""
    );
    if (validCases.length === 0) {
      setAlertBox({
        type: "error",
        title: "Missing Cases",
        message: "Please add at least one valid case.",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        vin,
        odometer: parseInt(odometer),
        visitorInfo: {
          fullName: visitorName || "Unknown visitor",
          phone: visitorPhone || "N/A",
          relationship: relationship || "N/A",
          note,
        },
        guaranteeCases: validCases,
      };

      const res = await createProcessingRecord(payload);

      if (res.status === "success") {
        setAlertBox({
          type: "success",
          title: "✅ Record Created",
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
    } catch (error) {
      console.error("❌ Error creating record:", error);

      if (
        error.response &&
        error.response.status === 409 &&
        error.response.data?.message?.includes("already has an active record")
      ) {
        setAlertBox({
          type: "warning",
          title: "⚠️ Active Record Exists",
          message:
            "This vehicle already has an active processing record. Please complete or close it first.",
        });
      } else if (error.response?.data?.message) {
        setAlertBox({
          type: "error",
          title: "Error",
          message: error.response.data.message,
        });
      } else {
        setAlertBox({
          type: "error",
          title: "Error",
          message: "An unexpected error occurred while creating record.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderAlertBox = () => {
    if (!alertBox) return null;

    let boxColor = COLORS.border;
    let bgColor = COLORS.surface;
    if (alertBox.type === "warning") {
      boxColor = COLORS.danger;
      bgColor = COLORS.warningBg;
    } else if (alertBox.type === "error") {
      boxColor = COLORS.danger;
      bgColor = "#2A0E0E";
    } else if (alertBox.type === "success") {
      boxColor = "#22C55E";
      bgColor = "#0E2415";
    }

    return (
      <View
        style={[
          styles.alertBox,
          { borderColor: boxColor, backgroundColor: bgColor },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {alertBox.type === "warning" && (
            <Ionicons name="warning-outline" size={18} color={COLORS.danger} />
          )}
          {alertBox.type === "error" && (
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={COLORS.danger}
            />
          )}
          {alertBox.type === "success" && (
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#22C55E"
            />
          )}
          <Text
            style={[
              styles.alertTitle,
              {
                color: alertBox.type === "success" ? "#22C55E" : COLORS.danger,
              },
            ]}
          >
            {alertBox.title}
          </Text>
        </View>
        <Text style={styles.alertMessage}>{alertBox.message}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={[styles.modalBox, { maxHeight: height * 0.95 }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <Text style={styles.title}>Create Processing Record</Text>

            {renderAlertBox()}

            {/* VIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>VIN</Text>
              <TextInput
                value={vin || ""}
                editable={false}
                style={[styles.input, { color: COLORS.textMuted }]}
              />
            </View>

            {/* ODO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Odometer (km)</Text>
              <TextInput
                value={odometer ? `${odometer}` : ""}
                editable={false}
                style={[styles.input, { color: COLORS.textMuted }]}
              />
            </View>

            {/* Visitor Info */}
            <Text style={styles.sectionLabel}>Visitor Information</Text>
            <TextInput
              value={visitorName}
              onChangeText={setVisitorName}
              placeholder="Visitor Full Name"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
            />
            <TextInput
              value={visitorPhone}
              onChangeText={setVisitorPhone}
              placeholder="Visitor Phone"
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
            />

            {/* Relationship dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relationship to Owner</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setShowDropdown(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: relationship ? COLORS.text : COLORS.textMuted,
                    fontSize: 14,
                  }}
                >
                  {relationship || "Select relationship..."}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Additional Notes"
              placeholderTextColor={COLORS.textMuted}
              multiline
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            />

            {/* Guarantee Cases */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>Guarantee Cases *</Text>
              <TouchableOpacity onPress={handleAddCase} activeOpacity={0.6}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={COLORS.accent}
                />
              </TouchableOpacity>
            </View>

            {cases.map((item, index) => (
              <View key={index} style={styles.caseBox}>
                <View style={styles.caseHeader}>
                  <Text style={styles.caseTitle}>Case {index + 1}</Text>
                  {cases.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveCase(index)}
                      style={styles.trashBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={COLORS.danger}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  value={item.contentGuarantee}
                  onChangeText={(text) => handleCaseChange(text, index)}
                  placeholder="Describe the issue..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  style={[
                    styles.input,
                    { height: 90, textAlignVertical: "top", flex: 1 },
                  ]}
                />
              </View>
            ))}

            {/* ✅ Buttons Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, loading && { opacity: 0.6 }]}
                onPress={() => onClose(false)}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? "Creating..." : "Submit Record"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Dropdown Modal */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.dropdownOverlay}
          onPress={() => setShowDropdown(false)}
          activeOpacity={1}
        />
        <View style={styles.dropdownBox}>
          {RELATIONSHIP_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                setRelationship(option);
                setShowDropdown(false);
              }}
            >
              <Text
                style={{
                  color: relationship === option ? COLORS.accent : COLORS.text,
                  fontWeight: relationship === option ? "700" : "400",
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  alertBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  alertTitle: { fontWeight: "700", fontSize: 15 },
  alertMessage: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginLeft: 2,
  },
  sectionLabel: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 15,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  inputGroup: { marginBottom: 10 },
  label: { color: COLORS.textMuted, marginBottom: 4, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    color: COLORS.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: COLORS.bg,
    marginBottom: 10,
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: COLORS.bg,
  },
  caseBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    padding: 8,
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  caseTitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  trashBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    padding: 4,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#1A1111", // giống hình bạn gửi
  },
  cancelText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 15,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  dropdownBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    width: "70%",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "center",
    marginTop: "60%",
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
