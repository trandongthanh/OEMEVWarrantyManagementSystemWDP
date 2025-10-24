import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Package,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Box,
  Wrench,
  X,
  Info,
} from "lucide-react-native";
import technicianService from "../../services/technicianService";

const COMPONENT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "HIGH_VOLTAGE_BATTERY", label: "High Voltage Battery & BMS" },
  { value: "POWERTRAIN", label: "Powertrain" },
  { value: "CHARGING_SYSTEM", label: "Charging System" },
  { value: "THERMAL_MANAGEMENT", label: "Thermal Management" },
  { value: "LOW_VOLTAGE_SYSTEM", label: "Low Voltage System" },
  { value: "BRAKING", label: "Braking System" },
  { value: "SUSPENSION_STEERING", label: "Suspension & Steering" },
  { value: "HVAC", label: "HVAC" },
  { value: "BODY_CHASSIS", label: "Body & Chassis" },
  { value: "INFOTAINMENT_ADAS", label: "Infotainment & ADAS" },
];

export default function PartsInventory() {
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [availableRecords, setAvailableRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  useEffect(() => {
    loadAvailableRecords();
  }, []);

  const loadAvailableRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await technicianService.getAssignedRecords();
      setAvailableRecords(response.data?.records?.records || []);
    } catch (err) {
      console.error("Failed to load records:", err);
      setError("Failed to load available vehicle records");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const loadComponents = async (recordId, category) => {
    if (!recordId) return;
    setIsLoading(true);
    setError("");
    try {
      let results = [];
      if (category === "all" || category === "") {
        const categories = COMPONENT_CATEGORIES.filter(
          (c) => c.value !== "all"
        ).map((c) => c.value);
        const promises = categories.map((cat) =>
          technicianService
            .searchCompatibleComponents(recordId, cat)
            .then((res) => res.data?.result || [])
        );
        const allResults = await Promise.all(promises);
        results = allResults.flat();
      } else {
        const response = await technicianService.searchCompatibleComponents(
          recordId,
          category
        );
        results = response.data?.result || [];
      }
      setComponents(results);
    } catch (err) {
      setError("Failed to load components");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentRecordId && categoryFilter !== "") {
      loadComponents(currentRecordId, categoryFilter);
    }
  }, [currentRecordId, categoryFilter]);

  const filteredComponents = useMemo(() => {
    if (searchQuery.trim() === "") return components;
    const query = searchQuery.toLowerCase();
    return components.filter(
      (comp) =>
        comp.name.toLowerCase().includes(query) ||
        comp.typeComponentId.toLowerCase().includes(query)
    );
  }, [components, searchQuery]);

  const currentVehicleInfo = useMemo(() => {
    if (!currentRecordId) return null;
    const record = availableRecords.find(
      (r) => r.vehicleProcessingRecordId === currentRecordId
    );
    return record
      ? { vin: record.vin, model: record.vehicle?.model?.name }
      : null;
  }, [currentRecordId, availableRecords]);

  const renderComponentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partItem}
      onPress={() => {
        setSelectedComponent(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.partIcon}>
        <Box size={22} color="#2563EB" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.partName}>{item.name}</Text>
        <Text style={styles.partId}>ID: {item.typeComponentId}</Text>
        {item.isUnderWarranty !== undefined && (
          <View
            style={[
              styles.warrantyBadge,
              item.isUnderWarranty
                ? styles.warrantyEligible
                : styles.warrantyIneligible,
            ]}
          >
            {item.isUnderWarranty ? (
              <CheckCircle size={12} color="#15803D" />
            ) : (
              <AlertCircle size={12} color="#B91C1C" />
            )}
            <Text
              style={[
                styles.warrantyText,
                item.isUnderWarranty
                  ? styles.warrantyTextEligible
                  : styles.warrantyTextIneligible,
              ]}
            >
              {item.isUnderWarranty ? "Under Warranty" : "Not Covered"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parts Inventory</Text>
      <Text style={styles.subtitle}>
        Browse components and check warranty status
      </Text>

      <View style={styles.infoBanner}>
        <Info size={20} color="#1D4ED8" />
        <Text style={styles.infoBannerText}>
          {currentVehicleInfo
            ? `Showing parts for: ${currentVehicleInfo.model} (${currentVehicleInfo.vin})`
            : "Select a Vehicle to Start"}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={currentRecordId}
            onValueChange={(itemValue) => setCurrentRecordId(itemValue)}
            enabled={!isLoadingRecords && availableRecords.length > 0}
            style={styles.picker}
            dropdownIconColor="#6B7280"
          >
            <Picker.Item
              label={
                isLoadingRecords
                  ? "Loading vehicles..."
                  : "-- Select a vehicle --"
              }
              value={null}
            />
            {availableRecords.map((record) => (
              <Picker.Item
                key={record.vehicleProcessingRecordId}
                label={`${
                  record.vehicle?.model?.name || "Unknown"
                } - ${record.vin.slice(-6)}`}
                value={record.vehicleProcessingRecordId}
              />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoryFilter}
            onValueChange={(itemValue) => setCategoryFilter(itemValue)}
            enabled={!!currentRecordId}
            style={styles.picker}
            dropdownIconColor="#6B7280"
          >
            <Picker.Item label="-- Select Category --" value="" />
            {COMPONENT_CATEGORIES.map((cat) => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>
        <View style={styles.searchInput}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={{ flex: 1, marginLeft: 8 }}
            placeholder="Search by component name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!!currentRecordId}
          />
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredComponents}
          keyExtractor={(item) => item.typeComponentId}
          renderItem={renderComponentItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No components available</Text>
              <Text style={styles.emptySubtitle}>
                Select a vehicle and category to see parts.
              </Text>
            </View>
          }
        />
      )}

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Component Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Component Name</Text>
                <Text style={styles.modalValue}>{selectedComponent?.name}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Component ID</Text>
                <Text style={styles.modalValue}>
                  {selectedComponent?.typeComponentId}
                </Text>
              </View>
              {selectedComponent?.isUnderWarranty !== undefined && (
                <View>
                  <Text style={styles.modalLabel}>Warranty Status</Text>
                  <View
                    style={[
                      styles.modalStatus,
                      selectedComponent?.isUnderWarranty
                        ? styles.modalStatusEligible
                        : styles.modalStatusIneligible,
                    ]}
                  >
                    {selectedComponent?.isUnderWarranty ? (
                      <CheckCircle size={16} color="#15803D" />
                    ) : (
                      <AlertCircle size={16} color="#B91C1C" />
                    )}
                    <Text
                      style={[
                        styles.modalStatusText,
                        selectedComponent?.isUnderWarranty
                          ? { color: "#15803D" }
                          : { color: "#B91C1C" },
                      ]}
                    >
                      {selectedComponent?.isUnderWarranty
                        ? "Under Warranty"
                        : "Not Covered"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ... (Styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 15, color: "#4B5563", marginTop: 4, marginBottom: 16 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBannerText: { color: "#1E40AF", marginLeft: 8 },
  filterContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginBottom: 12,
  },
  picker: { width: "100%", height: 44 },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  errorText: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 16,
  },
  partItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    alignItems: "center",
  },
  partIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  partName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  partId: { fontSize: 12, color: "#6B7280", marginTop: 2, marginBottom: 8 },
  warrantyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    gap: 4,
  },
  warrantyEligible: { backgroundColor: "#D1FAE5" },
  warrantyIneligible: { backgroundColor: "#FEE2E2" },
  warrantyText: { fontSize: 11, fontWeight: "500" },
  warrantyTextEligible: { color: "#065F46" },
  warrantyTextIneligible: { color: "#991B1B" },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  modalContent: { padding: 16 },
  modalSection: { marginBottom: 16 },
  modalLabel: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  modalValue: { fontSize: 16, fontWeight: "500" },
  modalStatus: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalStatusEligible: { backgroundColor: "#D1FAE5" },
  modalStatusIneligible: { backgroundColor: "#FEE2E2" },
  modalStatusText: { fontSize: 14, fontWeight: "600" },
  modalCloseButton: {
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});

