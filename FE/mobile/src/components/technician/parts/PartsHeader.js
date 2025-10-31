import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Search, Info } from "lucide-react-native";
import { COMPONENT_CATEGORIES } from "../../../utils/technician/partsUtils";

export default function PartsHeader({
  currentVehicleInfo,
  currentRecordId,
  onRecordIdChange,
  isLoadingRecords,
  availableRecords,
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  isLoading,
  error,
}) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Parts Inventory</Text>
        <Text style={styles.subtitle}>
          Browse components and check warranty status
        </Text>
      </View>

      <View style={styles.infoBanner}>
        <Info size={16} color="#1D4ED8" />
        <Text style={styles.infoBannerText} numberOfLines={2}>
          {currentVehicleInfo
            ? `Parts for: ${currentVehicleInfo.model} (${currentVehicleInfo.vin?.slice(
                -6
              )})`
            : "Select a Vehicle to Start"}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={currentRecordId}
            onValueChange={(itemValue) => onRecordIdChange(itemValue)}
            enabled={!isLoadingRecords && availableRecords.length > 0}
            style={styles.picker}
            dropdownIconColor="#6B7280"
          >
            <Picker.Item
              label={
                isLoadingRecords ? "Loading..." : "-- Select Vehicle --"
              }
              value={null}
            />
            {availableRecords.map((record) => (
              <Picker.Item
                key={record.vehicleProcessingRecordId}
                label={`${
                  record.vehicle?.model?.name ?? "Unknown"
                } - ${record.vin?.slice(-6)}`}
                value={record.vehicleProcessingRecordId}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={categoryFilter}
            onValueChange={onCategoryChange}
            enabled={!!currentRecordId && !isLoading}
            style={styles.picker}
            dropdownIconColor="#6B7280"
          >
            <Picker.Item label="-- Select Category --" value="" />
            {COMPONENT_CATEGORIES.map((cat) => (
              <Picker.Item
                key={cat.value}
                label={cat.label}
                value={cat.value}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.searchInputContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or ID..."
            value={searchQuery}
            onChangeText={onSearchChange}
            editable={!!currentRecordId && categoryFilter !== ""}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading components...</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
    lineHeight: 18,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBannerText: {
    color: "#1E40AF",
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  filterContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerWrapper: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: "#111827",
    fontSize: 14,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#111827",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#4B5563",
    fontSize: 14,
  },
});