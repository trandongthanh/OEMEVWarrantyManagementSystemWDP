import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibrary } from "react-native-image-picker"; //
import { Picker } from "@react-native-picker/picker";

import {
  technicianService,
  caseLineService,
  imageUploadService,
} from "../../services/technician";
import CompleteDiagnosisButton from "../../components/technician/CompleteDiagnosisButton"; //

const COMPONENT_CATEGORIES = [
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

const CaseLineForm = ({
  caseLine,
  index,
  onCaseLineChange,
  onRemoveCaseLine,
  onOpenComponentSearch,
  onImageSelect,
  isReadOnly,
  caseLinesLength,
  diagnosisImages,
  onRemoveImage,
}) => {
  const handleWarrantyChange = (value) => {
    onCaseLineChange(index, "warrantyStatus", value);
    if (value === "ELIGIBLE") {
      onCaseLineChange(index, "rejectionReason", "");
    }
  };

  const handleImagePicker = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.7, selectionLimit: 5 }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else {
        onImageSelect(index, response.assets || []);
      }
    });
  };

  return (
    <View style={styles.caseLineCard}>
      <View style={styles.caseLineHeader}>
        <Text style={styles.caseLineTitle}>Hạng mục {index + 1}</Text>
        {caseLinesLength > 1 && !isReadOnly && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveCaseLine(index)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Chẩn đoán *</Text>
      <TextInput
        style={[styles.input, styles.textArea, isReadOnly && styles.inputDisabled]}
        value={caseLine.diagnosisText}
        onChangeText={(val) => onCaseLineChange(index, "diagnosisText", val)}
        placeholder="Mô tả vấn đề..."
        multiline
        editable={!isReadOnly} 
      />

      <Text style={styles.label}>Cách khắc phục *</Text>
      <TextInput
        style={[styles.input, styles.textArea, isReadOnly && styles.inputDisabled]}
        value={caseLine.correctionText}
        onChangeText={(val) => onCaseLineChange(index, "correctionText", val)}
        placeholder="Mô tả hành động sửa chữa..."
        multiline
        editable={!isReadOnly} 
      />

      <Text style={styles.label}>Linh kiện *</Text>
      <View style={styles.componentSearchRow}>
        <TextInput
          style={[styles.input, styles.inputDisabled, { flex: 1 }]}
          value={caseLine.componentName || ""}
          placeholder="Chưa chọn linh kiện"
          editable={false}
        />
        {!isReadOnly && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => onOpenComponentSearch(index)}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Số lượng *</Text>
      <TextInput
        style={[styles.input, isReadOnly && styles.inputDisabled]}
        value={String(caseLine.quantity)}
        onChangeText={(val) =>
          onCaseLineChange(index, "quantity", parseInt(val) || 0)
        }
        keyboardType="number-pad"
        editable={!isReadOnly} //
      />

      <Text style={styles.label}>Trạng thái bảo hành</Text>
      <View style={styles.warrantyBox(caseLine.isUnderWarranty)}>
        <Ionicons
          name={
            caseLine.isUnderWarranty ? "shield-checkmark" : "shield-outline"
          }
          size={18}
          color={caseLine.isUnderWarranty ? "#16A34A" : "#EF4444"}
        />
        <Text style={styles.warrantyBoxText(caseLine.isUnderWarranty)}>
          {caseLine.isUnderWarranty
            ? "Linh kiện còn bảo hành"
            : "Linh kiện không bảo hành"}
        </Text>
      </View>

      {caseLine.isUnderWarranty && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={caseLine.warrantyStatus}
            onValueChange={handleWarrantyChange}
            enabled={!isReadOnly} //
            style={styles.picker}
          >
            <Picker.Item label="Đủ điều kiện" value="ELIGIBLE" />
            <Picker.Item label="Không đủ điều kiện" value="INELIGIBLE" />
          </Picker>
        </View>
      )}

      {caseLine.warrantyStatus === "INELIGIBLE" && (
        <>
          <Text style={styles.label}>Lý do từ chối *</Text>
          <TextInput
            style={[styles.input, styles.textArea, isReadOnly && styles.inputDisabled]}
            value={caseLine.rejectionReason}
            onChangeText={(val) =>
              onCaseLineChange(index, "rejectionReason", val)
            }
            placeholder="Giải thích lý do từ chối bảo hành..."
            multiline
            editable={!isReadOnly} //
          />
        </>
      )}

      <Text style={styles.label}>Hình ảnh bằng chứng</Text>
      <View style={styles.imageGrid}>
        {caseLine.evidenceImageUrls?.map((url, idx) => (
          <Image key={`exist-${idx}`} source={{ uri: url }} style={styles.imagePreview} />
        ))}
        {diagnosisImages?.map((img, idx) => (
          <View key={`new-${idx}`} style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: img.uri }}
              style={styles.imagePreview}
            />
            {!isReadOnly && (
              <TouchableOpacity style={styles.removeImageButton} onPress={() => onRemoveImage(index, idx)}>
                <Ionicons name="close-circle" size={24} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      {!isReadOnly && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImagePicker}
        >
          <Ionicons name="camera-outline" size={20} color="#374151" />
          <Text style={styles.uploadButtonText}>Tải ảnh lên</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ComponentSearch = ({
  onClose,
  onSelectComponent,
  recordId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allComponents, setAllComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAllComponents = async () => {
      if (!recordId) {
        setError("Missing Record ID.");
        return;
      }
      setIsSearching(true);
      setError("");
      try {
        const categoryPromises = COMPONENT_CATEGORIES.map((category) =>
          technicianService
            .searchCompatibleComponents(recordId, category.value, undefined)
            .then((response) => response.data?.result || [])
        );
        const results = await Promise.all(categoryPromises);
        const combinedComponents = results.flat();
        
        const allComponentsMap = new Map();
        combinedComponents.forEach((comp) => {
          if (!allComponentsMap.has(comp.typeComponentId)) {
            allComponentsMap.set(comp.typeComponentId, comp);
          }
        });
        
        const uniqueComponents = Array.from(allComponentsMap.values());
        setAllComponents(uniqueComponents);
        setFilteredComponents(uniqueComponents);
      } catch (err) {
        console.error("Error loading components:", err);
        setError("Failed to load components.");
      } finally {
        setIsSearching(false);
      }
    };
    loadAllComponents();
  }, [recordId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = allComponents.filter((comp) =>
        comp.name.toLowerCase().includes(query)
      );
      setFilteredComponents(filtered);
    } else {
      setFilteredComponents(allComponents);
    }
  }, [searchQuery, allComponents]);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchHeader}>
        <Text style={styles.searchTitle}>Tìm linh kiện</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={true}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isSearching ? (
        <ActivityIndicator size="large" color="#1D4ED8" style={{marginTop: 24}} />
      ) : (
        <ScrollView style={styles.componentList}>
          {filteredComponents.length > 0 ? (
            filteredComponents.map((component) => (
              <TouchableOpacity
                key={component.typeComponentId}
                style={styles.componentItem}
                onPress={() => onSelectComponent(component)}
              >
                <Text style={styles.componentName}>{component.name}</Text>
                <Ionicons
                  name={
                    component.isUnderWarranty
                      ? "shield-checkmark"
                      : "shield-outline"
                  }
                  size={20}
                  color={component.isUnderWarranty ? "#16A34A" : "#EF4444"}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Không tìm thấy linh kiện.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default function CaseDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const params = route.params?.params || route.params;
  const { vin, recordId, caseId } = params;

  const [caseLines, setCaseLines] = useState([
    {
      diagnosisText: "",
      correctionText: "",
      typeComponentId: null,
      componentName: "",
      quantity: 1,
      warrantyStatus: "ELIGIBLE",
      isUnderWarranty: true,
      newImages: [],
      evidenceImageUrls: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showComponentSearch, setShowComponentSearch] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [showCompleteDiagnosis, setShowCompleteDiagnosis] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false); 
  const [diagnosisImages, setDiagnosisImages] = useState(new Map());

  useEffect(() => {
    const loadCaseData = async () => {
      if (!caseId || !recordId) {
        setErrorMessage("Case ID hoặc Record ID không hợp lệ.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const recordResponse = await technicianService.getRecordDetails(recordId);
        const fullRecord = recordResponse.data?.record;
        const guaranteeCase = fullRecord?.guaranteeCases?.find(
          (gc) => gc.guaranteeCaseId === caseId
        );

        if (guaranteeCase && guaranteeCase.caseLines?.length > 0) {
          const validCaseLines = guaranteeCase.caseLines.filter(cl => cl.id);
          
          const detailedCaseLines = await Promise.all(
            validCaseLines.map(async (cl) => {
              const detailResponse = await caseLineService.getCaseLineById(
                cl.id
              );
              const d = detailResponse.data.caseLine;
              return {
                caseLineId: d.id,
                diagnosisText: d.diagnosisText || "",
                correctionText: d.correctionText || "",
                typeComponentId: d.typeComponentId || null,
                componentName: d.typeComponent?.name || "",
                quantity: d.quantity || 1,
                warrantyStatus: d.warrantyStatus || "ELIGIBLE",
                isUnderWarranty: (d.warrantyStatus || "ELIGIBLE") === "ELIGIBLE",
                rejectionReason: d.rejectionReason || "",
                status: d.status || "DRAFT",
                evidenceImageUrls: d.evidenceImageUrls || [],
                newImages: [],
              };
            })
          );
          
          setCaseLines(detailedCaseLines);
          const allDraft = detailedCaseLines.every((cl) => cl.status === "DRAFT");
          setIsReadOnly(!allDraft);
          if (allDraft) {
            setShowCompleteDiagnosis(true);
          }
        } else {
          setShowCompleteDiagnosis(false);
          setIsReadOnly(false); 
          setCaseLines([ 
            {
              diagnosisText: "",
              correctionText: "",
              typeComponentId: null,
              componentName: "",
              quantity: 1,
              warrantyStatus: "ELIGIBLE",
              isUnderWarranty: true,
              newImages: [],
              evidenceImageUrls: [],
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading case line data:", error);
        setErrorMessage("Không thể tải dữ liệu hạng mục.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCaseData();
  }, [recordId, caseId]);

  const handleCaseLineChange = (index, field, value) => {
    const newCaseLines = [...caseLines];
    newCaseLines[index] = { ...newCaseLines[index], [field]: value };
    setCaseLines(newCaseLines);
  };

  const handleAddCaseLine = () => {
    setCaseLines([
      ...caseLines,
      {
        diagnosisText: "",
        correctionText: "",
        typeComponentId: null,
        componentName: "",
        quantity: 1,
        warrantyStatus: "ELIGIBLE",
        isUnderWarranty: true,
        newImages: [],
        evidenceImageUrls: [],
      },
    ]);
  };

  const handleRemoveCaseLine = (index) => {
    const newCaseLines = caseLines.filter((_, i) => i !== index);
    setCaseLines(newCaseLines);
    setDiagnosisImages(prev => {
      const updated = new Map(prev);
      updated.delete(index);
      return updated;
    });
  };

  const handleImageSelect = (index, assets) => {
    const newImages = assets.map((a) => ({
      uri: a.uri,
      type: a.type,
      fileName: a.fileName,
    }));
    setDiagnosisImages(prev => {
      const updated = new Map(prev);
      const existing = updated.get(index) || [];
      updated.set(index, [...existing, ...newImages]);
      return updated;
    });
  };

  const handleRemoveImage = (lineIndex, imgIndex) => {
    setDiagnosisImages(prev => {
      const updated = new Map(prev);
      const images = updated.get(lineIndex) || [];
      images.splice(imgIndex, 1);
      updated.set(lineIndex, images);
      return updated;
    });
  };

  const handleOpenComponentSearch = (index) => {
    setActiveLineIndex(index);
    setShowComponentSearch(true);
  };

  const handleSelectComponent = (component) => {
    if (activeLineIndex !== null) {
      const newCaseLines = [...caseLines];
      const isUnderWarranty = component.isUnderWarranty ?? false; //
      newCaseLines[activeLineIndex] = {
        ...newCaseLines[activeLineIndex],
        typeComponentId: component.typeComponentId,
        componentName: component.name,
        isUnderWarranty: isUnderWarranty,
        warrantyStatus: !isUnderWarranty ? "INELIGIBLE" : "ELIGIBLE",
      };
      setCaseLines(newCaseLines);
      setShowComponentSearch(false);
      setActiveLineIndex(null);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    const hasInvalidLines = caseLines.some(
      (line) =>
        !line.diagnosisText.trim() ||
        !line.correctionText.trim() ||
        !line.typeComponentId ||
        line.quantity <= 0 ||
        (line.warrantyStatus === "INELIGIBLE" && !line.rejectionReason?.trim())
    );

    if (hasInvalidLines) {
      setErrorMessage("Vui lòng điền tất cả các trường bắt buộc (*).");
      return;
    }

    setIsSaving(true);
    try {
      const uploadedImageUrls = new Map();
      for (const [lineIndex, images] of diagnosisImages.entries()) {
        if (images.length > 0) {
          const urls = [];
          for (const img of images) {
            const url = await imageUploadService.uploadImage(img);
            urls.push(url);
          }
          uploadedImageUrls.set(lineIndex, urls);
        }
      }

      const hasExistingCaseLines = caseLines.some((line) => line.caseLineId);

      if (hasExistingCaseLines) {
        const updatePromises = caseLines
          .filter((line) => line.caseLineId)
          .map((line, index) => {
            const existingUrls = line.evidenceImageUrls || [];
            const newUrls = uploadedImageUrls.get(index) || [];
            const allUrls = [...existingUrls, ...newUrls];

            return caseLineService.updateCaseLine(line.caseLineId, {
              caseId: caseId,
              diagnosisText: line.diagnosisText,
              correctionText: line.correctionText,
              typeComponentId: line.typeComponentId || null,
              quantity: line.quantity,
              warrantyStatus: line.warrantyStatus,
              rejectionReason: line.rejectionReason || null,
              evidenceImageUrls: allUrls.length > 0 ? allUrls : undefined,
            });
          });
        await Promise.all(updatePromises);
      } else {
        const caselinesToSend = caseLines.map((line, index) => ({
          diagnosisText: line.diagnosisText,
          correctionText: line.correctionText,
          typeComponentId: line.typeComponentId || null,
          quantity: line.quantity,
          warrantyStatus: line.warrantyStatus,
          rejectionReason: line.rejectionReason || null,
          evidenceImageUrls: uploadedImageUrls.get(index) || undefined,
        }));

        await technicianService.createCaseLines(caseId, {
          caselines: caselinesToSend,
        });
      }

      Alert.alert(
        "Thành công",
        "Đã lưu chẩn đoán. Bạn có thể hoàn tất chẩn đoán."
      );
      setShowCompleteDiagnosis(true); //
      setDiagnosisImages(new Map());
    } catch (error) {
      console.error("Error saving case lines:", error);
      setErrorMessage(
        error.response?.data?.message || "Không thể lưu chẩn đoán."
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleNavigateToInstall = () => {
    navigation.navigate("DashboardTab");
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  if (showComponentSearch) {
    return (
      <ComponentSearch
        onClose={() => setShowComponentSearch(false)}
        onSelectComponent={handleSelectComponent}
        recordId={recordId}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>
            {isReadOnly ? "Xem chẩn đoán" : "Chẩn đoán sửa chữa"}
          </Text>
          <Text style={styles.headerSubtitle}>VIN: {vin}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {isReadOnly && (
          <View style={styles.infoBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#F59E0B" />
            <Text style={styles.infoText}>
              Chẩn đoán đã được gửi. Chế độ chỉ xem.
            </Text>
          </View>
        )}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {caseLines.map((caseLine, index) => (
          <CaseLineForm
            key={caseLine.caseLineId || index}
            caseLine={caseLine}
            index={index}
            onCaseLineChange={handleCaseLineChange}
            onRemoveCaseLine={handleRemoveCaseLine}
            onOpenComponentSearch={handleOpenComponentSearch}
            onImageSelect={handleImageSelect}
            isReadOnly={isReadOnly}
            caseLinesLength={caseLines.length}
            diagnosisImages={diagnosisImages.get(index) || []}
            onRemoveImage={handleRemoveImage}
          />
        ))}

        {!isReadOnly && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCaseLine}
          >
            <Ionicons name="add" size={20} color="#1D4ED8" />
            <Text style={styles.addButtonText}>Thêm hạng mục</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {!isReadOnly && !showCompleteDiagnosis && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>Lưu chẩn đoán</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCompleteDiagnosis && !isReadOnly && (
        <View style={styles.footer}>
          <CompleteDiagnosisButton
            recordId={recordId}
            onSuccess={() => {
              navigation.goBack();
            }}
            onNavigateToInstall={handleNavigateToInstall}
          />
        </View>
      )}
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4B5563",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 40, // An toàn cho status bar
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#B45309",
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
    marginLeft: 8,
  },
  caseLineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  caseLineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 12,
  },
  caseLineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  removeButton: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6", //
    color: "#6B7280",
  },
  componentSearchRow: {
    flexDirection: "row",
  },
  searchButton: {
    backgroundColor: "#1D4ED8",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: "center",
  },
  warrantyBox: (isUnderWarranty) => ({
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: isUnderWarranty ? "#F0FDF4" : "#FEF2F2",
    borderWidth: 1,
    borderColor: isUnderWarranty ? "#A7F3D0" : "#FECACA",
    marginBottom: 12,
  }),
  warrantyBoxText: (isUnderWarranty) => ({
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: isUnderWarranty ? "#16A34A" : "#EF4444",
  }),
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    margin: 4,
  },
  removeImageButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E7FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#1D4ED8",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingBottom: 24, // An toàn cho status bar
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#1D4ED8",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#60A5FA",
  },
  
  // Component Search Styles
  searchContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: 40, // An toàn cho status bar
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  searchInputContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    paddingHorizontal: 12,
    margin: 16,
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
  componentList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  componentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  componentName: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6B7280",
  },
});