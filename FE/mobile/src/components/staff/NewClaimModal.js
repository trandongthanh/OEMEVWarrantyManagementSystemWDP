import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getVehicleByVin } from "../../services/vehicleService";
import VehicleInfoModal from "./VehicleInfoModal";

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
  overlay: "rgba(0,0,0,0.5)"
};

export default function NewClaimModal({ visible, onClose }) {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [vehicleModal, setVehicleModal] = useState(false);

  const showToast = (type, text) => {
    Toast.show({ type, text1: text, visibilityTime: 2000, position: "bottom", bottomOffset: 80 });
  };

  const handleSearch = async () => {
    if (!vin.trim()) { showToast("error", "Please enter a VIN number."); return; }
    setLoading(true);
    try {
      const res = await getVehicleByVin(vin);
      if (res?.status === "success" && res.data?.vehicle) {
        setVehicle(res.data.vehicle);
        setVehicleModal(true);
        showToast("success", "Vehicle found successfully!");
      } else {
        showToast("error", "Vehicle not found.");
      }
    } catch (err) {
      showToast("error", "Unable to find vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                  <Ionicons name="document-text-outline" size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.title}>New Warranty Claim</Text>
            </View>

            <Text style={styles.label}>Vehicle Identification Number (VIN)</Text>

            <View style={styles.inputRow}>
              <Ionicons name="car-outline" size={20} color={COLORS.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter VIN..."
                placeholderTextColor={COLORS.textMuted}
                value={vin}
                onChangeText={setVin}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchText}>Search Vehicle</Text>}
              </TouchableOpacity>
            </View>

            <VehicleInfoModal
              visible={vehicleModal}
              vehicle={vehicle}
              onClose={() => setVehicleModal(false)}
            />
          </View>
        </View>
      </Modal>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: { justifyContent: "center", alignItems: "center", marginBottom: 20 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#EFF6FF", justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  label: { color: COLORS.text, fontWeight: "600", marginBottom: 8, fontSize: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 16 },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  cancelText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 15 },
  searchBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  searchText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});