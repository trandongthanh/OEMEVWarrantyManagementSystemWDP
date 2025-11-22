import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import CreateProcessingRecordForm from "./CreateProcessingRecordForm";

// 🎨 LIGHT THEME
const COLORS = {
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  success: "#10B981",
  danger: "#EF4444",
  warningBg: "#FEF2F2", // Đỏ rất nhạt
  overlay: "rgba(0,0,0,0.6)"
};

export default function WarrantyInfoModal({
  visible,
  warranty,
  vehicle,
  odometer,
  owner,
  onClose,
  onRefreshAfterCreate,
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const checkOverallStatus = (duration, mileage) => {
    if (duration?.status === "INACTIVE" || mileage?.status === "INACTIVE") return "INACTIVE";
    return "ACTIVE";
  };

  const getExpireReason = (duration, mileage) => {
    if (duration?.status === "INACTIVE" && mileage?.status === "INACTIVE") return "Expired by both time and mileage";
    if (duration?.status === "INACTIVE") return "Expired by duration";
    if (mileage?.status === "INACTIVE") return "Expired by mileage limit";
    return "Still under warranty";
  };

  const isGeneralActive = warranty && checkOverallStatus(warranty.generalWarranty?.duration, warranty.generalWarranty?.mileage) === "ACTIVE";

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPressOut={onClose}>
          <Pressable style={styles.modalBox}>
            <View style={styles.header}>
                <Text style={styles.title}>🔧 Warranty Information</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}><Text style={styles.label}>VIN: </Text>{vehicle?.vin || "N/A"}</Text>
              <Text style={styles.infoText}><Text style={styles.label}>Current Odometer: </Text>{odometer ? `${odometer} km` : "N/A"}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {warranty ? (
                <>
                  {checkOverallStatus(warranty.generalWarranty.duration, warranty.generalWarranty.mileage) === "INACTIVE" && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>⚠️ Warranty Expired</Text>
                      <Text style={styles.warningReason}>
                        {getExpireReason(warranty.generalWarranty.duration, warranty.generalWarranty.mileage)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.card}>
                    <Text style={styles.cardHeader}>General Warranty</Text>
                    <View style={styles.divider} />
                    <Text style={styles.cardText}>Duration: <Text style={styles.value}>{warranty.generalWarranty.policy.durationMonths} months</Text></Text>
                    <Text style={styles.cardText}>Mileage Limit: <Text style={styles.value}>{warranty.generalWarranty.policy.mileageLimit} km</Text></Text>
                    <Text style={styles.cardText}>Time Status: <Text style={[styles.statusValue, { color: warranty.generalWarranty.duration.status === "ACTIVE" ? COLORS.success : COLORS.danger }]}>{warranty.generalWarranty.duration.status}</Text></Text>
                    <Text style={styles.cardText}>Mileage Status: <Text style={[styles.statusValue, { color: warranty.generalWarranty.mileage.status === "ACTIVE" ? COLORS.success : COLORS.danger }]}>{warranty.generalWarranty.mileage.status}</Text></Text>
                    <Text style={styles.cardText}>Overall: <Text style={[styles.statusValue, { color: isGeneralActive ? COLORS.success : COLORS.danger }]}>{isGeneralActive ? "ACTIVE" : "INACTIVE"}</Text></Text>
                  </View>

                  <Text style={styles.sectionLabel}>Component Warranties</Text>
                  {warranty.componentWarranties?.map((comp, idx) => {
                    const overallStatus = checkOverallStatus(comp.duration, comp.mileage);
                    return (
                      <View key={idx} style={styles.card}>
                        <Text style={styles.cardHeader}>{comp.componentName}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.cardText}>Duration: <Text style={styles.value}>{comp.policy.durationMonths} months</Text></Text>
                        <Text style={styles.cardText}>Limit: <Text style={styles.value}>{comp.policy.mileageLimit} km</Text></Text>
                        <Text style={styles.cardText}>Overall: <Text style={[styles.statusValue, { color: overallStatus === "ACTIVE" ? COLORS.success : COLORS.danger }]}>{overallStatus}</Text></Text>
                        {overallStatus === "INACTIVE" && (
                          <Text style={styles.reasonText}>Reason: {getExpireReason(comp.duration, comp.mileage)}</Text>
                        )}
                      </View>
                    );
                  })}
                </>
              ) : (
                <Text style={styles.emptyText}>No warranty data available.</Text>
              )}
            </ScrollView>

            {isGeneralActive && (
              <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateForm(true)} activeOpacity={0.8}>
                <Text style={styles.createBtnText}>Create Processing Record</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <CreateProcessingRecordForm
        visible={showCreateForm}
        vin={vehicle?.vin}
        odometer={odometer}
        ownerFullName={owner?.fullName}
        ownerEmail={owner?.email}
        ownerPhone={owner?.phone}
        ownerAddress={owner?.address}
        onClose={(refresh) => {
          setShowCreateForm(false);
          if (refresh && onRefreshAfterCreate) onRefreshAfterCreate();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    width: "95%",
    maxHeight: "85%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  infoBox: {
    backgroundColor: "#EFF6FF", // Xanh rất nhạt
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { color: "#1E3A8A", fontSize: 14, marginBottom: 4 },
  label: { fontWeight: "700" },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { fontSize: 16, color: COLORS.accent, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },
  cardText: { color: COLORS.textMuted, fontSize: 14, marginBottom: 4 },
  value: { color: COLORS.text, fontWeight: '500' },
  statusValue: { fontWeight: "700" },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  warningText: { color: "#DC2626", fontSize: 16, fontWeight: "700" },
  warningReason: { color: "#991B1B", marginTop: 4, fontSize: 14 },
  reasonText: { color: COLORS.danger, marginTop: 6, fontSize: 13, fontStyle: 'italic' },
  emptyText: { color: COLORS.textMuted, textAlign: "center", marginTop: 30, fontSize: 14 },
  createBtn: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});