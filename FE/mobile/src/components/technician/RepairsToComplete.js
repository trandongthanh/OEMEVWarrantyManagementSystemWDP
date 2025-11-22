import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { caseLineService } from "../../services/technician";
import MarkRepairCompleteButton from "./MarkRepairCompleteButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RepairDetailModal = ({ visible, item, onClose, onMarkCompleteSuccess }) => {
  if (!item) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconBox}>
              <Ionicons name="build-outline" size={24} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Repair Completion Details</Text>
              <Text style={styles.modalSubtitle}>{item.typeComponent?.name || "Component"}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Component Type</Text>
                <Text style={styles.infoValue}>{item.typeComponent?.name || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Quantity</Text>
                <Text style={styles.infoValue}>{item.quantity || 1}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Case ID</Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                  {item.guaranteeCaseId}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Diagnosis & Correction</Text>
            <View style={styles.diagBox}>
              <Text style={styles.diagLabel}>Diagnosis</Text>
              <Text style={styles.diagText}>{item.diagnosisText || "N/A"}</Text>
            </View>
            <View style={styles.correctBox}>
              <Text style={styles.correctLabel}>Correction</Text>
              <Text style={styles.correctText}>{item.correctionText || "N/A"}</Text>
            </View>

            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.vehicleBox}>
              <Text style={styles.infoLabel}>VIN</Text>
              <Text style={styles.infoValue}>
                {item.guaranteeCase?.vehicleProcessingRecord?.vin || "N/A"}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.footerCloseButton} onPress={onClose}>
              <Text style={styles.footerCloseText}>Close</Text>
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <MarkRepairCompleteButton
                caseLineId={item.id || item.caseLineId}
                onSuccess={() => {
                  onClose(); 
                  onMarkCompleteSuccess(); 
                }}
                style={{ width: '100%', marginTop: 0 }} 
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function RepairsToComplete() {
  const [caseLines, setCaseLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchInRepairCaseLines = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        repairTechId: userId,
      });
      
      const inRepairLines = response.data?.caseLines || [];

      const readyToComplete = inRepairLines.filter((cl) => {
        if (!cl.reservations || cl.reservations.length === 0) return false;
        const hasPickedUp = cl.reservations.some(
          (res) => res.status === "PICKED_UP"
        );
        const hasInstalled = cl.reservations.some(
          (res) => res.status === "INSTALLED"
        );
        return hasInstalled && !hasPickedUp;
      });

      setCaseLines(readyToComplete);
    } catch (error) {
      console.error("Error fetching in-repair case lines:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInRepairCaseLines();
    }, [])
  );

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centeredView}>
          <ActivityIndicator size="small" color="#16A34A" />
        </View>
      );
    }

    if (caseLines.length === 0) {
      return (
        <View style={styles.centeredView}>
          <Ionicons name="checkmark-done-outline" size={24} color="#9CA3AF" />
          <Text style={styles.emptyText}>No items pending completion</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {caseLines.map((caseLine) => {
          const caseLineId = caseLine.id || caseLine.caseLineId || "";
          
          return (
            <View key={caseLineId} style={styles.itemCard}>
              <View style={styles.itemHeaderRow}>
                <View style={styles.iconCircle}>
                   <Ionicons name="construct-outline" size={18} color="#16A34A" />
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {caseLine.typeComponent?.name || "Component"}
                </Text>
              </View>

              <View style={styles.itemMeta}>
                <View style={styles.metaRow}>
                   <Text style={styles.metaLabel}>Diagnosis:</Text>
                   <Text style={styles.metaValue} numberOfLines={1}>{caseLine.diagnosisText || "N/A"}</Text>
                </View>
                <View style={styles.metaRow}>
                   <Text style={styles.metaLabel}>Correction:</Text>
                   <Text style={styles.metaValue} numberOfLines={1}>{caseLine.correctionText || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                 <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => handleViewDetails(caseLine)}
                 >
                    <Ionicons name="eye-outline" size={16} color="#374151" />
                    <Text style={styles.viewDetailsText}>View Details</Text>
                 </TouchableOpacity>

                 <View style={{ width: 160 }}> 
                    <MarkRepairCompleteButton
                      caseLineId={caseLineId}
                      onSuccess={fetchInRepairCaseLines}
                      style={{ paddingVertical: 8 }}
                    />
                 </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [loading, caseLines]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconWrapper}>
          <Ionicons name="build" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Mark Repair Complete</Text>
        <View style={styles.countBadge}>
           <Text style={styles.countText}>{caseLines.length}</Text>
        </View>
      </View>
      
      {renderContent}

      <RepairDetailModal 
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
        onMarkCompleteSuccess={fetchInRepairCaseLines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    backgroundColor: "#16A34A", // Green
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#16A34A",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  countText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  centeredView: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  listContainer: {
    gap: 16,
  },
  itemCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DCFCE7", 
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  itemMeta: {
    marginBottom: 12,
    paddingLeft: 40, 
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 13,
    color: "#6B7280",
    width: 80,
  },
  metaValue: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    alignItems: 'center',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  // --- MODAL STYLES ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
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
  vehicleBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },
  footerCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
  },
  footerCloseText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});