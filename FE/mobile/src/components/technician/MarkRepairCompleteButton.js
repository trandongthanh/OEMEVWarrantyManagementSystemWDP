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
  Image,
  ScrollView,
  Platform, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import * as ImagePicker from 'expo-image-picker'; 
import { caseLineService, imageUploadService } from "../../services/technician";

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
  const [imageFiles, setImageFiles] = useState([]); 

  const handleImageSelect = async () => { 
    try {
      console.log("--- BẮT ĐẦU CHỌN ẢNH ---");
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Thiếu quyền truy cập', 
          'Vui lòng vào Cài đặt > Ứng dụng > [Tên App] > Quyền > Ảnh và Video để cấp quyền.'
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        // --- CẬP NHẬT: Dùng mảng string thay vì Enum cũ để hết Warning ---
        mediaTypes: ['images'], 
        // -----------------------------------------------------------------
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.5, 
        base64: false,
      });

      console.log("Kết quả trả về:", result.canceled ? "Đã hủy" : "Đã chọn");

      if (!result.canceled) {
        const newAssets = result.assets || [];
        setImageFiles(prevImages => {
          const combined = [...prevImages, ...newAssets];
          if (combined.length > 5) {
            Alert.alert("Giới hạn", "Chỉ được tải lên tối đa 5 ảnh.");
            return combined.slice(0, 5); 
          }
          return combined;
        });
      }
    } catch (error) {
      console.error("LỖI MỞ THƯ VIỆN:", error);
      Alert.alert("Lỗi Kỹ Thuật", "Không thể mở thư viện ảnh: " + error.message);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenModal = () => {
    setImageFiles([]); 
    setError(null);
    setShowConfirmModal(true); 
  };

  const handleConfirmComplete = async () => {
    setError(null);
    
    if (imageFiles.length === 0) {
      setError("Vui lòng tải lên ít nhất 1 ảnh làm bằng chứng.");
      Alert.alert("Lỗi", "Vui lòng tải lên ít nhất 1 ảnh làm bằng chứng.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = [];
      for (const file of imageFiles) {
        const fileToUpload = {
          uri: file.uri,
          type: file.mimeType || 'image/jpeg',
          fileName: file.fileName || file.uri.split('/').pop(),
        };
        const url = await imageUploadService.uploadImage(fileToUpload);
        imageUrls.push(url);
      }
      
      await caseLineService.markRepairComplete(caseLineId, imageUrls); 

      if (showNextSteps && pendingRepairsCount > 0) {
        Alert.alert(
          "Hoàn tất!",
          `Bạn còn ${pendingRepairsCount} mục sửa chữa khác đang chờ.`
        );
        onSuccess?.();
      } else {
        onSuccess?.();
      }
      
      setShowConfirmModal(false); 

    } catch (err) {
      console.error("Failed to mark repair as complete:", err);
      const message =
        err.response?.data?.message || "Không thể đánh dấu hoàn tất sửa chữa";
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
            
            <ScrollView style={styles.modalBodyScroll}>
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

              <Text style={styles.label}>Ảnh bằng chứng lắp đặt *</Text>
              <Text style={styles.labelSubText}>(Tối đa 5 ảnh)</Text>
              <View style={styles.imageGrid}>
                {imageFiles.map((img, idx) => (
                  <View key={idx} style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: img.uri }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(idx)}>
                      <Ionicons name="close-circle" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleImageSelect}
                disabled={imageFiles.length >= 5} 
              >
                <Ionicons name="camera-outline" size={20} color="#374151" />
                <Text style={styles.uploadButtonText}>Chọn ảnh ({imageFiles.length}/5)</Text>
              </TouchableOpacity>
              
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {pendingRepairsCount > 0 && (
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingText}>
                    Bạn còn {pendingRepairsCount} mục sửa chữa khác đang chờ.
                  </Text>
                </View>
              )}
            </ScrollView>
            
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
  modalBodyScroll: {
    padding: 16,
    maxHeight: 400, 
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
    backgroundColor: "#FFFBEB", 
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 16,
    marginBottom: 8,
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
  
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 8,
  },
  labelSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    margin: 4,
  },
  removeImageButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    marginTop: 4,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 13,
  },
});