import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ManagerHeader from "./components/ManagerHeader";
import CustomerCard from "./components/CustomerCard";
import UpdateCustomerModal from "./components/UpdateCustomerModal";
import {
  getAllCustomers,
  getCustomerByPhoneOrEmail,
} from "../../services/customerService";

const COLORS = {
  bg: "#0B0F14",
  surface: "#11161C",
  border: "#1F2833",
  text: "#E6EAF2",
  textMuted: "#9AA7B5",
  accent: "#3B82F6",
  shadow: "rgba(0,0,0,0.25)",
};

export default function ManagerCustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

  // Modal update
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  const fetchAllCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setCustomers(data.data.customers || []);
      setError("");
    } catch (err) {
      console.error("❌ Failed to load customers:", err);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!searchText.trim()) {
      fetchAllCustomers();
      return;
    }

    try {
      setLoading(true);
      const data = await getCustomerByPhoneOrEmail(searchText.trim());
      if (data.status === "success" && data.data?.customer) {
        setCustomers([data.data.customer]);
        setError("");
      } else {
        setCustomers([]);
        setError("No matching customer found.");
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      setError("Error searching customer.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllCustomers().then(() => setRefreshing(false));
  }, []);

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowUpdateModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ManagerHeader title="Customer Management" icon="people-outline" />

      {/* 🔍 Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search by phone or email..."
          placeholderTextColor={COLORS.textMuted}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* 📋 Danh sách khách hàng */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerCard customer={item} onEdit={handleEditCustomer} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
            />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      {/* ✏️ Modal update */}
      <UpdateCustomerModal
        visible={showUpdateModal}
        customer={selectedCustomer}
        onClose={() => setShowUpdateModal(false)}
        onUpdated={fetchAllCustomers}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
  },
  error: {
    color: COLORS.accent,
    textAlign: "center",
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
