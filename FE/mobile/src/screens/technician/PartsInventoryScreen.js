import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { technicianService, processingRecordService } from "../../services/technician";
import AvatarLogoutMenu from "../../components/technician/AvatarLogoutMenu"; 

const COMPONENT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "HIGH_VOLTAGE_BATTERY", label: "High Voltage Battery & BMS" },
  { value: "POWERTRAIN", label: "Powertrain (Motor, Inverter)" },
  { value: "CHARGING_SYSTEM", label: "Charging System & Port" },
  { value: "THERMAL_MANAGEMENT", label: "Thermal Management" },
  { value: "LOW_VOLTAGE_SYSTEM", label: "Low Voltage System (12V)" },
  { value: "BRAKING", label: "Braking System" },
  { value: "SUSPENSION_STEERING", label: "Suspension & Steering" },
  { value: "HVAC", label: "HVAC (Climate Control)" },
  { value: "BODY_CHASSIS", label: "Body & Chassis" },
  { value: "INFOTAINMENT_ADAS", label: "Infotainment & ADAS" },
];

export default function PartsInventoryScreen() {
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); 
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [currentVehicleInfo, setCurrentVehicleInfo] = useState(null); 
  const [availableRecords, setAvailableRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAvailableRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await technicianService.getAssignedRecords();     
      const records = response.data?.records?.records || [];    
      const activeStatuses = new Set([
        "CHECKED_IN", "IN_DIAGNOSIS", "WAITING_FOR_PARTS",
        "IN_REPAIR", "WAITING_CUSTOMER_APPROVAL", "PROCESSING", "READY_FOR_PICKUP"
      ]);
      const activeRecords = records.filter(r => activeStatuses.has(r.status));

      setAvailableRecords(activeRecords);
    } catch (err) {
      console.error("Failed to load records:", err);
      setError("Unable to load vehicle list");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAvailableRecords();
    }, [])
  );

  const loadComponents = async (recordId, category, currentSearch) => {
    if (!recordId) {
      setComponents([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let results = [];
      if (category === "all" || category === "") {
        const categoriesToFetch = COMPONENT_CATEGORIES.filter(
          (c) => c.value !== "all"
        ).map((c) => c.value);

        const promises = categoriesToFetch.map((cat) =>
          processingRecordService
            .searchCompatibleComponents(recordId, cat, currentSearch) 
            .then((res) => res || []) 
        );
        const allResults = await Promise.all(promises);
        results = allResults.flat();
      } else {
        const response = await processingRecordService.searchCompatibleComponents(
          recordId,
          category,
          currentSearch
        );
        results = response || [];
      }
      setComponents(results);
    } catch (err) {
      setError("Unable to load parts list");
      console.error(err);
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentRecordId && categoryFilter !== "") {
      loadComponents(currentRecordId, categoryFilter, searchQuery);
    }
  }, [currentRecordId, categoryFilter]);

  useEffect(() => {
    let filtered = [...components];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.typeComponentId.toLowerCase().includes(query)
      );
    }
    setFilteredComponents(filtered);
  }, [components, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      loadAvailableRecords(),
      loadComponents(currentRecordId, categoryFilter, searchQuery)
    ]).then(() =>
      setRefreshing(false)
    );
  }, [currentRecordId, categoryFilter, searchQuery]);

  const handleRecordSelection = (recordId) => {
    const record = availableRecords.find(
      (r) => r.vehicleProcessingRecordId === recordId
    );
    if (record) {
      setCurrentRecordId(recordId);
      setCurrentVehicleInfo({
        vin: record.vin,
        model: record.vehicle?.model?.name || "Unknown Model",
      });
      setComponents([]);
      setFilteredComponents([]);
      setSearchQuery(""); 
      setCategoryFilter(""); 
      setTimeout(() => setCategoryFilter("all"), 0); 
    } else {
      setCurrentRecordId(null);
      setCurrentVehicleInfo(null);
      setComponents([]);
      setFilteredComponents([]);
      setCategoryFilter("");
    }
  };

  const viewComponentDetails = (component) => {
    setSelectedComponent(component);
    setShowDetailsModal(true);
  };

  const renderComponentList = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading parts...</Text>
        </View>
      );
    }
    if (!currentRecordId) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="car-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Please select a vehicle</Text>
          <Text style={styles.emptySubText}>
            Select a vehicle to view compatible parts.
          </Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    if (filteredComponents.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>No parts found</Text>
          <Text style={styles.emptySubText}>
            No parts match your filter criteria.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <Text style={styles.resultCountText}>
          Found {filteredComponents.length} parts
        </Text>
        {filteredComponents.map((component) => (
          <TouchableOpacity
            key={component.typeComponentId}
            style={styles.componentCard}
            onPress={() => viewComponentDetails(component)}
          >
            <View style={styles.componentIcon}>
              <Ionicons name="cube-outline" size={24} color="#1D4ED8" />
            </View>
            <View style={styles.componentInfo}>
              <Text style={styles.componentName}>{component.name}</Text>
              <Text style={styles.componentId}>
                ID: {component.typeComponentId}
              </Text>
            </View>
            <View>
              {component.isUnderWarranty ? (
                <View style={styles.warrantyBadgeGood}>
                  <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
                  <Text style={styles.warrantyTextGood}>Warranty</Text>
                </View>
              ) : (
                <View style={styles.warrantyBadgeBad}>
                  <Ionicons name="shield-outline" size={14} color="#EF4444" />
                  <Text style={styles.warrantyTextBad}>No Warranty</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parts Inventory</Text>
        <AvatarLogoutMenu />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#1D4ED8" />
          <Text style={styles.infoText}>
            {currentVehicleInfo
              ? `Showing parts for: ${currentVehicleInfo.model}`
              : "Select a vehicle to start searching for parts."}
          </Text>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={styles.label}>Select Vehicle</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currentRecordId}
              onValueChange={(itemValue) => handleRecordSelection(itemValue)}
              style={styles.picker}
              enabled={!isLoadingRecords}
            >
              <Picker.Item label={isLoadingRecords ? "Loading vehicles..." : "-- Select Vehicle --"} value={null} />
              {availableRecords.map((record) => (
                <Picker.Item
                  key={record.vehicleProcessingRecordId}
                  label={`${record.vehicle?.model?.name} - ${record.vin} (${record.status})`}
                  value={record.vehicleProcessingRecordId}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Search Parts</Text>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by part name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!!currentRecordId}
            />
          </View>

          <Text style={styles.label}>Filter by Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryFilter}
              onValueChange={(itemValue) => setCategoryFilter(itemValue)}
              style={styles.picker}
              enabled={!!currentRecordId}
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
        </View>

        {renderComponentList()}
        
        <View style={styles.infoCardsContainer}>
          <InfoCard
            icon="search-outline"
            title="How to Search"
            text="Select a vehicle to find compatible parts."
          />
          <InfoCard
            icon="shield-checkmark-outline"
            title="Warranty Status"
            text="Check the warranty status of the component."
          />
        </View>
      </ScrollView>

      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowDetailsModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Component Details</Text>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {selectedComponent && (
                <>
                  <Text style={styles.modalLabel}>Part Name</Text>
                  <Text style={styles.modalValue}>
                    {selectedComponent.name}
                  </Text>
                  <Text style={styles.modalLabel}>Component ID</Text>
                  <Text style={styles.modalValue}>
                    {selectedComponent.typeComponentId}
                  </Text>
                  <Text style={styles.modalLabel}>Warranty Status</Text>
                  {selectedComponent.isUnderWarranty ? (
                    <View style={styles.warrantyBoxGood}>
                      <Ionicons
                        name="shield-checkmark"
                        size={18}
                        color="#16A34A"
                      />
                      <Text style={styles.warrantyBoxTextGood}>
                        Under Warranty
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.warrantyBoxBad}>
                      <Ionicons name="shield-outline" size={18} color="#EF4444" />
                      <Text style={styles.warrantyBoxTextBad}>
                        No Warranty
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const InfoCard = ({ icon, title, text }) => (
  <View style={styles.infoCard}>
    <Ionicons name={icon} size={24} color="#1D4ED8" />
    <Text style={styles.infoCardTitle}>{title}</Text>
    <Text style={styles.infoCardText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12, 
    paddingHorizontal: 16,
    paddingTop: 40, 
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContainer: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: "#1E40AF",
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    color: "#111827",
  },
  searchInputContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#111827",
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4B5563",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  resultCountText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  componentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  componentIcon: {
    padding: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    marginRight: 12,
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  componentId: {
    fontSize: 12,
    color: "#6B7280",
  },
  warrantyBadgeGood: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  warrantyTextGood: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16A34A",
    marginLeft: 4,
  },
  warrantyBadgeBad: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  warrantyTextBad: {
    fontSize: 12,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 4,
  },
  infoCardsContainer: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 16,
  },
  warrantyBoxGood: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  warrantyBoxTextGood: {
    fontSize: 16,
    fontWeight: "500",
    color: "#16A34A",
    marginLeft: 8,
  },
  warrantyBoxBad: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warrantyBoxTextBad: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 8,
  },
});