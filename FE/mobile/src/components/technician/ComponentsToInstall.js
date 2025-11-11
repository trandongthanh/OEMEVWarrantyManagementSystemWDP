import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { caseLineService } from "../../services/technician";
import ComponentInstallModal from "./ComponentInstallModal";

export default function ComponentsToInstall() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const loadComponentsToInstall = async () => {
    try {
      setLoading(true);
      const response = await caseLineService.getCaseLinesList({
        status: "IN_REPAIR",
        limit: 50,
      });

      const caseLines = response.data.caseLines || [];

      const componentsReady = caseLines.filter((cl) => {
        if (cl.reservations && cl.reservations.length > 0) {
          return cl.reservations.some((res) => res.status === "PICKED_UP");
        }
        return false;
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
      loadComponentsToInstall();
    }, [])
  );

  const handleInstallClick = (component) => {
    const reservation = component.reservations?.find(
      (res) => res.status === "PICKED_UP"
    );

    if (!reservation || !reservation.reservationId) {
      console.error("No reservation found for this component");
      return;
    }

    setSelectedComponent({
      reservationId: reservation.reservationId,
      componentName: component.typeComponent?.name || "Component",
      vehicleVin: component.guaranteeCase?.vehicleProcessingRecord?.vin || "",
      componentSerial: "",
    });
  };

  const handleInstallSuccess = () => {
    setSelectedComponent(null);
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
          const pickedUpCount =
            component.reservations?.filter(
              (res) => res.status === "PICKED_UP"
            ).length || 0;

          return (
            <View key={caseLineId} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Ionicons name="build-outline" size={16} color="#5B21B6" />
                  <Text style={styles.itemName}>
                    {component.typeComponent?.name || "Component"}
                  </Text>
                </View>

                <View style={styles.itemMeta}>
                  <Text style={styles.metaText}>
                    Số lượng: {pickedUpCount}
                  </Text>
                  <Text style={styles.metaText} ellipsizeMode="tail" numberOfLines={1}>
                    Case: {component.guaranteeCaseId}
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
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.installButtonText}>Lắp đặt</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  }, [loading, components]);

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
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
    flexDirection: "row",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
    marginRight: 12,
    flexShrink: 1,
  },
  itemStatus: {
    fontSize: 12,
    color: "#5B21B6",
    fontStyle: "italic",
  },
  installButton: {
    flexDirection: "row",
    backgroundColor: "#5B21B6",
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
});