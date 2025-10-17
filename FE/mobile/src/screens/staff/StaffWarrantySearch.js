import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getVehicleWarrantyInfo } from "../../services/vehicleService";

const COLORS = {
  // Dark palette
  bg: "#0B0F14", // page background (near-black)
  surface: "#11161C", // cards / bars
  surface2: "#0E1319",
  border: "#1F2833", // subtle borders
  text: "#E6EAF2", // primary text
  textMuted: "#9AA7B5", // secondary text
  divider: "#1A2330",
  accent: "#3B82F6", // royal blue
  accentSoft: "#2C5FC0",
  success: "#22C55E",
  danger: "#EF4444",
};

export default function StaffWarrantySearch() {
  const [vin, setVin] = useState("");
  const [odometer, setOdometer] = useState("");
  const [warrantyData, setWarrantyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSearch = async () => {
    if (!vin.trim() || !odometer.trim()) {
      setError("Please enter both VIN and odometer.");
      return;
    }

    setLoading(true);
    setError("");
    setWarrantyData(null);

    try {
      const data = await getVehicleWarrantyInfo(vin, odometer);
      if (data?.status === "success") {
        setWarrantyData(data.data.vehicle);
      } else {
        setError("Warranty info not found or invalid response.");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to fetch warranty info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StatusPill = ({ value }) => {
    const isActive = value === "ACTIVE";
    return (
      <View
        style={[
          styles.pill,
          {
            backgroundColor: isActive ? "#123B27" : "#3B1E1E",
            borderColor: isActive ? COLORS.success : COLORS.danger,
          },
        ]}
      >
        <View
          style={[
            styles.pillDot,
            { backgroundColor: isActive ? COLORS.success : COLORS.danger },
          ]}
        />
        <Text
          style={[
            styles.pillText,
            { color: isActive ? COLORS.success : COLORS.danger },
          ]}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Vehicle Warranty Lookup</Text>

          {/* Search Bar */}
          <View
            style={[
              styles.searchBar,
              focused && { borderColor: COLORS.accent, shadowOpacity: 0.2 },
            ]}
          >
            <MaterialCommunityIcons
              name="car-search-outline"
              size={22}
              color={COLORS.accent}
              style={{ marginRight: 10 }}
            />

            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                placeholder="Enter VIN number"
                placeholderTextColor={COLORS.textMuted}
                value={vin}
                onChangeText={setVin}
                autoCapitalize="characters"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Enter odometer (km)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={odometer}
                onChangeText={setOdometer}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>

            <TouchableOpacity
              style={[styles.searchButton, loading && { opacity: 0.9 }]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Results */}
          <ScrollView
            style={{ marginTop: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {warrantyData && (
              <>
                {/* General Warranty */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      name="clipboard-list-outline"
                      size={20}
                      color={COLORS.accent}
                    />
                    <Text style={styles.cardTitle}>General Warranty</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <Text style={styles.label}>Duration</Text>
                    <Text style={styles.value}>
                      {warrantyData.generalWarranty.policy.durationMonths}{" "}
                      months
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Mileage Limit</Text>
                    <Text style={styles.value}>
                      {warrantyData.generalWarranty.policy.mileageLimit} km
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <StatusPill
                      value={warrantyData.generalWarranty.duration.status}
                    />
                  </View>
                </View>

                {/* Component Warranties */}
                <Text style={styles.sectionTitle}>Component Warranties</Text>

                {warrantyData.componentWarranties.map((comp, idx) => (
                  <View
                    key={`${comp.componentName}-${idx}`}
                    style={styles.componentCard}
                  >
                    <View style={styles.componentHeader}>
                      <MaterialCommunityIcons
                        name="cog-outline"
                        size={18}
                        color={COLORS.accent}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.componentName}>
                        {comp.componentName}
                      </Text>
                    </View>

                    <View style={styles.componentBody}>
                      <Text style={styles.detail}>
                        {comp.policy.durationMonths} months warranty
                      </Text>
                      <Text style={styles.detail}>
                        {comp.policy.mileageLimit} km limit
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <Text style={[styles.detail, { marginRight: 8 }]}>
                          Status
                        </Text>
                        <StatusPill value={comp.duration.status} />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 22,
    letterSpacing: 0.3,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    fontSize: 15,
    color: COLORS.text,
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  searchButton: {
    marginLeft: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 28,
    padding: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "600",
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: { color: COLORS.textMuted, fontSize: 13 },
  value: { color: COLORS.text, fontSize: 15, fontWeight: "600" },

  sectionTitle: {
    fontWeight: "700",
    color: COLORS.text,
    fontSize: 18,
    marginBottom: 12,
    marginTop: 6,
  },

  componentCard: {
    backgroundColor: COLORS.surface2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  componentHeader: { flexDirection: "row", alignItems: "center" },
  componentName: { fontWeight: "600", fontSize: 15, color: COLORS.text },
  componentBody: { marginTop: 8 },
  detail: { fontSize: 14, color: COLORS.textMuted },

  // Status pill
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
