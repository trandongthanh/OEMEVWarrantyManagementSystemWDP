import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateCustomerById } from "../../../services/customerService";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
};

export default function UpdateCustomerModal({
  visible,
  customer,
  onClose,
  onUpdated,
}) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Tự động cập nhật dữ liệu input khi chọn customer mới
  useEffect(() => {
    if (customer) {
      setForm({
        fullName: customer.fullName || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      });
      setError("");
      setLoading(false);
    }
  }, [customer]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!customer) return;
    setLoading(true);
    setError("");

    try {
      const res = await updateCustomerById(customer.id, form);
      if (res.status === "success") {
        onUpdated(); // refresh list
        onClose();
      } else {
        setError("Failed to update customer.");
      }
    } catch (err) {
      setError("Error updating customer info.");
      console.error("❌ Update error:", err);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Update Customer</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={COLORS.textMuted}
            value={form.fullName}
            onChangeText={(t) => handleChange("fullName", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(t) => handleChange("phone", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor={COLORS.textMuted}
            value={form.address}
            onChangeText={(t) => handleChange("address", t)}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={[styles.btnText, { marginLeft: 4 }]}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    color: COLORS.text,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.border,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 6,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginVertical: 6,
  },
});
