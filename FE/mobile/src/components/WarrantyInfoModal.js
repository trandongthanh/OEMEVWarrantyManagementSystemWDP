import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  success: "#22C55E",
  danger: "#EF4444",
};

export default function WarrantyInfoModal({ visible, warranty, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* ✅ Overlay nhận nhấn ngoài */}
      <Pressable style={styles.overlay} onPressOut={onClose}>
        {/* ⛔ View con KHÔNG bị ảnh hưởng bởi onPressOut */}
        <Pressable style={styles.modalBox}>
          <Text style={styles.title}>🔧 Warranty Information</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {warranty ? (
              <>
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
                    Status:{" "}
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
                </View>

                {/* Component Warranties */}
                <Text style={styles.sectionLabel}>Component Warranties</Text>
                {warranty.componentWarranties?.map((comp, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.cardHeader}>{comp.componentName}</Text>
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
                      Status:{" "}
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
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.emptyText}>No warranty data available.</Text>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
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
    marginBottom: 12,
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
  emptyText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
  },
});
