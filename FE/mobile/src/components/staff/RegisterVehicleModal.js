import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { registerVehicleOwner } from "../../services/vehicleService";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
  success: "#22C55E",
};

export default function RegisterVehicleModal({
  visible,
  vin,
  vehicle,
  customer,
  prefillInfo,
  onClose,
}) {
  const [licensePlate, setLicensePlate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [showPicker, setShowPicker] = useState({ field: null, visible: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Customer input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Prefill manufacture date
  useEffect(() => {
    if (vehicle?.dateOfManufacture) {
      const formatted = new Date(vehicle.dateOfManufacture)
        .toISOString()
        .split("T")[0];
      setManufactureDate(formatted);
    }
  }, [vehicle]);

  // Prefill email/phone
  useEffect(() => {
    if (visible && !customer) {
      if (prefillInfo?.email) setEmail(prefillInfo.email);
      if (prefillInfo?.phone) setPhone(prefillInfo.phone);
    }
  }, [visible, prefillInfo, customer]);

  const handleRegister = async () => {
    if (!licensePlate || !purchaseDate) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await registerVehicleOwner(
        vin,
        customer?.id || null,
        purchaseDate,
        licensePlate,
        manufactureDate
      );
      console.log("✅ Vehicle registered:", data);
      alert("✅ Vehicle registered successfully!");
      onClose();
    } catch (err) {
      console.error("❌ Register error:", err);
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const openPicker = (field) => setShowPicker({ field, visible: true });
  const onDateChange = (event, selectedDate) => {
    setShowPicker({ field: null, visible: false });
    if (event.type === "dismissed" || !selectedDate) return;
    const formatted = selectedDate.toISOString().split("T")[0];
    if (showPicker.field === "manufacture") setManufactureDate(formatted);
    if (showPicker.field === "purchase") setPurchaseDate(formatted);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="car-outline" size={22} color="#fff" />
            <Text style={styles.title}>Register Vehicle</Text>
          </View>

          <Text style={styles.vinText}>
            VIN: <Text style={{ color: COLORS.accent }}>{vin}</Text>
          </Text>

          {/* Manufacture Date */}
          <Text style={styles.label}>Date of Manufacture *</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => openPicker("manufacture")}
          >
            <Text style={styles.inputText}>
              {manufactureDate || "Select date of manufacture"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          {/* License Plate */}
          <Text style={styles.label}>License Plate *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 51F-987.65"
            placeholderTextColor={COLORS.textMuted}
            value={licensePlate}
            onChangeText={setLicensePlate}
          />

          {/* Purchase Date */}
          <Text style={styles.label}>Purchase Date *</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => openPicker("purchase")}
          >
            <Text style={styles.inputText}>
              {purchaseDate || "Select purchase date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          {/* Customer Info */}
          <Text style={styles.sectionTitle}>Customer Information</Text>
          {customer ? (
            <View style={styles.customerBox}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.success}
              />
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={[
                    styles.custText,
                    { fontWeight: "700", color: COLORS.success },
                  ]}
                >
                  Existing Customer
                </Text>
                <Text style={styles.custText}>Name: {customer.fullName}</Text>
                <Text style={styles.custText}>Email: {customer.email}</Text>
                <Text style={styles.custText}>Phone: {customer.phone}</Text>
                <Text style={styles.custText}>Address: {customer.address}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.newCustomerForm}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.formLabel}>Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor={COLORS.textMuted}
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.formLabel}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor={COLORS.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.9}
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={["#2563EB", "#3B82F6", "#60A5FA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <Text style={styles.btnText}>Register Vehicle</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker.visible && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={new Date()}
          onChange={onDateChange}
        />
      )}
    </Modal>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    width: "95%",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  vinText: { color: COLORS.textMuted, marginBottom: 10 },
  label: { color: COLORS.textMuted, fontSize: 14, marginTop: 10 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  inputText: { color: COLORS.text, fontSize: 14 },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    color: COLORS.text,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 5,
  },
  formLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
  },
  newCustomerForm: {
    marginTop: 6,
    marginBottom: 10,
  },
  customerBox: {
    backgroundColor: "rgba(34,197,94,0.1)",
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  custText: { color: COLORS.text, fontSize: 14, marginBottom: 2 },
  registerBtn: { borderRadius: 10, marginTop: 16 },
  gradientBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  error: { color: COLORS.danger, marginTop: 8, textAlign: "center" },
  closeBtn: { marginTop: 12, alignItems: "center" },
  closeText: { color: COLORS.textMuted },
});
