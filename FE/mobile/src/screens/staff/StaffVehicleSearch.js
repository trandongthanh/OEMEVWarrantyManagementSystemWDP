import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getVehicleByVin } from "../../services/vehicleService";
import VehicleInfoModal from "../../components/VehicleInfoModal";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
};

export default function StaffVehicleSearch() {
  const [vin, setVin] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSearch = async () => {
    if (!vin.trim()) {
      setError("Please enter a VIN number.");
      return;
    }

    setLoading(true);
    setError("");
    setVehicle(null);

    try {
      const data = await getVehicleByVin(vin);
      if (data?.status === "success" && data.data?.vehicle) {
        setVehicle(data.data.vehicle);
        setModalVisible(true);
      } else {
        setError("Vehicle not found or invalid response format.");
      }
    } catch (err) {
      console.error("❌ API error:", err);
      setError("Unable to find vehicle. Please check VIN or network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.container}>
        <Text style={styles.title}>Vehicle Search</Text>

        <View
          style={[
            styles.searchBox,
            focused && { borderColor: COLORS.accent, shadowOpacity: 0.2 },
          ]}
        >
          <Ionicons
            name="car-outline"
            size={22}
            color={COLORS.accent}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter VIN number..."
            placeholderTextColor={COLORS.textMuted}
            value={vin}
            onChangeText={setVin}
            autoCapitalize="characters"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <VehicleInfoModal
          visible={modalVisible}
          vehicle={vehicle}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 28,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  iconButton: {
    marginLeft: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 28,
    padding: 10,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginTop: 14,
    fontSize: 14,
  },
});
