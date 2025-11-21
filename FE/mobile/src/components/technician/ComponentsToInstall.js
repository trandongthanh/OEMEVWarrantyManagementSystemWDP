import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert, 
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

  const loadComponentsToInstall = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy ID kỹ thuật viên. Vui lòng đăng nhập lại.");
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
      Alert.alert("Lỗi", "Không thể tải danh sách chờ lắp đặt.");
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

  const handleInstallClick = (component) => {
    const reservation = component.reservations?.find(
      (res) => res.status === "PICKED_UP"
    );
    if (!reservation || !reservation.reservationId) {
      Alert.alert("Lỗi", "Không tìm thấy linh kiện đã lấy (reservation).");
      return;
    }
    setSelectedComponent({
      reservationId: reservation.reservationId,
      componentName: component.typeComponent?.name || "Component",
      vehicleVin: component.guaranteeCase?.vehicleProcessingRecord?.vin || "",
      componentSerial: reservation.component?.serialNumber || "",
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
    let errorCount = 0;
    
    const itemsToInstall = Array.from(selectedForBulkInstall);

    for (const reservationId of itemsToInstall) {
      try {
        await componentReservationService.installComponent(reservationId);
        successCount++;
      } catch (err) {
        console.error(`Failed to install ${reservationId}:`, err);
        errorCount++;
      }
    }

    if (successCount > 0) {
      Alert.alert("Thành công", `Đã lắp đặt thành công ${successCount} linh kiện.`);
    }
    if (errorCount > 0) {
      Alert.alert("Lỗi", `Lắp đặt thất bại ${errorCount} linh kiện.`);
    }
    
    setSelectedForBulkInstall(new Set());
    setIsBulkInstalling(false);
    loadComponentsToInstall(); 
  };


  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centeredView}>
          <ActivityIndicator size="small" color="#5B21B6" />
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
      <View style={styles.listContainer}>
        {components.map((component) => {
          const caseLineId = component.id || component.caseLineId;
          
          const reservation = component.reservations?.find(
            (res) => res.status === "PICKED_UP"
          );
          const reservationId = reservation?.reservationId || "";
          const isSelected = selectedForBulkInstall.has(reservationId);
          
          const pickedUpCount =
            component.reservations?.filter(
              (res) => res.status === "PICKED_UP"
            ).length ||
            component.quantityReserved ||
            component.quantity;
            
          const warehouse = component.reservations?.[0]?.warehouse; 

          return (
            <TouchableOpacity 
              key={caseLineId} 
              style={[styles.itemCard, isSelected && styles.itemCardSelected]}
              onPress={() => toggleSelection(reservationId)} 
            >
              <View style={styles.itemRow}>
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => toggleSelection(reservationId)}
                >
                  <Ionicons 
                    name={isSelected ? "checkbox" : "checkbox-outline"}
                    size={24} 
                    color={isSelected ? "#7C3AED" : "#9CA3AF"}
                  />
                </TouchableOpacity>

                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Ionicons name="build-outline" size={16} color="#5B21B6" />
                    <Text style={styles.itemName}>
                      {component.typeComponent?.name || "Component"}
                    </Text>
                  </View>
                  <View style={styles.itemMeta}>
                    {component.diagnosisText && (
                      <Text style={styles.metaText} numberOfLines={1}>
                        <Text style={styles.metaLabel}>Chẩn đoán:</Text>{" "}
                        {component.diagnosisText}
                      </Text>
                    )}
                    <Text style={styles.metaText}>
                      <Text style={styles.metaLabel}>Số lượng:</Text> {pickedUpCount}
                    </Text>
                    {warehouse && (
                      <Text style={styles.metaText} numberOfLines={1}>
                        <Text style={styles.metaLabel}>Kho:</Text>{" "}
                        {warehouse.name || warehouse.warehouseName || "N/A"}
                      </Text>
                    )}
                    <Text style={styles.metaText} ellipsizeMode="tail" numberOfLines={1}>
                      <Text style={styles.metaLabel}>Case:</Text> {component.guaranteeCaseId}
                    </Text>
                  </View>
                  <Text style={styles.itemStatus}>
                    Đã lấy, chờ lắp đặt
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleInstallClick(component)}
                  style={styles.installButton}
                >
                  <Ionicons name="build-outline" size={16} color="#FFFFFF" /> 
                  <Text style={styles.installButtonText}>Lắp đặt</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [loading, components, selectedForBulkInstall]); 

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="cube" size={20} color="#5B21B6" />
          </View>
          <View>
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
                name={selectedForBulkInstall.size === allReservationIds.length ? "checkbox" : "checkbox-outline"}
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
                  <Ionicons name="build" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.bulkInstallButtonText}>
                  Lắp đặt ({selectedForBulkInstall.size})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {renderContent}
      </View>

      {selectedComponent && (
        <ComponentInstallModal
          isOpen={true}
          onClose={() => setSelectedComponent(null)}
          onSuccess={handleInstallSuccess}
          reservationId={selectedComponent.reservationId}
          componentName={selectedComponent.componentName}
          vehicleVin={selectedComponent.vehicleVin}
          componentSerial={selectedComponent.componentSerial} 
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIconWrapper: {
    padding: 8,
    backgroundColor: "#F3E8FF", 
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16, 
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12, 
    color: "#6B7280",
  },
  countBadge: {
    backgroundColor: "#F3E8FF", 
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: "auto",
  },
  countText: {
    color: "#5B21B6", 
    fontWeight: "600",
    fontSize: 14,
  },
  centeredView: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB", 
    borderRadius: 8,
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
    backgroundColor: "#F9FAFB", 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12, 
    marginBottom: 8,
  },
  // --- STYLE MỚI ---
  itemCardSelected: {
    backgroundColor: "#F3E8FF",
    borderColor: "#A78BFA",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    padding: 8,
    marginRight: 4,
  },
  // --- KẾT THÚC STYLE MỚI ---
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14, 
    fontWeight: "500", 
    color: "#111827",
    marginLeft: 6,
    flexShrink: 1,
  },
  itemMeta: {
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12, 
    color: "#4B5563",
    flexShrink: 1,
  },
  metaLabel: { 
    fontWeight: "500",
  },
  itemStatus: {
    fontSize: 12,
    color: "#5B21B6",
    fontStyle: "italic",
  },
  installButton: {
    flexDirection: "row",
    backgroundColor: "#7C3AED", 
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  installButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  
  // --- STYLES MỚI CHO BULK ACTION ---
  bulkActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 12,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  selectAllText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  bulkInstallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B21B6", // Màu tím đậm hơn
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bulkInstallButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#A78BFA",
  },
});