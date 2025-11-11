import React, { useState } from "react";
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
import processingRecordService from "../../services/technician/processingRecordService";

export default function CompleteDiagnosisButton({
  recordId,
  onSuccess,
  disabled = false,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCompleteDiagnosis = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmComplete = async () => {
    setShowConfirmModal(false);
    setError(null);
    setIsSubmitting(true);

    try {
      await processingRecordService.completeDiagnosis(recordId);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to complete diagnosis:", err);
      const message =
        err.response?.data?.message || "Failed to complete diagnosis";
      setError(message);
      Alert.alert("Lỗi", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleCompleteDiagnosis}
        disabled={disabled || isSubmitting}
        style={[
          styles.button,
          (disabled || isSubmitting) && styles.disabledButton,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="checkmark-done-circle-outline" size={20} color="#FFFFFF" />
        )}
        <Text style={styles.buttonText}>
          {isSubmitting ? "Đang hoàn tất..." : "Hoàn tất Chẩn đoán"}
        </Text>
      </TouchableOpacity>

      {/* Modal xác nhận */}
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
              <Text style={styles.modalTitle}>Hoàn tất Chẩn đoán</Text>
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
                  Hành động này sẽ gửi tất cả hạng mục chẩn đoán đi duyệt và
                  không thể hoàn tác. Bạn có chắc chắn?
                </Text>
              </View>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmComplete}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmButtonText}>
                  {isSubmitting ? "Đang..." : "Xác nhận"}
                </Text>
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
    backgroundColor: "#1D4ED8", // Blue
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#60A5FA", // Lighter Blue
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    marginLeft: 8,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  confirmButton: {
    backgroundColor: "#1D4ED8",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});