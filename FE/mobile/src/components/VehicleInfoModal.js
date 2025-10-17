import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  accentSoft: "#2563EB",
  danger: "#EF4444",
};

export default function VehicleInfoModal({ visible, vehicle, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <LinearGradient
            colors={["#0B3D91", "#1E90FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Ionicons name="car-sport-outline" size={24} color="#fff" />
            <Text style={styles.title}>Vehicle Information</Text>
          </LinearGradient>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {vehicle ? (
              <>
                {/* Vehicle info */}
                <SectionTitle
                  icon="information-circle-outline"
                  title="Basic Information"
                />

                <Item icon="barcode-outline" label="VIN" value={vehicle.vin} />
                <Item
                  icon="car-outline"
                  label="Model"
                  value={vehicle.model || "Unknown"}
                />
                <Item
                  icon="business-outline"
                  label="Company"
                  value={vehicle.company || "Unknown"}
                />
                <Item
                  icon="location-outline"
                  label="Place of Manufacture"
                  value={vehicle.placeOfManufacture || "N/A"}
                />
                <Item
                  icon="calendar-outline"
                  label="Manufacture Date"
                  value={
                    vehicle.dateOfManufacture
                      ? new Date(vehicle.dateOfManufacture).toLocaleDateString()
                      : "N/A"
                  }
                />
                <Item
                  icon="pricetag-outline"
                  label="License Plate"
                  value={vehicle.licensePlate || "Not assigned"}
                />
                <Item
                  icon="calendar-number-outline"
                  label="Purchase Date"
                  value={
                    vehicle.purchaseDate
                      ? new Date(vehicle.purchaseDate).toLocaleDateString()
                      : "Not registered"
                  }
                />

                {/* Owner info */}
                <SectionTitle
                  icon="person-circle-outline"
                  title="Owner Information"
                />

                <Item
                  icon="person-outline"
                  label="Full Name"
                  value={vehicle.owner?.fullName || "No owner registered"}
                />
                <Item
                  icon="mail-outline"
                  label="Email"
                  value={vehicle.owner?.email || "N/A"}
                />
                <Item
                  icon="call-outline"
                  label="Phone"
                  value={vehicle.owner?.phone || "N/A"}
                />
                <Item
                  icon="home-outline"
                  label="Address"
                  value={vehicle.owner?.address || "N/A"}
                />
              </>
            ) : (
              <Text
                style={[
                  styles.info,
                  { textAlign: "center", color: COLORS.textMuted },
                ]}
              >
                No vehicle data found.
              </Text>
            )}
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ----------------- Helper Components ----------------- */

function SectionTitle({ icon, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={COLORS.accent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Item({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={18}
        color={COLORS.accent}
        style={{ marginRight: 6 }}
      />
      <Text style={styles.info}>
        <Text style={{ color: COLORS.textMuted }}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

/* ----------------- Styles ----------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
  scrollArea: {
    maxHeight: 420,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  info: {
    color: COLORS.text,
    fontSize: 15,
    flexShrink: 1,
  },
  closeButton: {
    backgroundColor: COLORS.accent,
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
