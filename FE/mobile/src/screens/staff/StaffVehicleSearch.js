import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import NewClaimModal from "../../components/staff/NewClaimModal";
import CustomerSearchBar from "../../components/customer/CustomerSearchBar";
import CustomerInfoCard from "../../components/customer/CustomerInfoCard";
import { getCustomerByPhoneOrEmail } from "../../services/customerService";

export default function StaffHome() {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearchCustomer = async () => {
    if (!searchValue.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter phone or email to search.",
        visibilityTime: 2000,
        position: "bottom",
        bottomOffset: 80,
      });
      return;
    }

    setLoading(true);
    setCustomer(null);
    setNotFound(false);

    try {
      const res = await getCustomerByPhoneOrEmail(searchValue);

      if (res?.status === "success" && res.data?.customer) {
        setCustomer(res.data.customer);
        setNotFound(false);
      } else {
        setCustomer(null);
        setNotFound(true);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setCustomer(null);
        setNotFound(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Network or server error.",
          visibilityTime: 2000,
          position: "bottom",
          bottomOffset: 80,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Warranty Claims</Text>

        {/* 🔍 Search + New Button Row */}
        <View style={styles.topRow}>
          <CustomerSearchBar
            value={searchValue}
            onChangeText={setSearchValue}
            onSearch={handleSearchCustomer}
            loading={loading}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.newBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.newBtnText}>＋ New</Text>
          </TouchableOpacity>
        </View>

        {/* ⚠️ Dòng thông báo khi không tìm thấy */}
        {notFound && !customer && (
          <Text style={styles.notFoundText}>Customer not found.</Text>
        )}

        {/* ✅ Hiển thị thông tin khách hàng */}
        <CustomerInfoCard
          customer={customer}
          onCreateClaim={() => setModalVisible(true)}
        />

        <NewClaimModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  danger: "#EF4444",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  newBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    height: 48,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  newBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  /** 🩶 Dòng "Customer not found" */
  notFoundText: {
    color: COLORS.textMuted,
    textAlign: "center",
    fontSize: 15,
    marginTop: 40,
  },
});
