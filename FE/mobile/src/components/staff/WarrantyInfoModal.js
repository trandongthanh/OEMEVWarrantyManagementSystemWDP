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

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  success: "#22C55E",
  danger: "#EF4444",
  warningBg: "rgba(239,68,68,0.1)",
};

export default function WarrantyInfoModal({
  visible,
  warranty,
  vehicle,
  odometer, // ✅ nhận từ VehicleInfoModal
  onClose,
  onRefreshAfterCreate,
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const checkOverallStatus = (duration, mileage) => {
    if (duration?.status === "INACTIVE" || mileage?.status === "INACTIVE") {
      return "INACTIVE";
    }
    return "ACTIVE";
  };

  const getExpireReason = (duration, mileage) => {
    if (duration?.status === "INACTIVE" && mileage?.status === "INACTIVE")
      return "Expired by both time and mileage";
    if (duration?.status === "INACTIVE") return "Expired by duration";
    if (mileage?.status === "INACTIVE") return "Expired by mileage limit";
    return "Still under warranty";
  };

  const isGeneralActive =
    warranty &&
    checkOverallStatus(
      warranty.generalWarranty?.duration,
      warranty.generalWarranty?.mileage
    ) === "ACTIVE";

  return (
    <>
      {/* ===== Modal hiển thị thông tin bảo hành ===== */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPressOut={onClose}>
          <Pressable style={styles.modalBox}>
            <Text style={styles.title}>🔧 Warranty Information</Text>

            {/* ✅ Hiển thị VIN và ODO nhận từ props */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={styles.label}>VIN: </Text>
                {vehicle?.vin || "N/A"}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.label}>Current Odometer: </Text>
                {odometer ? `${odometer} km` : "N/A"}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {warranty ? (
                <>
                  {/* 🧭 Overall Notice */}
                  {checkOverallStatus(
                    warranty.generalWarranty.duration,
                    warranty.generalWarranty.mileage
                  ) === "INACTIVE" && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>
                        ⚠️ Warranty Expired
                      </Text>
                      <Text style={styles.warningReason}>
                        {getExpireReason(
                          warranty.generalWarranty.duration,
                          warranty.generalWarranty.mileage
                        )}
                      </Text>
                    </View>
                  )}

                  {/* General Warranty */}
                  <View style={styles.card}>
                    <Text style={styles.cardHeader}>General Warranty</Text>
                    <Text style={styles.cardText}>
                      Duration:{" "}
                      <Text style={styles.value}>
                        {warranty.generalWarranty.policy.durationMonths} months
                      </Text>
                    </Text>
                    <Text style={styles.cardText}>
                      Mileage Limit:{" "}
                      <Text style={styles.value}>
                        {warranty.generalWarranty.policy.mileageLimit} km
                      </Text>
                    </Text>

                    <Text style={styles.cardText}>
                      Time Status:{" "}
                      <Text
                        style={[
                          styles.value,
                          {
                            color:
                              warranty.generalWarranty.duration.status ===
                              "ACTIVE"
                                ? COLORS.success
                                : COLORS.danger,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {warranty.generalWarranty.duration.status}
                      </Text>
                    </Text>

                    <Text style={styles.cardText}>
                      Mileage Status:{" "}
                      <Text
                        style={[
                          styles.value,
                          {
                            color:
                              warranty.generalWarranty.mileage.status ===
                              "ACTIVE"
                                ? COLORS.success
                                : COLORS.danger,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {warranty.generalWarranty.mileage.status}
                      </Text>
                    </Text>

                    <Text style={styles.cardText}>
                      Overall:{" "}
                      <Text
                        style={[
                          styles.value,
                          {
                            color: isGeneralActive
                              ? COLORS.success
                              : COLORS.danger,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {isGeneralActive ? "ACTIVE" : "INACTIVE"}
                      </Text>
                    </Text>
                  </View>

                  {/* Component Warranties */}
                  <Text style={styles.sectionLabel}>Component Warranties</Text>
                  {warranty.componentWarranties?.map((comp, idx) => {
                    const overallStatus = checkOverallStatus(
                      comp.duration,
                      comp.mileage
                    );
                    return (
                      <View key={idx} style={styles.card}>
                        <Text style={styles.cardHeader}>
                          {comp.componentName}
                        </Text>
                        <Text style={styles.cardText}>
                          Duration:{" "}
                          <Text style={styles.value}>
                            {comp.policy.durationMonths} months
                          </Text>
                        </Text>
                        <Text style={styles.cardText}>
                          Limit:{" "}
                          <Text style={styles.value}>
                            {comp.policy.mileageLimit} km
                          </Text>
                        </Text>
                        <Text style={styles.cardText}>
                          Time Status:{" "}
                          <Text
                            style={[
                              styles.value,
                              {
                                color:
                                  comp.duration.status === "ACTIVE"
                                    ? COLORS.success
                                    : COLORS.danger,
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {comp.duration.status}
                          </Text>
                        </Text>
                        <Text style={styles.cardText}>
                          Mileage Status:{" "}
                          <Text
                            style={[
                              styles.value,
                              {
                                color:
                                  comp.mileage.status === "ACTIVE"
                                    ? COLORS.success
                                    : COLORS.danger,
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {comp.mileage.status}
                          </Text>
                        </Text>
                        <Text style={styles.cardText}>
                          Overall:{" "}
                          <Text
                            style={[
                              styles.value,
                              {
                                color:
                                  overallStatus === "ACTIVE"
                                    ? COLORS.success
                                    : COLORS.danger,
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {overallStatus}
                          </Text>
                        </Text>
                        {overallStatus === "INACTIVE" && (
                          <Text style={styles.reasonText}>
                            Reason:{" "}
                            {getExpireReason(comp.duration, comp.mileage)}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </>
              ) : (
                <Text style={styles.emptyText}>
                  No warranty data available.
                </Text>
              )}
            </ScrollView>

            {/* ✅ Nút tạo process nếu còn bảo hành */}
            {isGeneralActive && (
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => setShowCreateForm(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.createBtnText}>
                  Create Processing Record
                </Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ✅ Form tạo hồ sơ xử lý (truyền VIN + ODO) */}
      <CreateProcessingRecordForm
        visible={showCreateForm}
        vin={vehicle?.vin}
        odometer={odometer} // ✅ truyền ODO sang form
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
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    width: "92%",
    maxHeight: "85%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  infoText: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 14,
  },
  card: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: COLORS.text,
  },
  warningBox: {
    backgroundColor: COLORS.warningBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  warningText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "700",
  },
  warningReason: {
    color: COLORS.textMuted,
    marginTop: 4,
  },
  reasonText: {
    color: COLORS.danger,
    marginTop: 6,
    fontSize: 13,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
  },
  createBtn: {
    marginTop: 12,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
