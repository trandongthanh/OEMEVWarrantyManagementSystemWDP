import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { X, CheckCircle, AlertCircle } from "lucide-react-native";

export default function PartsDetailsModal({ visible, onClose, component }) {
  // Đã xóa dòng `if (!component) return null;` vì component cha đã kiểm tra
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Component Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Component Name</Text>
                <Text style={styles.modalValue}>{component.name ?? "N/A"}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Component ID</Text>
                <Text style={styles.modalValue}>
                  {component.typeComponentId ?? "N/A"}
                </Text>
              </View>

              {component.isUnderWarranty !== undefined && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Warranty Status</Text>
                  <View
                    style={[
                      styles.modalStatusContainer,
                      component.isUnderWarranty
                        ? styles.modalStatusEligibleBg
                        : styles.modalStatusIneligibleBg,
                    ]}
                  >
                    {component.isUnderWarranty ? (
                      <CheckCircle size={16} color="#15803D" />
                    ) : (
                      <AlertCircle size={16} color="#B91C1C" />
                    )}
                    <Text
                      style={[
                        styles.modalStatusText,
                        component.isUnderWarranty
                          ? styles.modalStatusEligibleText
                          : styles.modalStatusIneligibleText,
                      ]}
                    >
                      {component.isUnderWarranty
                        ? "Under Warranty"
                        : "Not Covered"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    height: "70%",
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
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
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  modalStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    alignSelf: "flex-start",
  },
  modalStatusEligibleBg: {
    backgroundColor: "#D1FAE5",
  },
  modalStatusIneligibleBg: {
    backgroundColor: "#FEE2E2",
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalStatusEligibleText: {
    color: "#065F46",
  },
  modalStatusIneligibleText: {
    color: "#991B1B",
  },
  modalCloseButton: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});