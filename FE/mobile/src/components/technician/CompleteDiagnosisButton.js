import React, { useState, useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal, 
  View, 
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { processingRecordService, technicianService } from "../../services/technician";

export default function CompleteDiagnosisButton({
  recordId,
  onSuccess,
  disabled = false,
  onNavigateToInstall,
  caseLines = [], 
  style, 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 

  const isReadyToComplete = useMemo(() => {
    if (!caseLines || caseLines.length === 0) return false; 

    const draftLines = caseLines.filter(cl => !cl.status || cl.status === 'DRAFT');
    
    if (draftLines.length === 0) return true;

    const hasMissingInfo = draftLines.some(cl => !cl.diagnosisText || cl.diagnosisText.trim() === '');
    
    return !hasMissingInfo; 
  }, [caseLines]);

  const isButtonDisabled = disabled || isSubmitting || isValidating || !isReadyToComplete;

  const handleCompleteDiagnosis = async () => {
    const draftCaseLines = caseLines.filter(
      (cl) => cl.status === "DRAFT" || !cl.status
    );
    const missingDiagnosis = draftCaseLines.filter(
      (cl) => !cl.diagnosisText || cl.diagnosisText.trim() === ""
    );

    if (missingDiagnosis.length > 0) {
      Alert.alert("Incomplete", `${missingDiagnosis.length} items are missing a diagnosis description.`);
      return;
    }

    setIsValidating(true);
    try {
      const recordResponse = await technicianService.getRecordDetails(recordId);
      const fullRecord = recordResponse.data?.record;

      if (!fullRecord || !fullRecord.guaranteeCases) {
        Alert.alert("Error", "Cannot verify record information. Please try again.");
        setIsValidating(false);
        return;
      }

      const guaranteeCasesInDiagnosis = fullRecord.guaranteeCases.filter(
        (gc) => gc.status === "IN_DIAGNOSIS"
      );

      const undiagnosedCases = guaranteeCasesInDiagnosis.filter((gc) => {
        const hasNoCaseLines = !gc.caseLines || gc.caseLines.length === 0;
        if (hasNoCaseLines) return true;

        const allMissingDiagnosis = gc.caseLines?.every(
          (cl) => !cl.diagnosisText || cl.diagnosisText.trim() === ""
        );
        return allMissingDiagnosis;
      });

      if (undiagnosedCases.length > 0) {
        Alert.alert(
          "Incomplete", 
          `There are undiagnosed warranty cases. Please check again.`
        );
        setIsValidating(false);
        return;
      }

      setShowConfirmModal(true);

    } catch (err) {
      console.error("Failed to validate:", err);
      Alert.alert("Error", "Cannot verify record status.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmComplete = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      await processingRecordService.completeDiagnosis(recordId);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed:", err);
      Alert.alert("Error", "Cannot complete diagnosis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSuccess?.(); 
  };

  const handleNavigateToInstall = () => {
    setShowSuccessModal(false);
    onSuccess?.(); 
    onNavigateToInstall?.(); 
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleCompleteDiagnosis}
        disabled={isButtonDisabled}
        style={[
          styles.button,
          isButtonDisabled && styles.disabledButton, 
          style,
        ]}
      >
        {isSubmitting || isValidating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="checkmark-done-circle-outline" size={20} color="#FFFFFF" />
        )}
        <Text style={styles.buttonText}>
          {isValidating ? "Validating..." : isSubmitting ? "Processing..." : "Complete Diagnosis"}
        </Text>
      </TouchableOpacity>

      {/* --- Modal Confirm & Success --- */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowConfirmModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Diagnosis</Text>
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.infoBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#1D4ED8"
                />
                <Text style={styles.infoText}>
                  This action will submit all diagnosis items for approval and cannot be undone. Are you sure?
                </Text>
              </View>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmComplete}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmButtonText}>
                  {isSubmitting ? "Processing..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleSuccessClose}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.successHeader}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
              </View>
              <Text style={styles.successTitle}>Diagnosis Completed!</Text>
              <Text style={styles.successSubtitle}>
                Items have been submitted for approval. What would you like to do next?
              </Text>
            </View>
            <View style={styles.successBody}>
              {onNavigateToInstall && (
                <TouchableOpacity
                  style={styles.nextStepButton}
                  onPress={handleNavigateToInstall}
                >
                  <Ionicons name="cube-outline" size={20} color="#1D4ED8" />
                  <View style={styles.nextStepTextContainer}>
                    <Text style={styles.nextStepTitle}>
                      View Components to Install
                    </Text>
                    <Text style={styles.nextStepSubtitle}>
                      Check components approved for installation
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#1D4ED8" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { width: "100%" }]}
                onPress={handleSuccessClose}
              >
                <Text style={styles.cancelButtonText}>Back to My Tasks</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    backgroundColor: "#1D4ED8", 
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#93C5FD", 
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 12 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  closeButton: { padding: 4 },
  modalBody: { padding: 16 },
  infoBox: { flexDirection: "row", backgroundColor: "#EFF6FF", padding: 12, borderRadius: 8, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 14, color: "#1E40AF", marginLeft: 8, lineHeight: 20 },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 8 },
  cancelButton: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#D1D5DB" },
  cancelButtonText: { fontSize: 16, fontWeight: "500", color: "#374151", textAlign: "center" },
  confirmButton: { backgroundColor: "#1D4ED8" },
  confirmButtonText: { fontSize: 16, fontWeight: "500", color: "#FFFFFF" },
  successHeader: { alignItems: "center", padding: 24, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  successIconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  successBody: { padding: 16 },
  nextStepButton: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#EFF6FF", borderRadius: 12, borderWidth: 1, borderColor: "#DBEAFE", marginBottom: 12 },
  nextStepTextContainer: { flex: 1, marginLeft: 12 },
  nextStepTitle: { fontSize: 16, fontWeight: "500", color: "#111827" },
  nextStepSubtitle: { fontSize: 12, color: "#6B7280" },
});