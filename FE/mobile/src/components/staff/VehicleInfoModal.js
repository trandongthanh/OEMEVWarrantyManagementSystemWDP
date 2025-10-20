import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getVehicleWarrantyInfo } from "../../services/vehicleService";
import WarrantyInfoModal from "../../components/staff/WarrantyInfoModal";
import OwnerWarningModal from "../../components/staff/OwnerWarningModal";
import FindCustomerModal from "../../components/staff/FindCustomerModal"; // ✅ import thêm

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
  const [odometer, setOdometer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warranty, setWarranty] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showOwnerWarning, setShowOwnerWarning] = useState(false);
  const [showFindCustomer, setShowFindCustomer] = useState(false); // ✅ thêm modal tìm customer

  const handleWarrantyCheck = async () => {
    if (!vehicle.owner) {
      setShowOwnerWarning(true); // ⚠️ mở cảnh báo nếu chưa có chủ xe
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
      console.error("❌ Warranty API error:", err);
      setError("Failed to fetch warranty info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔹 Vehicle Info Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <LinearGradient
              colors={["#0B3D91", "#1E90FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Ionicons name="car-sport-outline" size={22} color="#fff" />
              <Text style={styles.title}>Vehicle Information</Text>
            </LinearGradient>

            <ScrollView
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false}
            >
              {vehicle ? (
                <>
                  <Text style={styles.info}>VIN: {vehicle.vin}</Text>
                  <Text style={styles.info}>
                    Model: {vehicle.model || "Unknown"}
                  </Text>
                  <Text style={styles.info}>
                    Company: {vehicle.company || "Unknown"}
                  </Text>
                  <Text style={styles.info}>
                    Place of Manufacture: {vehicle.placeOfManufacture || "N/A"}
                  </Text>
                  <Text style={styles.info}>
                    Manufacture Date:{" "}
                    {vehicle.dateOfManufacture
                      ? new Date(vehicle.dateOfManufacture).toLocaleDateString()
                      : "N/A"}
                  </Text>
                  <Text style={styles.info}>
                    License Plate: {vehicle.licensePlate || "Not assigned"}
                  </Text>

                  {vehicle.owner && (
                    <>
                      <Text style={styles.info}>
                        Purchase Date:{" "}
                        {vehicle.purchaseDate
                          ? new Date(vehicle.purchaseDate).toLocaleDateString()
                          : "Not registered"}
                      </Text>
                      <Text style={styles.info}>
                        Owner: {vehicle.owner.fullName}
                      </Text>
                    </>
                  )}

                  {/* Nhập Odometer */}
                  <Text style={styles.sectionLabel}>
                    Enter Current Odometer (km)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 12000"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={odometer}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, "");
                      const limitedText = numericText.slice(0, 7);
                      setOdometer(limitedText);
                    }}
                    maxLength={7}
                  />

                  <TouchableOpacity
                    style={[styles.checkBtn, loading && { opacity: 0.7 }]}
                    onPress={handleWarrantyCheck}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.btnText}>Check Warranty Info</Text>
                    )}
                  </TouchableOpacity>

                  {error ? <Text style={styles.error}>{error}</Text> : null}
                </>
              ) : (
                <Text style={[styles.info, { textAlign: "center" }]}>
                  No vehicle data available.
                </Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 🔸 Cảnh báo khi chưa có chủ xe */}
      <OwnerWarningModal
        visible={showOwnerWarning}
        onClose={() => setShowOwnerWarning(false)}
        onRegister={() => {
          setShowOwnerWarning(false);
          setShowFindCustomer(true); // ✅ chuyển hướng sang popup tìm customer
        }}
      />

      {/* 🔸 Popup tìm khách hàng */}
      <FindCustomerModal
        visible={showFindCustomer}
        vin={vehicle?.vin}
        onClose={() => setShowFindCustomer(false)}
      />

      {/* 🔸 Popup thông tin bảo hành */}
      <WarrantyInfoModal
        visible={showWarrantyModal}
        warranty={warranty}
        onClose={() => setShowWarrantyModal(false)}
      />
    </>
  );
}

// Style giữ nguyên
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    width: "95%",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
  scrollArea: {
    maxHeight: 500,
    padding: 16,
  },
  info: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 6,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 18,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    color: COLORS.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  checkBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  error: {
    color: COLORS.danger,
    marginTop: 8,
    textAlign: "center",
  },
});
