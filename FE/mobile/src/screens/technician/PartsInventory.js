import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import technicianService from "../../services/technicianService";
import { useIsFocused } from "@react-navigation/native";

// --- Import component con ---
import { COMPONENT_CATEGORIES } from "../../utils/technician/partsUtils";
import PartsHeader from "../../components/technician/parts/PartsHeader";
import PartsItem from "../../components/technician/parts/PartsItem";
import EmptyParts from "../../components/technician/parts/EmptyParts";
import PartsDetailsModal from "../../components/technician/parts/PartsDetailsModal";

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
        const categories = COMPONENT_CATEGORIES.filter(
          (c) => c.value !== "all"
        ).map((c) => c.value);
        const promises = categories.map((cat) =>
          technicianService
            .searchCompatibleComponents(recordId, cat)
            .then((res) => res.data?.result || [])
            .catch(() => [])
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
    const record = availableRecords.find(
      (r) => r.vehicleProcessingRecordId === currentRecordId
    );
    return record
      ? { vin: record.vin, model: record.vehicle?.model?.name ?? "Unknown" }
      : null;
  }, [currentRecordId, availableRecords]);

  // --- Handlers ---
  const handleRecordIdChange = (itemValue) => {
    setCurrentRecordId(itemValue);
    setCategoryFilter("");
    setComponents([]);
  };

  const handleShowDetails = (item) => {
    setSelectedComponent(item);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedComponent(null);
  };

  // --- Render item ---
  const renderItem = ({ item }) => (
    <PartsItem item={item} onPress={() => handleShowDetails(item)} />
  );

  // --- Render UI chính ---
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredComponents}
        keyExtractor={(item) => item.typeComponentId}
        renderItem={renderItem}
        ListHeaderComponent={
          <PartsHeader
            currentVehicleInfo={currentVehicleInfo}
            currentRecordId={currentRecordId}
            onRecordIdChange={handleRecordIdChange}
            isLoadingRecords={isLoadingRecords}
            availableRecords={availableRecords}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
            error={error}
          />
        }
        ListEmptyComponent={
          !isLoading && !error && <EmptyParts searchQuery={searchQuery} />
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadComponents(currentRecordId, categoryFilter)}
            colors={["#3B82F6"]}
          />
        }
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Sửa lỗi Modal: Chỉ render khi cần thiết */}
      {showDetailsModal && selectedComponent && (
        <PartsDetailsModal
          visible={showDetailsModal}
          onClose={handleCloseDetails}
          component={selectedComponent}
        />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContentContainer: {
    padding: 12,
    paddingBottom: 32,
  },
});