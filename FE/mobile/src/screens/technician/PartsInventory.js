import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Package,
  Search,
  AlertCircle,
  CheckCircle,
  Box,
  X,
  Info,
} from "lucide-react-native";
import technicianService from "../../services/technicianService";
import { useIsFocused } from "@react-navigation/native";

// --- Danh mục component ---
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

// --- Component chính ---
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
  const isFocused = useIsFocused();

  // --- Tải danh sách xe ---
  const loadAvailableRecords = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadAvailableRecords();
    }
  }, [isFocused]);

  // --- Tải danh sách component ---
  const loadComponents = useCallback(async (recordId, category) => {
    if (!recordId || !category) {
      setComponents([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      let results = [];
      if (category === "all") {
        const categories = COMPONENT_CATEGORIES.filter(c => c.value !== "all").map(c => c.value);
        const promises = categories.map(cat =>
          technicianService.searchCompatibleComponents(recordId, cat)
            .then(res => res.data?.result || [])
            .catch(() => [])
        );
        const allResults = await Promise.all(promises);
        results = allResults.flat();
      } else {
        const response = await technicianService.searchCompatibleComponents(recordId, category);
        results = response.data?.result || [];
      }
      setComponents(results);
    } catch (err) {
      setError("Failed to load components");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComponents(currentRecordId, categoryFilter);
  }, [currentRecordId, categoryFilter]);

  // --- Lọc component ---
  const filteredComponents = useMemo(() => {
    if (searchQuery.trim() === "") return components;
    const query = searchQuery.toLowerCase();
    return components.filter(
      (comp) =>
        comp.name?.toLowerCase().includes(query) ||
        comp.typeComponentId?.toLowerCase().includes(query)
    );
  }, [components, searchQuery]);

  // --- Thông tin xe hiện tại ---
  const currentVehicleInfo = useMemo(() => {
    if (!currentRecordId) return null;
    const record = availableRecords.find(r => r.vehicleProcessingRecordId === currentRecordId);
    return record ? { vin: record.vin, model: record.vehicle?.model?.name ?? 'Unknown' } : null;
  }, [currentRecordId, availableRecords]);

  // --- Render item component ---
  const RenderComponentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partItem}
      onPress={() => {
        setSelectedComponent(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.partIconContainer}>
        <Box size={20} color="#2563EB" />
      </View>
      <View style={styles.partInfo}>
        <Text style={styles.partName} numberOfLines={1}>{item.name ?? 'No Name'}</Text>
        <Text style={styles.partId}>ID: {item.typeComponentId ?? 'N/A'}</Text>
        {item.isUnderWarranty !== undefined && (
          <View
            style={[
              styles.warrantyBadge,
              item.isUnderWarranty ? styles.warrantyEligibleBg : styles.warrantyIneligibleBg,
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
                item.isUnderWarranty ? styles.warrantyEligibleText : styles.warrantyIneligibleText,
              ]}
            >
              {item.isUnderWarranty ? "Under Warranty" : "Not Covered"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // --- Render UI chính ---
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredComponents}
        keyExtractor={(item) => item.typeComponentId}
        renderItem={({ item }) => <RenderComponentItem item={item} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Parts Inventory</Text>
            <Text style={styles.subtitle}>
              Browse components and check warranty status
            </Text>
            <View style={styles.infoBanner}>
              <Info size={18} color="#1D4ED8" />
              <Text style={styles.infoBannerText} numberOfLines={2}>
                {currentVehicleInfo
                  ? `Parts for: ${currentVehicleInfo.model} (${currentVehicleInfo.vin?.slice(-6)})`
                  : "Select a Vehicle to Start"}
              </Text>
            </View>
            <View style={styles.filterContainer}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={currentRecordId}
                  onValueChange={(itemValue) => {
                    setCurrentRecordId(itemValue);
                    setCategoryFilter("");
                    setComponents([]);
                  }}
                  enabled={!isLoadingRecords && availableRecords.length > 0}
                  style={styles.picker}
                  dropdownIconColor="#6B7280"
                >
                  <Picker.Item label={isLoadingRecords ? "Loading..." : "-- Select Vehicle --"} value={null} />
                  {availableRecords.map((record) => (
                    <Picker.Item
                      key={record.vehicleProcessingRecordId}
                      label={`${record.vehicle?.model?.name ?? "Unknown"} - ${record.vin?.slice(-6)}`}
                      value={record.vehicleProcessingRecordId}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={categoryFilter}
                  onValueChange={(itemValue) => setCategoryFilter(itemValue)}
                  enabled={!!currentRecordId && !isLoading}
                  style={styles.picker}
                  dropdownIconColor="#6B7280"
                >
                  <Picker.Item label="-- Select Category --" value="" />
                  {COMPONENT_CATEGORIES.map((cat) => (
                    <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                  ))}
                </Picker>
              </View>
              <View style={styles.searchInputContainer}>
                 <Search size={20} color="#9CA3AF" style={styles.searchIcon}/>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
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
        }
        ListEmptyComponent={
          !isLoading && !error && (
            <View style={styles.emptyContainer}>
              <Package size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No components available</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "Select a vehicle and category."}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadComponents(currentRecordId, categoryFilter)}
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={styles.listContentContainer}
      />

      {/* --- Modal Chi Tiết --- */}
      <Modal
        visible={showDetailsModal}
        animationType="fade"
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
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalContent}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Component Name</Text>
                  <Text style={styles.modalValue}>{selectedComponent?.name ?? 'N/A'}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Component ID</Text>
                  <Text style={styles.modalValue}>{selectedComponent?.typeComponentId ?? 'N/A'}</Text>
                </View>
                {selectedComponent?.isUnderWarranty !== undefined && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Warranty Status</Text>
                    <View
                      style={[
                        styles.modalStatusContainer,
                        selectedComponent?.isUnderWarranty
                          ? styles.modalStatusEligibleBg
                          : styles.modalStatusIneligibleBg,
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
                            ? styles.modalStatusEligibleText
                            : styles.modalStatusIneligibleText,
                        ]}
                      >
                        {selectedComponent?.isUnderWarranty ? "Under Warranty" : "Not Covered"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  listContentContainer: { padding: 16, paddingBottom: 32 },
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
  infoBannerText: { color: "#1E40AF", marginLeft: 8, flex: 1, fontSize: 13 },
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
  },
  picker: { width: "100%", height: 44, color: "#111827" },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', color: '#111827' },
  errorText: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#4B5563',
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
  partIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  partInfo: { flex: 1 },
  partName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  partId: { fontSize: 12, color: "#6B7280", marginTop: 2, marginBottom: 8 },
  warrantyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: "flex-start",
    gap: 4,
  },
  warrantyEligibleBg: { backgroundColor: "#D1FAE5" },
  warrantyIneligibleBg: { backgroundColor: "#FEE2E2" },
  warrantyText: { fontSize: 11, fontWeight: "600" },
  warrantyEligibleText: { color: "#065F46" },
  warrantyIneligibleText: { color: "#991B1B" },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
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
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxHeight: '70%',
    backgroundColor: "white",
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  modalScrollView: {},
  modalContent: { padding: 16 },
  modalSection: { marginBottom: 16 },
  modalLabel: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  modalValue: { fontSize: 15, fontWeight: "500", color: "#111827" },
  modalStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  modalStatusEligibleBg: { backgroundColor: "#D1FAE5" },
  modalStatusIneligibleBg: { backgroundColor: "#FEE2E2" },
  modalStatusText: { fontSize: 14, fontWeight: "600" },
  modalStatusEligibleText: { color: "#065F46" },
  modalStatusIneligibleText: { color: "#991B1B" },
  modalCloseButton: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});