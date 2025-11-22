import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getVehicleWarrantyInfo } from "../../services/vehicleService";
import WarrantyInfoModal from "../../components/staff/WarrantyInfoModal";
import OwnerWarningModal from "../../components/staff/OwnerWarningModal";
import FindCustomerModal from "../../components/staff/FindCustomerModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  bg: "#F9FAFB",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  danger: "#EF4444",
  inputBg: "#F3F4F6",
  overlay: "rgba(0,0,0,0.6)"
};

export default function VehicleInfoModal({ visible, vehicle, onClose }) {
  const [odometer, setOdometer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warranty, setWarranty] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showOwnerWarning, setShowOwnerWarning] = useState(false);
  const [showFindCustomer, setShowFindCustomer] = useState(false);

  const handleWarrantyCheck = async () => {
    if (!vehicle.owner) {
      setShowOwnerWarning(true);
      return;
    }
    if (!odometer.trim()) {
      setError("Please enter odometer (km).");
      return;
    }
    setError("");
    setLoading(true);
    setWarranty(null);

    try {
      const data = await getVehicleWarrantyInfo(vehicle.vin, odometer);
      if (data.status === "success" && data.data?.vehicle) {
        setWarranty(data.data.vehicle);
        setShowWarrantyModal(true);
      } else {
        setError("No warranty information found.");
      }
    } catch (err) {
      setError("Failed to fetch warranty info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBox}>
                <LinearGradient
                  colors={["#2563EB", "#3B82F6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.header}
                >
                  <Ionicons name="car-sport-outline" size={24} color="#fff" />
                  <Text style={styles.title}>Vehicle Information</Text>
                </LinearGradient>

                <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  {vehicle ? (
                    <>
                      <View style={styles.infoGroup}>
                          <Text style={styles.info}><Text style={styles.label}>VIN: </Text>{vehicle.vin}</Text>
                          <Text style={styles.info}><Text style={styles.label}>Model: </Text>{vehicle.model || "Unknown"}</Text>
                          <Text style={styles.info}><Text style={styles.label}>Company: </Text>{vehicle.company || "Unknown"}</Text>
                          <Text style={styles.info}><Text style={styles.label}>Manufacture Date: </Text>{vehicle.dateOfManufacture ? new Date(vehicle.dateOfManufacture).toLocaleDateString() : "N/A"}</Text>
                          <Text style={styles.info}><Text style={styles.label}>License Plate: </Text>{vehicle.licensePlate || "Not assigned"}</Text>
                      </View>

                      {vehicle.owner && (
                        <>
                          <Text style={styles.sectionLabel}>Owner Information</Text>
                          <View style={styles.ownerBox}>
                            <Text style={styles.info}>Name: <Text style={styles.value}>{vehicle.owner.fullName || "N/A"}</Text></Text>
                            <Text style={styles.info}>Email: <Text style={styles.value}>{vehicle.owner.email || "N/A"}</Text></Text>
                            <Text style={styles.info}>Phone: <Text style={styles.value}>{vehicle.owner.phone || "N/A"}</Text></Text>
                          </View>
                        </>
                      )}

                      <Text style={styles.sectionLabel}>Enter Current Odometer (km)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 12000"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="number-pad"
                        value={odometer}
                        onChangeText={(text) => setOdometer(text.replace(/[^0-9]/g, ""))}
                      />

                      <TouchableOpacity
                        style={[styles.checkBtn, loading && { opacity: 0.7 }]}
                        onPress={handleWarrantyCheck}
                        disabled={loading}
                        activeOpacity={0.9}
                      >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Check Warranty Info</Text>}
                      </TouchableOpacity>

                      {error ? <Text style={styles.error}>{error}</Text> : null}
                    </>
                  ) : (
                    <Text style={[styles.info, { textAlign: "center" }]}>No vehicle data available.</Text>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <OwnerWarningModal
        visible={showOwnerWarning}
        onClose={() => setShowOwnerWarning(false)}
        onRegister={() => { setShowOwnerWarning(false); setShowFindCustomer(true); }}
      />

      <FindCustomerModal
        visible={showFindCustomer}
        vin={vehicle?.vin}
        vehicle={vehicle}
        onClose={() => setShowFindCustomer(false)}
      />

      <WarrantyInfoModal
        visible={showWarrantyModal}
        warranty={warranty}
        vehicle={vehicle}
        odometer={odometer}
        owner={vehicle?.owner}
        onClose={() => setShowWarrantyModal(false)}
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
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#fff", marginLeft: 10 },
  scrollArea: { padding: 20 },
  infoGroup: { marginBottom: 10 },
  info: { color: COLORS.text, fontSize: 15, marginBottom: 8 },
  label: { color: COLORS.textMuted },
  value: { fontWeight: '600', color: COLORS.text },
  sectionLabel: { color: COLORS.accent, fontSize: 15, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  ownerBox: {
    backgroundColor: "#F0F9FF", // Xanh dương rất nhạt
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
    fontSize: 16
  },
  checkBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: COLORS.danger, marginTop: 12, textAlign: "center", fontWeight: '500' },
});