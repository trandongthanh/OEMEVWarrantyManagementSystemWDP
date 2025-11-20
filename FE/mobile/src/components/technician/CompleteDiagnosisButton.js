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
// Thêm technicianService để gọi API lấy chi tiết phiếu
import { processingRecordService, technicianService } from "../../services/technician";

export default function CompleteDiagnosisButton({
  recordId,
  onSuccess,
  disabled = false,
  onNavigateToInstall,
  caseLines = [], 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false); // State mới cho loading khi validate
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 

  const handleCompleteDiagnosis = async () => {
    // 1. Validate cục bộ (như cũ)
    const draftCaseLines = caseLines.filter(
      (cl) => cl.status === "DRAFT" || !cl.status
    );
    const missingDiagnosis = draftCaseLines.filter(
      (cl) => !cl.diagnosisText || cl.diagnosisText.trim() === ""
    );

    if (missingDiagnosis.length > 0) {
      Alert.alert("Chưa hoàn tất", `${missingDiagnosis.length} hạng mục thiếu mô tả chẩn đoán.`);
      return;
    }

    // 2. Validate toàn diện (ĐỒNG BỘ VỚI WEB)
    setIsValidating(true);
    try {
      console.log("🔍 Validating all guarantee cases for recordId:", recordId);
      const recordResponse = await technicianService.getRecordDetails(recordId);
      const fullRecord = recordResponse.data?.record;

      if (!fullRecord || !fullRecord.guaranteeCases) {
        Alert.alert("Lỗi", "Không thể kiểm tra thông tin phiếu. Vui lòng thử lại.");
        setIsValidating(false);
        return;
      }

      // Lấy các case đang trong trạng thái chẩn đoán
      const guaranteeCasesInDiagnosis = fullRecord.guaranteeCases.filter(
        (gc) => gc.status === "IN_DIAGNOSIS"
      );

      // Tìm các case chưa được chẩn đoán (chưa có caseline hoặc caseline thiếu text)
      const undiagnosedCases = guaranteeCasesInDiagnosis.filter((gc) => {
        const hasNoCaseLines = !gc.caseLines || gc.caseLines.length === 0;
        if (hasNoCaseLines) return true;

        const allMissingDiagnosis = gc.caseLines?.every(
          (cl) => !cl.diagnosisText || cl.diagnosisText.trim() === ""
        );
        return allMissingDiagnosis;
      });

      if (undiagnosedCases.length > 0) {
        const caseNumbers = undiagnosedCases.map((_, index) => `Case ${index + 1}`).join(", ");
        Alert.alert(
          "Chưa hoàn tất", 
          `Có ${undiagnosedCases.length} hồ sơ bảo hành chưa được chẩn đoán (${caseNumbers}). Vui lòng xử lý tất cả trước khi hoàn tất.`
        );
        setIsValidating(false);
        return;
      }

      // Nếu tất cả OK, mở modal xác nhận
      setError(null);
      setShowConfirmModal(true);

    } catch (err) {
      console.error("Failed to validate guarantee cases:", err);
      Alert.alert("Lỗi", "Không thể kiểm tra trạng thái phiếu.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmComplete = async () => {
    setShowConfirmModal(false);
    setError(null);
    setIsSubmitting(true);

    try {
      await processingRecordService.completeDiagnosis(recordId);
      setShowSuccessModal(true);
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
        disabled={disabled || isSubmitting || isValidating}
        style={[
          styles.button,
          (disabled || isSubmitting || isValidating) && styles.disabledButton,
        ]}
      >
        {isSubmitting || isValidating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="checkmark-done-circle-outline" size={20} color="#FFFFFF" />
        )}
        <Text style={styles.buttonText}>
          {isValidating ? "Đang kiểm tra..." : isSubmitting ? "Đang xử lý..." : "Hoàn tất Chẩn đoán"}
        </Text>
      </TouchableOpacity>

      {/* Modal Confirm (Giữ nguyên) */}
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

      {/* Modal Success (Giữ nguyên) */}
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
              <Text style={styles.successTitle}>Chẩn đoán Hoàn tất!</Text>
              <Text style={styles.successSubtitle}>
                Các hạng mục đã được gửi đi duyệt. Bạn muốn làm gì tiếp theo?
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
                      Xem Linh kiện chờ Lắp đặt
                    </Text>
                    <Text style={styles.nextStepSubtitle}>
                      Kiểm tra các linh kiện đã được duyệt
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#1D4ED8" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { width: "100%" }]}
                onPress={handleSuccessClose}
              >
                <Text style={styles.cancelButtonText}>Quay lại Dashboard</Text>
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
    backgroundColor: "#60A5FA", 
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
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
    alignItems: "flex-start", 
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
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#1D4ED8",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  successHeader: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  successBody: {
    padding: 16,
  },
  nextStepButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    marginBottom: 12,
  },
  nextStepTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  nextStepSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
});