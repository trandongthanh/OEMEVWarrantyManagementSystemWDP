import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import NewClaimModal from "../../components/staff/NewClaimModal";
import CustomerSearchBar from "../../components/customer/CustomerSearchBar";
import CustomerInfoCard from "../../components/customer/CustomerInfoCard";
import { getCustomerByPhoneOrEmail } from "../../services/customerService";
import CasesOverview from "./components/CasesOverview";

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
      } else {
        setNotFound(true);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1:
          err?.response?.status === 404
            ? "Customer not found."
            : "Network or server error.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Warranty Claims</Text>

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

        {notFound && (
          <Text style={styles.notFoundText}>Customer not found.</Text>
        )}

        <CustomerInfoCard
          customer={customer}
          onCreateClaim={() => setModalVisible(true)}
        />

        <NewClaimModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        {/* 📊 Thống kê trạng thái (tách riêng component) */}
        <CasesOverview />
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#0B0F14",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 60,
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
  },
  newBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  notFoundText: {
    color: COLORS.textMuted,
    textAlign: "center",
    fontSize: 15,
    marginTop: 40,
  },
});
