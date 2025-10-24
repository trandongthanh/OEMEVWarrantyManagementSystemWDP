import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  X,
  Plus,
  Save,
  Search,
  Package,
  AlertCircle,
  CheckCircle,
  Wrench,
  FileText,
  Shield,
  ShieldOff,
  Trash2,
} from "lucide-react-native";
import technicianService from "../../services/technicianService";

// (Copy COMPONENT_CATEGORIES from PartsInventory.js)
const COMPONENT_CATEGORIES = [
  { value: "HIGH_VOLTAGE_BATTERY", label: "High Voltage Battery & BMS" },
  { value: "POWERTRAIN", label: "Powertrain" },
  { value: "CHARGING_SYSTEM", label: "Charging System" },
  // ... (Thêm các category khác nếu cần)
];

const CaseLine = ({
  caseLine,
  index,
  handleCaseLineChange,
  handleRemoveCaseLine,
  handleOpenComponentSearch,
  canRemove,
}) => (
  <View style={styles.caseLineContainer}>
    <View style={styles.caseLineHeader}>
      <Text style={styles.caseLineTitle}>Line {index + 1}</Text>
      {canRemove && (
        <TouchableOpacity onPress={() => handleRemoveCaseLine(index)}>
          <Trash2 size={18} color="#DC2626" />
        </TouchableOpacity>
      )}
    </View>

    <Text style={styles.label}>
      <FileText size={14} color="#4B5563" /> Diagnosis *
    </Text>
    <TextInput
      style={[styles.input, styles.textarea]}
      value={caseLine.diagnosisText}
      onChangeText={(val) =>
        handleCaseLineChange(index, "diagnosisText", val)
      }
      placeholder="Describe the problem found..."
      multiline
    />

    <Text style={styles.label}>
      <Wrench size={14} color="#4B5563" /> Correction *
    </Text>
    <TextInput
      style={[styles.input, styles.textarea]}
      value={caseLine.correctionText}
      onChangeText={(val) =>
        handleCaseLineChange(index, "correctionText", val)
      }
      placeholder="Describe the repair action..."
      multiline
    />

    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ flex: 3 }}>
        <Text style={styles.label}>
          <Package size={14} color="#4B5563" /> Component
        </Text>
        <TouchableOpacity
          style={styles.componentButton}
          onPress={() => handleOpenComponentSearch(index)}
        >
          <Text style={styles.componentButtonText} numberOfLines={1}>
            {caseLine.componentId || "Search Component"}
          </Text>
          <Search size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Qty</Text>
        <TextInput
          style={styles.input}
          value={String(caseLine.quantity)}
          onChangeText={(val) =>
            handleCaseLineChange(index, "quantity", parseInt(val) || 0)
          }
          keyboardType="numeric"
        />
      </View>
    </View>

    <Text style={styles.label}>Warranty Status</Text>
    <View style={styles.warrantyStatus}>
      {caseLine.warrantyStatus === "ELIGIBLE" ? (
        <>
          <CheckCircle size={16} color="#16A34A" />
          <Text style={{ color: "#16A34A", fontWeight: "500" }}>Eligible</Text>
        </>
      ) : (
        <>
          <AlertCircle size={16} color="#DC2626" />
          <Text style={{ color: "#DC2626", fontWeight: "500" }}>Ineligible</Text>
        </>
      )}
    </View>
  </View>
);

const ComponentSearch = ({
  searchCategory,
  setSearchCategory,
  searchQuery,
  setSearchQuery,
  searchComponents,
  isSearching,
  components,
  handleSelectComponent,
  setShowComponentSearch,
}) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchHeader}>
      <Text style={styles.searchTitle}>Search Components</Text>
      <TouchableOpacity onPress={() => setShowComponentSearch(false)}>
        <X size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={searchCategory}
        onValueChange={setSearchCategory}
        style={styles.picker}
      >
        {COMPONENT_CATEGORIES.map((cat) => (
          <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
        ))}
      </Picker>
    </View>
    <TextInput
      style={[styles.input, { marginBottom: 12 }]}
      placeholder="Search by name..."
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
    <TouchableOpacity
      style={styles.searchButton}
      onPress={searchComponents}
      disabled={isSearching}
    >
      <Text style={styles.searchButtonText}>
        {isSearching ? "Searching..." : "Search"}
      </Text>
    </TouchableOpacity>
    <FlatList
      style={{ maxHeight: 200 }}
      data={components}
      keyExtractor={(item) => item.typeComponentId}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.componentItem}
          onPress={() => handleSelectComponent(item)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.componentName}>{item.name}</Text>
            <Text style={styles.componentId}>{item.typeComponentId}</Text>
          </View>
          {item.isUnderWarranty ? (
            <Shield size={20} color="#16A34A" />
          ) : (
            <ShieldOff size={20} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No components found</Text>
      }
    />
  </View>
);

export default function CaseDetailsModal({
  isOpen,
  onClose,
  vin,
  recordId,
  caseId,
  onSuccess,
}) {
  const [caseLines, setCaseLines] = useState([
    {
      diagnosisText: "",
      correctionText: "",
      componentId: null,
      quantity: 0,
      warrantyStatus: "ELIGIBLE",
    },
  ]);
  const [searchCategory, setSearchCategory] = useState("HIGH_VOLTAGE_BATTERY");
  const [searchQuery, setSearchQuery] = useState("");
  const [components, setComponents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComponentSearch, setShowComponentSearch] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(null);

  useEffect(() => {
    if (isOpen && recordId) {
      searchComponents();
    }
  }, [isOpen, searchCategory]);

  const searchComponents = async () => {
    if (!recordId) {
      Alert.alert("Error", "No processing record ID available.");
      return;
    }
    setIsSearching(true);
    try {
      const response = await technicianService.searchCompatibleComponents(
        recordId,
        searchCategory,
        searchQuery || undefined
      );
      setComponents(response.data?.result || []);
    } catch (error) {
      console.error("Error searching components:", error);
      Alert.alert("Error", "Failed to search components.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCaseLine = () => {
    setCaseLines([
      ...caseLines,
      {
        diagnosisText: "",
        correctionText: "",
        componentId: null,
        quantity: 0,
        warrantyStatus: "ELIGIBLE",
      },
    ]);
  };

  const handleRemoveCaseLine = (index) => {
    if (caseLines.length > 1) {
      setCaseLines(caseLines.filter((_, i) => i !== index));
    }
  };

  const handleCaseLineChange = (index, field, value) => {
    const newCaseLines = [...caseLines];
    newCaseLines[index] = { ...newCaseLines[index], [field]: value };
    setCaseLines(newCaseLines);
  };

  const handleSelectComponent = (component) => {
    if (activeLineIndex !== null) {
      handleCaseLineChange(
        activeLineIndex,
        "componentId",
        component.typeComponentId
      );
      handleCaseLineChange(
        activeLineIndex,
        "warrantyStatus",
        component.isUnderWarranty ? "ELIGIBLE" : "INELIGIBLE"
      );
      setShowComponentSearch(false);
      setActiveLineIndex(null);
    }
  };

  const handleOpenComponentSearch = (index) => {
    setActiveLineIndex(index);
    setShowComponentSearch(true);
  };

  const handleSubmit = async () => {
    const hasInvalidLines = caseLines.some(
      (line) =>
        !line.diagnosisText.trim() ||
        !line.correctionText.trim() ||
        (line.componentId && line.quantity < 1)
    );
    if (hasInvalidLines) {
      Alert.alert(
        "Invalid Input",
        "Please fill diagnosis, correction, and quantity (if component added)."
      );
      return;
    }

    setIsSaving(true);
    try {
      await technicianService.createCaseLines(caseId, { caselines: caseLines });
      const linesWithComponents = caseLines.filter(
        (line) => line.componentId && line.quantity > 0
      );
      if (linesWithComponents.length > 0) {
        const stockData = linesWithComponents.map((line, index) => ({
          id: `temp-${index}`,
          componentId: line.componentId,
          quantity: line.quantity,
        }));
        await technicianService.updateStockQuantities(caseId, stockData);
      }
      Alert.alert("Success", "Case lines saved successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving case lines:", error);
      Alert.alert("Error", "Failed to save case lines");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Case Details</Text>
            <Text style={styles.modalSubtitle}>VIN: {vin}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalBody}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {showComponentSearch ? (
            <ComponentSearch
              {...{
                searchCategory,
                setSearchCategory,
                searchQuery,
                setSearchQuery,
                searchComponents,
                isSearching,
                components,
                handleSelectComponent,
                setShowComponentSearch,
              }}
            />
          ) : (
            <>
              <View style={styles.addLineButtonContainer}>
                <Text style={styles.sectionTitle}>
                  Diagnosis & Repair Actions
                </Text>
                <TouchableOpacity
                  style={styles.addLineButton}
                  onPress={handleAddCaseLine}
                >
                  <Plus size={16} color="#2563EB" />
                  <Text style={styles.addLineButtonText}>Add Line</Text>
                </TouchableOpacity>
              </View>
              {caseLines.map((line, index) => (
                <CaseLine
                  key={index}
                  {...{
                    caseLine: line,
                    index,
                    handleCaseLineChange,
                    handleRemoveCaseLine,
                    handleOpenComponentSearch,
                    canRemove: caseLines.length > 1,
                  }}
                />
              ))}
            </>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.saveButton]}
            onPress={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Save size={16} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Case Lines</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ... (Styles)
const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#F9FAFB" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  modalSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  modalBody: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  caseLineContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  caseLineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  caseLineTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  componentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  componentButtonText: {
    flex: 1,
    color: "#FFF",
    fontWeight: "500",
    marginRight: 8,
  },
  warrantyStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
  },
  addLineButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addLineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addLineButtonText: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
  searchContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  searchTitle: { fontSize: 16, fontWeight: "600" },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginBottom: 12,
  },
  picker: { width: "100%", height: 44 },
  searchButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  searchButtonText: { color: "#FFF", fontWeight: "600" },
  componentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  componentName: { fontSize: 14, fontWeight: "500" },
  componentId: { fontSize: 12, color: "#6B7280" },
  emptyText: { textAlign: "center", color: "#6B7280", padding: 16 },
  modalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: { backgroundColor: "#E5E7EB" },
  cancelButtonText: { color: "#374151", fontWeight: "600" },
  saveButton: { backgroundColor: "#3B82F6" },
  saveButtonText: { color: "#FFF", fontWeight: "600" },
});

