import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import technicianService from "../../services/technician/technicianService";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [availableRecords, setAvailableRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAvailableRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await technicianService.getAssignedRecords();
      const records = response.data?.records?.records || [];
      const activeRecords = records.filter(
        (r) => r.status === "IN_DIAGNOSIS" || r.status === "IN_REPAIR"
      );
      setAvailableRecords(activeRecords);
    } catch (err) {
      console.error("Failed to load records:", err);
      setError("Không thể tải danh sách xe");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAvailableRecords();
    }, [])
  );

  const loadComponents = async () => {
    if (!currentRecordId || categoryFilter === "") {
      setComponents([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let results = [];
      if (categoryFilter === "all") {
        const categoriesToFetch = COMPONENT_CATEGORIES.filter(
          (c) => c.value !== "all"
        ).map((c) => c.value);

        const promises = categoriesToFetch.map((cat) =>
          technicianService
            .searchCompatibleComponents(currentRecordId, cat, searchQuery)
            .then((res) => res.data?.result || [])
        );
        const allResults = await Promise.all(promises);
        results = allResults.flat();
      } else {
        const response = await technicianService.searchCompatibleComponents(
          currentRecordId,
          categoryFilter,
          searchQuery
        );
        results = response.data?.result || [];
      }
      setComponents(results);
    } catch (err) {
      setError("Không thể tải danh sách linh kiện");
      console.error(err);
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, [currentRecordId, categoryFilter, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([loadAvailableRecords(), loadComponents()]).then(() =>
      setRefreshing(false)
    );
  }, [currentRecordId, categoryFilter, searchQuery]);

  const currentVehicleInfo = useMemo(() => {
    if (!currentRecordId) return null;
    const record = availableRecords.find(
      (r) => r.vehicleProcessingRecordId === currentRecordId
    );
    return record
      ? { vin: record.vin, model: record.vehicle?.model?.name }
      : null;
  }, [currentRecordId, availableRecords]);

  const viewComponentDetails = (component) => {
    setSelectedComponent(component);
    setShowDetailsModal(true);
  };

  const renderComponentList = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Đang tải linh kiện...</Text>
        </View>
      );
    }

    if (!currentRecordId) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="car-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Vui lòng chọn xe</Text>
          <Text style={styles.emptySubText}>
            Chọn một xe đang sửa để xem linh kiện.
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

    if (components.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Không tìm thấy linh kiện</Text>
          <Text style={styles.emptySubText}>
            Không có linh kiện nào phù hợp với bộ lọc.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <Text style={styles.resultCountText}>
          Tìm thấy {components.length} linh kiện
        </Text>
        {components.map((component) => (
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
                  <Text style={styles.warrantyTextGood}>Bảo hành</Text>
                </View>
              ) : (
                <View style={styles.warrantyBadgeBad}>
                  <Ionicons name="shield-outline" size={14} color="#EF4444" />
                  <Text style={styles.warrantyTextBad}>Không BH</Text>
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
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.filterSection}>
          <Text style={styles.label}>Chọn xe (đang sửa chữa)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currentRecordId}
              onValueChange={(itemValue) => setCurrentRecordId(itemValue)}
              style={styles.picker}
              enabled={!isLoadingRecords}
            >
              <Picker.Item label="-- Chọn xe --" value={null} />
              {availableRecords.map((record) => (
                <Picker.Item
                  key={record.vehicleProcessingRecordId}
                  label={`${record.vehicle?.model?.name} - ${record.vin}`}
                  value={record.vehicleProcessingRecordId}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tìm kiếm linh kiện</Text>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo tên linh kiện..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!!currentRecordId}
            />
          </View>

          <Text style={styles.label}>Lọc theo danh mục</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryFilter}
              onValueChange={(itemValue) => setCategoryFilter(itemValue)}
              style={styles.picker}
              enabled={!!currentRecordId}
            >
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

        {currentVehicleInfo && (
          <View style={styles.infoBox}>
            <Ionicons name="car-sport-outline" size={20} color="#1D4ED8" />
            <Text style={styles.infoText}>
              Đang hiển thị linh kiện cho:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {currentVehicleInfo.model}
              </Text>
            </Text>
          </View>
        )}

        {renderComponentList()}
      </ScrollView>

      {/* Modal Chi tiết Linh kiện */}
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
              <Text style={styles.modalTitle}>Chi tiết linh kiện</Text>
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
                  <Text style={styles.modalLabel}>Tên linh kiện</Text>
                  <Text style={styles.modalValue}>
                    {selectedComponent.name}
                  </Text>

                  <Text style={styles.modalLabel}>Component ID</Text>
                  <Text style={styles.modalValue}>
                    {selectedComponent.typeComponentId}
                  </Text>

                  <Text style={styles.modalLabel}>Trạng thái bảo hành</Text>
                  {selectedComponent.isUnderWarranty ? (
                    <View style={styles.warrantyBoxGood}>
                      <Ionicons
                        name="shield-checkmark"
                        size={18}
                        color="#16A34A"
                      />
                      <Text style={styles.warrantyBoxTextGood}>
                        Còn bảo hành
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.warrantyBoxBad}>
                      <Ionicons name="shield-outline" size={18} color="#EF4444" />
                      <Text style={styles.warrantyBoxTextBad}>
                        Không bảo hành
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContainer: {
    flex: 1,
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
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: "#1E40AF",
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