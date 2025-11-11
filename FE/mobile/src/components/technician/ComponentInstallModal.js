import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable, // Sử dụng Pressable để đóng modal khi nhấn bên ngoài
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { componentReservationService } from "../../services/technician";

export default function ComponentInstallModal({
  isOpen,
  onClose,
  onSuccess,
  reservationId,
  componentName,
  vehicleVin: initialVin = "",
  componentSerial: initialSerial = "",
}) {
  const [vehicleVin, setVehicleVin] = useState(initialVin);
  const [serialNumber, setSerialNumber] = useState(initialSerial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setVehicleVin(initialVin);
      setSerialNumber(initialSerial);
      setError(null);
    }
  }, [isOpen, initialVin, initialSerial]);

  const handleSubmit = async () => {
    setError(null);

    if (!vehicleVin.trim()) {
      setError("Vehicle VIN is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await componentReservationService.installComponent(reservationId);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to install component:", err);
      const message =
        err.response?.data?.message || "Failed to install component";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="cube" size={20} color="#16A34A" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Lắp đặt linh kiện</Text>
              <Text style={styles.subtitle}>{componentName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.infoBox}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#0284C7"
              />
              <Text style={styles.infoText}>
                Việc này sẽ đánh dấu linh kiện là ĐÃ LẮP ĐẶT và liên kết nó với
                xe.
              </Text>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Vehicle VIN *
                {vehicleVin && (
                  <Text style={styles.autoFillLabel}> (Tự động điền)</Text>
                )}
              </Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={vehicleVin}
                onChangeText={setVehicleVin}
                placeholder="Enter vehicle VIN"
                editable={false} // Không cho sửa VIN
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Component Serial Number
                {serialNumber && (
                  <Text style={styles.autoFillLabel}> (Tự động điền)</Text>
                )}
              </Text>
              <TextInput
                style={[styles.input, serialNumber && styles.inputDisabled]}
                value={serialNumber}
                onChangeText={setSerialNumber}
                placeholder="Serial number (optional)"
                editable={!serialNumber} // Cho sửa nếu chưa có
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Lắp đặt</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
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
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0284C7",
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
    marginLeft: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  autoFillLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#16A34A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
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
  submitButton: {
    backgroundColor: "#16A34A",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#166534",
  },
});