import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { componentReservationService } from "../../services/technician";

export default function ComponentInstallModal({
  isOpen,
  onClose,
  onSuccess,
  reservationId,
  componentName,
  vehicleVin = "",
  componentSerial = "", 
  quantity = 1,
  caseId = "",
  status = "IN_REPAIR",
  diagnosis = "",
  correction = "",
  warehouseName = "",
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError(null);
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

  if (!isOpen) return null;

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
              <Ionicons name="cube-outline" size={24} color="#9333EA" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Component Installation Details</Text>
              <Text style={styles.subtitle}>{componentName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Basic Info */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Component Type</Text>
                <Text style={styles.infoValue}>{componentName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Quantity</Text>
                <Text style={styles.infoValue}>{quantity}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Case ID</Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                  {caseId}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{status}</Text>
              </View>
            </View>

            {/* Diagnosis & Correction */}
            {(diagnosis || correction) && (
              <>
                <Text style={styles.sectionTitle}>Diagnosis & Correction</Text>
                {diagnosis ? (
                  <View style={styles.diagBox}>
                    <Text style={styles.diagLabel}>Diagnosis</Text>
                    <Text style={styles.diagText}>{diagnosis}</Text>
                  </View>
                ) : null}
                {correction ? (
                  <View style={styles.correctBox}>
                    <Text style={styles.correctLabel}>Correction</Text>
                    <Text style={styles.correctText}>{correction}</Text>
                  </View>
                ) : null}
              </>
            )}

            {/* Reservation Details */}
            <Text style={styles.sectionTitle}>Reservation Details</Text>
            <View style={styles.serialBox}>
              <Text style={styles.infoLabel}>Serial Number</Text>
              <Text style={styles.serialValue}>{componentSerial || "N/A"}</Text>
              {warehouseName && (
                 <Text style={[styles.infoLabel, {marginTop: 8}]}>Picked Up From: {warehouseName}</Text>
              )}
            </View>

            {/* Vehicle Info */}
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.vehicleBox}>
               <Text style={styles.infoLabel}>VIN</Text>
               <Text style={styles.infoValue}>{vehicleVin}</Text>
            </View>

            {/* Instruction Warning */}
            <View style={styles.instructionBox}>
              <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
              <View style={{flex: 1, marginLeft: 8}}>
                 <Text style={styles.instructionTitle}>Installation Instructions</Text>
                 <Text style={styles.instructionText}>
                   Verify component serial number before installation. Once installed, the old component will be marked as removed.
                 </Text>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
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
                <>
                  <Ionicons name="cube" size={16} color="#FFFFFF" style={{marginRight: 6}} />
                  <Text style={styles.submitButtonText}>Install Component</Text>
                </>
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
    borderRadius: 16,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: "#F3E8FF", 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    width: '45%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  diagBox: {
    backgroundColor: '#EFF6FF', 
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  diagLabel: {
    fontSize: 12,
    color: '#1E40AF',
    marginBottom: 4,
    fontWeight: '600',
  },
  diagText: {
    fontSize: 14,
    color: '#1E3A8A',
  },
  correctBox: {
    backgroundColor: '#F0FDF4', 
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  correctLabel: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 4,
    fontWeight: '600',
  },
  correctText: {
    fontSize: 14,
    color: '#14532D',
  },
  serialBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 20,
  },
  serialValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
  },
  vehicleBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 10,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 16,
  },
  errorBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    backgroundColor: "#9333EA", 
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#A855F7",
  },
});