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

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
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
      if (
        (data.status === "success" || data.status === "sucess") &&
        data.data?.customer
      ) {
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
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.header}>
              <Text style={styles.title}>Find Customer</Text>
            </View>

            <Text style={styles.vinText}>
              VIN Found: <Text style={{ color: COLORS.accent }}>{vin}</Text>
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
              <TouchableOpacity
                onPress={handleSearch}
                disabled={loading}
                activeOpacity={0.9}
                style={styles.searchBtn}
              >
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
                <Text style={styles.resultInfo}>
                  Full Name: {customer.fullName}
                </Text>
                <Text style={styles.resultInfo}>Phone: {customer.phone}</Text>
                <Text style={styles.resultInfo}>Email: {customer.email}</Text>
                <Text style={styles.resultInfo}>
                  Address: {customer.address}
                </Text>

                <TouchableOpacity
                  onPress={() => setShowRegisterModal(true)}
                  style={styles.primaryBtn}
                  activeOpacity={0.9}
                >
                  <Text style={styles.primaryText}>Register This Customer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              !loading && (
                <View style={{ marginTop: 16 }}>
                  <Text
                    style={{ color: COLORS.textMuted, textAlign: "center" }}
                  >
                    Please enter email or phone to search.
                  </Text>
                </View>
              )
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#2563EB", "#3B82F6", "#60A5FA"]} // 💙 gradient xanh lam
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.closeGradient}
              >
                <Text style={styles.closeText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmRegisterModal
        visible={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={() => {
          setShowConfirmPopup(false);
          setShowRegisterModal(true);
        }}
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    width: "95%",
    borderRadius: 16,
    padding: 16,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  vinText: {
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    color: COLORS.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  searchBtn: {
    borderRadius: 8,
    overflow: "hidden",
  },
  searchGradient: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  searchText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  resultBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 10,
  },
  resultTitle: {
    color: COLORS.accent,
    fontWeight: "700",
    marginBottom: 6,
  },
  resultInfo: {
    color: COLORS.text,
    marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeGradient: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
});
