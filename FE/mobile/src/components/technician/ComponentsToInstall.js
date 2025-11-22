import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert, 
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { componentReservationService, caseLineService } from "../../services/technician";
import ComponentInstallModal from "./ComponentInstallModal"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ComponentsToInstall() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedForBulkInstall, setSelectedForBulkInstall] = useState(new Set());
  const [isBulkInstalling, setIsBulkInstalling] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadComponentsToInstall = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        limit: 50,
        repairTechId: userId, 
      });
      const caseLines = response.data.caseLines || [];
      const componentsReady = caseLines.filter((cl) => {
        if (cl.reservations && cl.reservations.length > 0) {
          return cl.reservations.some((res) => res.status === "PICKED_UP");
        }
        return (cl.quantityReserved || 0) > 0;
      });
      setComponents(componentsReady);
    } catch (error) {
      console.error("Failed to load components to install:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedForBulkInstall(new Set());
      setIsBulkInstalling(false);
      loadComponentsToInstall();
    }, [])
  );

  const handleDirectInstall = (component) => {
    const reservation = component.reservations?.find(
      (res) => res.status === "PICKED_UP"
    );
    if (!reservation || !reservation.reservationId) {
      Alert.alert("Lỗi", "Không tìm thấy dữ liệu linh kiện.");
      return;
    }

    Alert.alert(
      "Xác nhận lắp đặt",
      `Bạn có chắc chắn muốn lắp đặt "${component.typeComponent?.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Lắp đặt ngay",
          onPress: async () => {
            setProcessingId(component.id || component.caseLineId);
            try {
              await componentReservationService.installComponent(reservation.reservationId);
              Alert.alert("Thành công", "Linh kiện đã được lắp đặt.");
              loadComponentsToInstall();
            } catch (err) {
              console.error("Lỗi lắp đặt:", err);
              Alert.alert("Lỗi", "Không thể lắp đặt linh kiện.");
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (component) => {
    const reservation = component.reservations?.find(
      (res) => res.status === "PICKED_UP"
    );
    setSelectedComponent({
      reservationId: reservation?.reservationId,
      componentName: component.typeComponent?.name || "Component",
      vehicleVin: component.guaranteeCase?.vehicleProcessingRecord?.vin || "",
      componentSerial: reservation?.component?.serialNumber || "",
      quantity: component.quantity || 1,
      caseId: component.guaranteeCaseId,
      status: component.status,
      diagnosis: component.diagnosisText,
      correction: component.correctionText,
      warehouseName: reservation?.warehouse?.name,
    });
  };

  const handleInstallSuccess = () => {
    setSelectedComponent(null);
    loadComponentsToInstall();
    Alert.alert("Thành công", "Linh kiện đã được lắp đặt.");
  };

  const allReservationIds = useMemo(() => 
    components.map(c => 
      c.reservations?.find(r => r.status === "PICKED_UP")?.reservationId
    ).filter(Boolean), 
  [components]);

  const toggleSelection = (reservationId) => {
    if (!reservationId) return;
    setSelectedForBulkInstall(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(reservationId)) {
        newSelected.delete(reservationId);
      } else {
        newSelected.add(reservationId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedForBulkInstall.size === allReservationIds.length) {
      setSelectedForBulkInstall(new Set());
    } else {
      setSelectedForBulkInstall(new Set(allReservationIds));
    }
  };

  const handleBulkInstall = async () => {
    if (selectedForBulkInstall.size === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một linh kiện.");
      return;
    }

    setIsBulkInstalling(true);
    let successCount = 0;
    
    const itemsToInstall = Array.from(selectedForBulkInstall);

    for (const reservationId of itemsToInstall) {
      try {
        await componentReservationService.installComponent(reservationId);
        successCount++;
      } catch (err) {
        console.error(`Failed to install ${reservationId}:`, err);
      }
    }

    Alert.alert("Hoàn tất", `Đã xử lý ${successCount} linh kiện.`);
    
    setSelectedForBulkInstall(new Set());
    setIsBulkInstalling(false);
    loadComponentsToInstall(); 
  };

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centeredView}>
          <ActivityIndicator size="small" color="#9333EA" />
          <Text style={styles.loadingText}>Đang tải linh kiện...</Text>
        </View>
      );
    }

    if (components.length === 0) {
      return (
        <View style={styles.centeredView}>
          <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
          <Text style={styles.emptyText}>Không có linh kiện chờ lắp đặt</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.listContainer} nestedScrollEnabled={true}>
        {components.map((component) => {
          const caseLineId = component.id || component.caseLineId;
          const reservation = component.reservations?.find(
            (res) => res.status === "PICKED_UP"
          );
          const reservationId = reservation?.reservationId || "";
          const isSelected = selectedForBulkInstall.has(reservationId);
          const pickedUpCount = component.quantity || 1;
          const serialNumber = reservation?.component?.serialNumber;
          const isProcessing = processingId === caseLineId;

          return (
            <View 
              key={caseLineId} 
              style={[styles.itemCard, isSelected && styles.itemCardSelected]}
            >
              <View style={styles.itemRow}>
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => toggleSelection(reservationId)}
                >
                  <Ionicons 
                    name={isSelected ? "checkbox" : "square-outline"}
                    size={24} 
                    color={isSelected ? "#9333EA" : "#9CA3AF"}
                  />
                </TouchableOpacity>

                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Ionicons name="construct-outline" size={18} color="#9333EA" style={{marginRight: 6}} />
                    <Text style={styles.itemName}>
                      {component.typeComponent?.name || "Component"}
                    </Text>
                  </View>

                  <View style={styles.itemMeta}>
                    <Text style={styles.metaText} numberOfLines={1}>
                      <Text style={styles.metaLabel}>Chẩn đoán:</Text> {component.diagnosisText || "N/A"}
                    </Text>
                    <Text style={styles.metaText}>
                      <Text style={styles.metaLabel}>Số lượng:</Text> {pickedUpCount}
                    </Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      <Text style={styles.metaLabel}>Case:</Text> {component.guaranteeCaseId}
                    </Text>
                    {serialNumber && (
                      <Text style={styles.serialText} numberOfLines={1}>
                         ✓ Sẵn sàng lắp: {serialNumber}
                      </Text>
                    )}
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={styles.viewDetailsButton}
                      onPress={() => handleViewDetails(component)}
                    >
                      <Ionicons name="eye-outline" size={16} color="#374151" />
                      <Text style={styles.viewDetailsText}>Chi tiết</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDirectInstall(component)}
                      disabled={isProcessing}
                      style={[styles.installButton, isProcessing && styles.disabledButton]}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="construct" size={16} color="#FFFFFF" style={{marginRight: 4}} /> 
                          <Text style={styles.installButtonText}>Lắp đặt</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }, [loading, components, selectedForBulkInstall, processingId]); 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconWrapper}>
          <Ionicons name="cube" size={20} color="#9333EA" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Chờ lắp đặt</Text>
          <Text style={styles.subtitle}>Linh kiện đã lấy từ kho</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{components.length}</Text>
        </View>
      </View>

      {components.length > 0 && (
        <View style={styles.bulkActionContainer}>
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={toggleSelectAll}
          >
            <Ionicons 
              name={selectedForBulkInstall.size === allReservationIds.length && allReservationIds.length > 0 ? "checkbox" : "square-outline"}
              size={20} 
              color="#4B5563"
            />
            <Text style={styles.selectAllText}>
              Chọn tất cả ({selectedForBulkInstall.size})
            </Text>
          </TouchableOpacity>

          {selectedForBulkInstall.size > 0 && (
            <TouchableOpacity
              style={[styles.bulkInstallButton, isBulkInstalling && styles.disabledButton]}
              onPress={handleBulkInstall}
              disabled={isBulkInstalling}
            >
              {isBulkInstalling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="construct" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.bulkInstallButtonText}>
                 Lắp đặt hàng loạt
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {renderContent}

      {selectedComponent && (
        <ComponentInstallModal
          isOpen={true}
          onClose={() => setSelectedComponent(null)}
          onSuccess={handleInstallSuccess}
          reservationId={selectedComponent.reservationId}
          componentName={selectedComponent.componentName}
          vehicleVin={selectedComponent.vehicleVin}
          componentSerial={selectedComponent.componentSerial} 
          quantity={selectedComponent.quantity}
          caseId={selectedComponent.caseId}
          status={selectedComponent.status}
          diagnosis={selectedComponent.diagnosis}
          correction={selectedComponent.correction}
          warehouseName={selectedComponent.warehouseName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: "#F3E8FF", 
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16, 
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13, 
    color: "#6B7280",
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3E8FF", 
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#9333EA", 
    fontWeight: "600",
    fontSize: 14,
  },
  centeredView: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  listContainer: {
    maxHeight: 400,
  },
  itemCard: {
    backgroundColor: "#FFFFFF", 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12, 
    marginBottom: 12,
  },
  itemCardSelected: {
    backgroundColor: "#F3E8FF", 
    borderColor: "#9333EA",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start", 
    gap: 12,
  },
  checkbox: {
    paddingTop: 2, 
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 15, 
    fontWeight: "600", 
    color: "#111827",
    flex: 1,
  },
  itemMeta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13, 
    color: "#4B5563",
    marginBottom: 1,
  },
  metaLabel: { 
    fontWeight: "500",
  },
  serialText: {
    fontSize: 13,
    color: "#16A34A", 
    fontWeight: "500",
    marginTop: 2,
  },
  
  // --- ACTION ROW STYLES ---
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  installButton: {
    flexDirection: "row",
    backgroundColor: "#9333EA", 
    paddingVertical: 8,
    paddingHorizontal: 16, // Nút chính nên to hơn chút
    borderRadius: 8,
    alignItems: "center",
  },
  installButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#D8B4FE",
  },
  // -------------------------

  bulkActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 12,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  bulkInstallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9333EA", 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  bulkInstallButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});