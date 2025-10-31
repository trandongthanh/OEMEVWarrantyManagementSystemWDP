import React, { useState, useEffect, useCallback } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

// --- Danh mục component ---
const COMPONENT_CATEGORIES = [
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

// --- Component con: CaseLine ---
const CaseLine = React.memo(({
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
        <TouchableOpacity onPress={() => handleRemoveCaseLine(index)} hitSlop={10}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>

    {/* SỬA: Tách icon và text ra khỏi nhau */}
    <View style={styles.labelContainer}>
      <FileText size={14} color="#4B5563" />
      <Text style={styles.labelText}> Diagnosis *</Text>
    </View>
    <TextInput
      style={[styles.textInput, styles.textArea]}
      value={caseLine.diagnosisText}
      onChangeText={(val) => handleCaseLineChange(index, "diagnosisText", val)}
      placeholder="Describe problem..."
      multiline
      placeholderTextColor="#9CA3AF"
    />

    {/* SỬA: Tách icon và text ra khỏi nhau */}
    <View style={styles.labelContainer}>
      <Wrench size={14} color="#4B5563" />
      <Text style={styles.labelText}> Correction *</Text>
    </View>
    <TextInput
      style={[styles.textInput, styles.textArea]}
      value={caseLine.correctionText}
      onChangeText={(val) => handleCaseLineChange(index, "correctionText", val)}
      placeholder="Describe repair..."
      multiline
      placeholderTextColor="#9CA3AF"
    />

    <View style={styles.row}>
      <View style={{ flex: 3 }}>
        {/* SỬA: Tách icon và text ra khỏi nhau */}
        <View style={styles.labelContainer}>
          <Package size={14} color="#4B5563" />
          <Text style={styles.labelText}> Component</Text>
        </View>
        <TouchableOpacity
          style={styles.componentSearchButton}
          onPress={() => handleOpenComponentSearch(index)}
        >
          <Text style={styles.componentSearchButtonText} numberOfLines={1}>
            {caseLine.componentId || "Search..."}
          </Text>
          <Search size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.labelText}>Qty</Text>
        <TextInput
          style={styles.textInput}
          value={String(caseLine.quantity)}
          onChangeText={(val) => handleCaseLineChange(index, "quantity", parseInt(val.replace(/[^0-9]/g, '')) || 0)}
          keyboardType="numeric"
        />
      </View>
    </View>

    <Text style={styles.labelText}>Warranty Status</Text>
    <View style={styles.warrantyStatusContainer}>
      {caseLine.warrantyStatus === "ELIGIBLE" ? (
        <View style={styles.warrantyStatusContent}>
          <CheckCircle size={16} color="#16A34A" />
          <Text style={styles.warrantyEligibleText}>Eligible</Text>
        </View>
      ) : (
        <View style={styles.warrantyStatusContent}>
          <AlertCircle size={16} color="#DC2626" />
          <Text style={styles.warrantyIneligibleText}>Ineligible</Text>
        </View>
      )}
    </View>
  </View>
));

// --- Component con: ComponentSearch ---
const ComponentSearch = React.memo(({
  searchCategory,
  setSearchCategory,
  searchQuery,
  setSearchQuery,
  searchComponents,
  isSearching,
  components,
  handleSelectComponent,
  onClose,
}) => {

   const renderComponentItem = useCallback(({ item }) => (
      <TouchableOpacity
          style={styles.componentItem}
          onPress={() => handleSelectComponent(item)}
      >
          <View style={styles.componentItemInfo}>
              <Text style={styles.componentName} numberOfLines={1}>{item.name ?? 'N/A'}</Text>
              <Text style={styles.componentId}>{item.typeComponentId ?? 'N/A'}</Text>
          </View>
          {item.isUnderWarranty ? (
              <Shield size={20} color="#16A34A" />
          ) : (
              <ShieldOff size={20} color="#9CA3AF" />
          )}
      </TouchableOpacity>
   ), [handleSelectComponent]);

   return (
      <View style={styles.searchModalContent}>
          <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Search Components</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <X size={24} color="#6B7280" />
              </TouchableOpacity>
          </View>
          <View style={styles.pickerWrapperModal}>
              <Picker
                  selectedValue={searchCategory}
                  onValueChange={setSearchCategory}
                  style={styles.pickerStyle}
                  dropdownIconColor="#6B7280"
              >
                  {COMPONENT_CATEGORIES.map((cat) => (
                      <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                  ))}
              </Picker>
          </View>
          <TextInput
              style={[styles.textInput, { marginBottom: 12 }]}
              placeholder="Search by name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
              style={[styles.actionButton, styles.searchActionButton]}
              onPress={searchComponents}
              disabled={isSearching}
          >
              {isSearching ? <ActivityIndicator color="#FFF" /> : <Search size={16} color="#FFF" />}
              <Text style={styles.actionButtonText}>
                  {isSearching ? "Searching..." : "Search"}
              </Text>
          </TouchableOpacity>
          <FlatList
              style={styles.componentList}
              data={components}
              keyExtractor={(item) => item.typeComponentId}
              renderItem={renderComponentItem}
              ListEmptyComponent={
                  !isSearching ? (
                      <Text style={styles.noResultsText}>No components found</Text>
                  ) : null
              }
              keyboardShouldPersistTaps="handled"
          />
      </View>
   );
});

// --- Component Modal chính ---
export default function CaseDetailsModal({
  isOpen,
  onClose,
  vin,
  recordId,
  caseId,
  onSuccess,
}) {
  const [caseLines, setCaseLines] = useState([
    { diagnosisText: "", correctionText: "", componentId: null, quantity: 0, warrantyStatus: "ELIGIBLE" },
  ]);
  const [searchCategory, setSearchCategory] = useState("HIGH_VOLTAGE_BATTERY");
  const [searchQuery, setSearchQuery] = useState("");
  const [components, setComponents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComponentSearch, setShowComponentSearch] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(null);

  // --- Reset state khi modal đóng/mở ---
   useEffect(() => {
    if (isOpen) {
      setCaseLines([{ diagnosisText: "", correctionText: "", componentId: null, quantity: 0, warrantyStatus: "ELIGIBLE" }]);
      setShowComponentSearch(false);
      setIsSaving(false);
      setSearchQuery("");
      setComponents([]);
    }
  }, [isOpen]);

  // --- Hàm tìm kiếm component ---
  const searchComponents = useCallback(async () => {
    if (!recordId) {
      Alert.alert("Error", "No processing record ID available.");
      return;
    }
    if (isSearching) return;
    setIsSearching(true);
    try {
      const response = await technicianService.searchCompatibleComponents(
        recordId, searchCategory, searchQuery || undefined
      );
      setComponents(response.data?.result || []);
    } catch (error) {
      console.error("Error searching components:", error);
      Alert.alert("Error", "Failed to search components.");
      setComponents([]);
    } finally {
      setIsSearching(false);
    }
  }, [recordId, searchCategory, searchQuery, isSearching]);

  // --- Tự động tìm kiếm khi category thay đổi ---
  useEffect(() => {
    if (showComponentSearch) {
      searchComponents();
    }
  }, [searchCategory, showComponentSearch]);

  // --- Các hàm xử lý Case Line ---
  const handleAddCaseLine = useCallback(() => {
    setCaseLines(prevLines => [
      ...prevLines,
      { diagnosisText: "", correctionText: "", componentId: null, quantity: 0, warrantyStatus: "ELIGIBLE" },
    ]);
  }, []);

  const handleRemoveCaseLine = useCallback((index) => {
    if (caseLines.length > 1) {
      setCaseLines(prevLines => prevLines.filter((_, i) => i !== index));
    }
  }, [caseLines.length]);

  const handleCaseLineChange = useCallback((index, field, value) => {
    setCaseLines(prevLines => {
      const newLines = [...prevLines];
      newLines[index] = { ...newLines[index], [field]: value };
      return newLines;
    });
  }, []);

  const handleSelectComponent = useCallback((component) => {
    if (activeLineIndex !== null) {
      handleCaseLineChange(activeLineIndex, "componentId", component.typeComponentId);
      handleCaseLineChange(activeLineIndex, "warrantyStatus", component.isUnderWarranty ? "ELIGIBLE" : "INELIGIBLE");
      setShowComponentSearch(false);
      setActiveLineIndex(null);
      setSearchQuery("");
      setComponents([]);
    }
  }, [activeLineIndex, handleCaseLineChange]);

  const handleOpenComponentSearch = useCallback((index) => {
    setActiveLineIndex(index);
    setSearchQuery("");
    setComponents([]);
    setShowComponentSearch(true);
  }, []);

  // --- Hàm Submit ---
  const handleSubmit = useCallback(async () => {
    if (isSaving) return;
    const hasInvalidLines = caseLines.some(
      line => !line.diagnosisText.trim() || !line.correctionText.trim() || (line.componentId && line.quantity < 1)
    );
    if (hasInvalidLines) {
      Alert.alert("Invalid Input", "Fill Diagnosis, Correction. Quantity > 0 if component added.");
      return;
    }

    setIsSaving(true);
    try {
      await technicianService.createCaseLines(caseId, { caselines: caseLines });
      const linesWithComponents = caseLines.filter(line => line.componentId && line.quantity > 0);
      if (linesWithComponents.length > 0) {
        const stockData = linesWithComponents.map((line, index) => ({
          id: `temp-${index}`, componentId: line.componentId, quantity: line.quantity,
        }));
        await technicianService.updateStockQuantities(caseId, stockData);
      }
      Alert.alert("Success", "Case lines saved!");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving case lines:", error);
      Alert.alert("Save Error", error.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [caseLines, caseId, onSuccess, isSaving]);

  // --- Render UI chính của Modal ---
  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
         behavior={Platform.OS === "ios" ? "padding" : "height"}
         style={{ flex: 1 }}
         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <SafeAreaView style={styles.modalSafeAreView}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitleText}>Case Details</Text>
              <Text style={styles.modalSubtitleText}>VIN: {vin}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {showComponentSearch ? (
              <ComponentSearch
                  searchCategory={searchCategory}
                  setSearchCategory={setSearchCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchComponents={searchComponents}
                  isSearching={isSearching}
                  components={components}
                  handleSelectComponent={handleSelectComponent}
                  onClose={() => setShowComponentSearch(false)}
              />
            ) : (
               <FlatList
                  data={caseLines}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => (
                     <CaseLine
                        caseLine={item}
                        index={index}
                        handleCaseLineChange={handleCaseLineChange}
                        handleRemoveCaseLine={handleRemoveCaseLine}
                        handleOpenComponentSearch={handleOpenComponentSearch}
                        canRemove={caseLines.length > 1}
                     />
                  )}
                  ListHeaderComponent={
                     <View style={styles.addLineHeader}>
                        <Text style={styles.sectionTitleText}>Diagnosis & Repair</Text>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddCaseLine}>
                           <Plus size={16} color="#2563EB" />
                           <Text style={styles.addButtonText}>Add Line</Text>
                        </TouchableOpacity>
                     </View>
                  }
                  contentContainerStyle={styles.caseListContent}
                  keyboardShouldPersistTaps="handled"
               />
            )}
          </View>

          {!showComponentSearch && (
             <View style={styles.modalFooter}>
               <TouchableOpacity
                  style={[styles.footerButton, styles.cancelFooterButton]}
                  onPress={onClose}
                  disabled={isSaving}
               >
                  <Text style={styles.cancelFooterButtonText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity
                  style={[styles.footerButton, styles.saveFooterButton]}
                  onPress={handleSubmit}
                  disabled={isSaving}
               >
                  {isSaving ? (
                     <ActivityIndicator color="#FFF" />
                  ) : (
                     <>
                        <Save size={16} color="#FFF" />
                        <Text style={styles.saveFooterButtonText}>Save Lines</Text>
                     </>
                  )}
               </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  modalSafeAreView: { flex: 1, backgroundColor: "#F9FAFB" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  modalTitleText: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  modalSubtitleText: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  modalBody: { flex: 1 },
  sectionTitleText: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  caseLineContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  caseLineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  caseLineTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  // THÊM: Style cho container chứa icon và label
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
    minHeight: 44,
    paddingVertical: 10,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  componentSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  componentSearchButtonText: {
    flex: 1, color: "#FFF", fontWeight: "500", marginRight: 8, fontSize: 13,
  },
  warrantyStatusContainer: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  // THÊM: Style cho content bên trong warranty status
  warrantyStatusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  warrantyEligibleText: { color: "#16A34A", fontWeight: "600", fontSize: 13 },
  warrantyIneligibleText: { color: "#DC2626", fontWeight: "600", fontSize: 13 },
  addLineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
  caseListContent: { paddingBottom: 20 },
  searchModalContent: { padding: 16, flex: 1 },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  searchTitle: { fontSize: 18, fontWeight: "600" },
  pickerWrapperModal: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginBottom: 12,
  },
  pickerStyle: { width: "100%", height: 44, color: "#111827" },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchActionButton: {
     backgroundColor: "#3B82F6",
     marginBottom: 16,
  },
  actionButtonText: { color: "#FFF", fontWeight: "600" },
  componentList: { flex: 1, marginTop: 8 },
  componentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
   componentItemInfo: { flex: 1, marginRight: 8 },
  componentName: { fontSize: 14, fontWeight: "500", color: '#1F2937'},
  componentId: { fontSize: 12, color: "#6B7280" },
  noResultsText: { textAlign: "center", color: "#6B7280", padding: 20 },
  modalFooter: {
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
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelFooterButton: { backgroundColor: "#E5E7EB" },
  cancelFooterButtonText: { color: "#374151", fontWeight: "600" },
  saveFooterButton: { backgroundColor: "#3B82F6" },
  saveFooterButtonText: { color: "#FFF", fontWeight: "600" },
});