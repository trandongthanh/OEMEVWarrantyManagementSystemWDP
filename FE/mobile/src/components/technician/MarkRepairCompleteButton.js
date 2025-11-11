import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { caseLineService } from "../../services/technician";

export default function MarkRepairCompleteButton({
  caseLineId,
  onSuccess,
  disabled = false,
  style, // Cho phép truyền style từ bên ngoài
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleMarkComplete = () => {
    Alert.alert(
      "Xác nhận hoàn tất",
      "Bạn có chắc chắn muốn đánh dấu sửa chữa này là đã hoàn tất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xác nhận", onPress: () => performComplete() },
      ]
    );
  };

  const performComplete = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await caseLineService.markRepairComplete(caseLineId);
      onSuccess?.();
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
    <TouchableOpacity
      onPress={handleMarkComplete}
      disabled={disabled || isSubmitting}
      style={[
        styles.button,
        (disabled || isSubmitting) && styles.disabledButton,
        style, // Áp dụng style truyền vào
      ]}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
      )}
      <Text style={styles.buttonText}>
        {isSubmitting ? "Đang lưu..." : "Mark Complete"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    backgroundColor: "#16A34A", // Green
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#166534", // Darker Green
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});