import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { findCustomer } from "../../services/customerService";
import RegisterVehicleModal from "./RegisterVehicleModal";
import ConfirmRegisterModal from "./ConfirmRegisterModal";

// 🎨 LIGHT THEME
const COLORS = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#3B82F6",
  danger: "#EF4444",
  inputBg: "#F9FAFB",
};

export default function FindCustomerModal({ visible, vin, vehicle, onClose }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [prefillInfo, setPrefillInfo] = useState({ email: "", phone: "" });

  useEffect(() => {
    if (!visible) {
      setInput("");
      setCustomer(null);
      setLoading(false);
      setShowRegisterModal(false);
      setShowConfirmPopup(false);
      setPrefillInfo({ email: "", phone: "" });
    }
  }, [visible]);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setCustomer(null);
    setLoading(true);

    const isEmail = /\S+@\S+\.\S+/.test(input);
    const phone = isEmail ? "" : input;
    const email = isEmail ? input : "";
    setPrefillInfo({ email, phone });

    try {
      const data = await findCustomer(phone, email);
      if ((data.status === "success" || data.status === "sucess") && data.data?.customer) {
        setCustomer(data.data.customer);
      } else {
        setCustomer(null);
        setShowConfirmPopup(true);
      }
    } catch {
      setShowConfirmPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput("");
    setCustomer(null);
    setLoading(false);
    setShowRegisterModal(false);
    setShowConfirmPopup(false);
    setPrefillInfo({ email: "", phone: "" });
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.header}>
              <Text style={styles.title}>Find Customer</Text>
            </View>

            <Text style={styles.vinText}>
              VIN Found: <Text style={{ color: COLORS.accent, fontWeight: '600' }}>{vin}</Text>
            </Text>

            <Text style={styles.label}>Phone number or Email</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="e.g. phone or email"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="default"
                autoCapitalize="none"
                value={input}
                onChangeText={setInput}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch} disabled={loading} activeOpacity={0.9} style={styles.searchBtn}>
                {loading ? (
                  <ActivityIndicator size={16} color="#fff" />
                ) : (
                  <LinearGradient
                    colors={["#2563EB", "#3B82F6", "#60A5FA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.searchGradient}
                  >
                    <Text style={styles.searchText}>Search</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>

            {customer ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>Customer found</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.resultInfo}>{customer.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.resultInfo}>{customer.phone}</Text>
                </View>
                 <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.resultInfo}>{customer.email}</Text>
                </View>
                
                <TouchableOpacity onPress={() => setShowRegisterModal(true)} style={styles.primaryBtn} activeOpacity={0.9}>
                  <Text style={styles.primaryText}>Register This Customer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              !loading && (
                <View style={{ marginTop: 24, marginBottom: 8 }}>
                  <Text style={{ color: COLORS.textMuted, textAlign: "center", fontSize: 14 }}>
                    Please enter email or phone to search.
                  </Text>
                </View>
              )
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
                <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmRegisterModal
        visible={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={() => { setShowConfirmPopup(false); setShowRegisterModal(true); }}
      />

      <RegisterVehicleModal
        key={customer?.id || "new"}
        visible={showRegisterModal}
        vin={vin}
        vehicle={vehicle}
        customer={customer}
        prefillInfo={prefillInfo}
        onClose={() => setShowRegisterModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    width: "95%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: { marginBottom: 10, alignItems: 'center' },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  vinText: { color: COLORS.textMuted, marginBottom: 20, textAlign: 'center' },
  label: { color: COLORS.text, fontSize: 14, marginBottom: 6, fontWeight: '500' },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15
  },
  searchBtn: { borderRadius: 10, overflow: "hidden" },
  searchGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  searchText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  resultBox: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 16,
  },
  resultTitle: { color: COLORS.accent, fontWeight: "700", marginBottom: 12, fontSize: 16 },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { color: COLORS.textMuted, width: 60 },
  resultInfo: { color: COLORS.text, fontWeight: '500', flex: 1 },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  closeBtn: { marginTop: 16, paddingVertical: 10, alignItems: "center" },
  closeText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 15 },
});