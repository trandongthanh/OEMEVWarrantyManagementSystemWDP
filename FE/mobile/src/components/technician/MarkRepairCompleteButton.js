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
import { caseLineService } from "../../services/technician";

export default function MarkRepairCompleteButton({
  caseLineId,
  onSuccess,
  disabled = false,
  style,
  showNextSteps = false,
  pendingRepairsCount = 0, 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showSuccess, setShowSuccess] = useState(false); 

  const handleOpenModal = () => {
    setShowConfirmModal(true); 
  };

  const handleConfirmComplete = async () => {
    setShowConfirmModal(false);
    setError(null);
    setIsSubmitting(true);

    try {
      await caseLineService.markRepairComplete(caseLineId);

      if (showNextSteps && pendingRepairsCount > 0) {
        Alert.alert(
          "Hoàn tất!",
          `Bạn còn ${pendingRepairsCount} mục sửa chữa khác đang chờ.`
        );
        onSuccess?.();
      } else {
        onSuccess?.();
      }
    } catch (err) {
      console.error("Failed to mark repair as complete:", err);
      const message =
        err.response?.data?.message || "Failed to mark repair as complete";
      setError(message);
      Alert.alert("Lỗi", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenModal}
        disabled={disabled || isSubmitting}
        style={[
          styles.button,
          (disabled || isSubmitting) && styles.disabledButton,
          style,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
        )}
        <Text style={styles.buttonText}>
          {isSubmitting ? "Đang lưu..." : "Mark Complete"}
        </Text>
      </TouchableOpacity>

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
              <View style={styles.headerIconWrapper}>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              </View>
              <Text style={styles.modalTitle}>Xác nhận hoàn tất</Text>
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
                  color="#0284C7"
                />
                <Text style={styles.infoText}>
                  Hãy chắc chắn rằng linh kiện đã được lắp đặt và mọi công việc
                  sửa chữa đã kết thúc.
                </Text>
              </View>
              <Text style={styles.confirmText}>
                Bạn có chắc chắn muốn đánh dấu sửa chữa này là đã hoàn tất?
              </Text>
              {pendingRepairsCount > 0 && (
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingText}>
                    Bạn còn {pendingRepairsCount} mục sửa chữa khác đang chờ.
                  </Text>
                </View>
              )}
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
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
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
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#166534",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
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
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerIconWrapper: {
    padding: 8,
    backgroundColor: "#F0FDF4", 
    borderRadius: 8,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF", //
    padding: 12,
    borderRadius: 8,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0284C7",
    marginLeft: 8,
    lineHeight: 18,
  },
  confirmText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  pendingBox: {
    backgroundColor: "#FFFBEB", //
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 16,
  },
  pendingText: {
    fontSize: 13,
    color: "#B45309",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#16A34A",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});