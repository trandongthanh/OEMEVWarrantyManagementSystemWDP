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

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  accentGlow: "#60A5FA",
  danger: "#EF4444",
};

export default function NewClaimModal({ visible, onClose }) {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [vehicleModal, setVehicleModal] = useState(false);

  // 🧭 Toast helper
  const showToast = (type, text) => {
    Toast.show({
      type,
      text1: text,
      visibilityTime: 2000,
      position: "bottom",
      bottomOffset: 80,
    });
  };

  const handleSearch = async () => {
    if (!vin.trim()) {
      showToast("error", "Please enter a VIN number.");
      return;
    }

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
      console.error("❌ VIN search error:", err);
      showToast("error", "Unable to find vehicle. Check VIN or network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>New Warranty Claim</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              Vehicle Identification Number (VIN)
            </Text>

            {/* VIN input with glowing border */}
            <View style={styles.inputRow}>
              <Ionicons
                name="car-outline"
                size={20}
                color={COLORS.accent}
                style={{ marginRight: 8 }}
              />
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

              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.searchText}>Search Vehicle</Text>
                )}
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accentGlow,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  label: {
    color: COLORS.text,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.3,
    borderColor: COLORS.accent,
    borderRadius: 10,
    backgroundColor: "#141A22",
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: COLORS.accentGlow,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  cancelText: {
    color: COLORS.danger,
    fontWeight: "600",
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: COLORS.accentGlow,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  searchText: {
    color: "#fff",
    fontWeight: "600",
  },
});
