import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
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
  componentSerial = "", 
}) {
  const [vehicleVin, setVehicleVin] = useState(initialVin);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setVehicleVin(initialVin);
      setError(null);
    }
  }, [isOpen, initialVin]);

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
          <View style={styles.header}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="cube-outline" size={20} color="#16A34A" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Lắp đặt linh kiện</Text>
              <Text style={styles.subtitle}>{componentName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.infoBox}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#0284C7"
              />
              <Text style={styles.infoText}>
                Hành động này sẽ đánh dấu linh kiện là ĐÃ LẮP ĐẶT. Serial number
                được theo dõi tự động.
              </Text>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Vehicle VIN * (Tự động điền)
              </Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={vehicleVin}
                placeholder="Vehicle VIN"
                editable={false} 
              />
            </View>

            {componentSerial && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Component Serial Number</Text>
                <View style={styles.serialBox}>
                  <Text style={styles.serialText}>{componentSerial}</Text>
                </View>
              </View>
            )}
          </View>

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
    borderRadius: 12, //
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16, //
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerIconWrapper: {
    padding: 8,
    backgroundColor: "#F0FDF4", //
    borderRadius: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18, //
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
    padding: 16, //
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF", //
    padding: 12,
    borderRadius: 8,
    alignItems: "flex-start", //
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13, //
    color: "#0284C7", //
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    alignItems: "flex-start",
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
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6", //
    color: "#6B7280",
    borderColor: "#E5E7EB", //
  },
  serialBox: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB", //
  },
  serialText: {
    fontSize: 16,
    color: "#374151",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16, //
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
    backgroundColor: "#16A34A", //
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