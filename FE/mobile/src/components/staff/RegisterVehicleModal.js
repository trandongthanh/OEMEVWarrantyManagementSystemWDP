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

// 🎨 LIGHT THEME
const COLORS = {
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  danger: "#EF4444",
  success: "#10B981",
  inputBg: "#F3F4F6",
  overlay: "rgba(0,0,0,0.5)"
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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (vehicle?.dateOfManufacture) {
      const formatted = new Date(vehicle.dateOfManufacture).toISOString().split("T")[0];
      setManufactureDate(formatted);
    }
  }, [vehicle]);

  useEffect(() => {
    if (visible && !customer) {
      if (prefillInfo?.email) setEmail(prefillInfo.email);
      if (prefillInfo?.phone) setPhone(prefillInfo.phone);
    }
  }, [visible, prefillInfo, customer]);

  const handleRegister = async () => {
    if (!licensePlate || !purchaseDate || !manufactureDate) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    let customerPayload = {};
    if (customer?.id) {
      customerPayload.customerId = customer.id;
    } else {
      customerPayload.customer = { fullName, email, phone, address };
    }

    try {
      await registerVehicleOwner(vin, purchaseDate, licensePlate, manufactureDate, customerPayload);
      alert("Vehicle registered!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error registering vehicle.");
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
                <Ionicons name="car-outline" size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.title}>Register Vehicle</Text>
          </View>

          <Text style={styles.vinText}>
            VIN: <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{vin}</Text>
          </Text>

          <Text style={styles.label}>Date of Manufacture *</Text>
          <TouchableOpacity style={styles.inputWrapper} onPress={() => openPicker("manufacture")}>
            <Text style={[styles.inputText, !manufactureDate && {color: COLORS.textMuted}]}>
              {manufactureDate || "Select date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <Text style={styles.label}>License Plate *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 51F-987.65"
            placeholderTextColor={COLORS.textMuted}
            value={licensePlate}
            onChangeText={setLicensePlate}
          />

          <Text style={styles.label}>Purchase Date *</Text>
          <TouchableOpacity style={styles.inputWrapper} onPress={() => openPicker("purchase")}>
            <Text style={[styles.inputText, !purchaseDate && {color: COLORS.textMuted}]}>
              {purchaseDate || "Select date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Customer Information</Text>
          {customer ? (
            <View style={styles.customerBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.custText, { fontWeight: "700", color: COLORS.success, marginBottom: 4 }]}>
                  Existing Customer
                </Text>
                <Text style={styles.custText}>Name: <Text style={{fontWeight:'600'}}>{customer.fullName}</Text></Text>
                <Text style={styles.custText}>Email: {customer.email}</Text>
                <Text style={styles.custText}>Phone: {customer.phone}</Text>
                <Text style={styles.custText}>Address: {customer.address}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.newCustomerForm}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={COLORS.textMuted} value={fullName} onChangeText={setFullName} />
              
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} />
              
              <Text style={styles.formLabel}>Phone *</Text>
              <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} />
              
              <Text style={styles.formLabel}>Address *</Text>
              <TextInput style={styles.input} placeholder="Address" placeholderTextColor={COLORS.textMuted} value={address} onChangeText={setAddress} />
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

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
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16, justifyContent: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EFF6FF", justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  vinText: { color: COLORS.textMuted, marginBottom: 16, textAlign: 'center', fontSize: 15 },
  label: { color: COLORS.text, fontSize: 14, marginTop: 12, marginBottom: 6, fontWeight: '500' },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  inputText: { color: COLORS.text, fontSize: 15 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    color: COLORS.text,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15
  },
  sectionTitle: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 8,
  },
  formLabel: { color: COLORS.text, fontSize: 14, marginTop: 10, marginBottom: 4, fontWeight: '500' },
  newCustomerForm: { marginBottom: 10 },
  customerBox: {
    backgroundColor: "#F0FDF4", // Xanh lá rất nhạt
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  custText: { color: "#166534", fontSize: 14, marginBottom: 2, lineHeight: 20 },
  registerBtn: { borderRadius: 12, marginTop: 24, shadowColor: COLORS.accent, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  gradientBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: COLORS.danger, marginTop: 12, textAlign: "center", fontWeight: '500' },
  closeBtn: { marginTop: 16, alignItems: "center", paddingVertical: 8 },
  closeText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
});