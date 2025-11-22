import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { componentReservationService } from "../../services/technician";

export default function ComponentsToPickup() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPickupItems = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const response = await componentReservationService.getComponentReservations({
        status: "RESERVED",
        repairTechId: userId,
        limit: 50,
      });

      const items = response.data?.reservations || [];
      setReservations(items);
    } catch (error) {
      console.error("Failed to load pickup items:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPickupItems();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="small" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainHeader}>
        <View style={styles.mainIconBox}>
          <Ionicons name="cube-outline" size={24} color="#C2410C" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.mainTitle}>To Pickup</Text>
          <Text style={styles.mainSubtitle}>
            {reservations.length > 0 
              ? `Please visit the warehouse to pick up ${reservations.length} components`
              : "No components to pick up"}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{reservations.length}</Text>
        </View>
      </View>

      {reservations.length > 0 ? (
        <>
          <View style={styles.divider} />
          <View style={styles.listContainer}>
            {reservations.map((res) => {
              const componentName = res.component?.typeComponent?.name || "";
              const serial = res.component?.serialNumber || "Unassigned";
              const warehouse = 
                res.component?.stockTransferRequest?.requestingWarehouse || 
                res.component?.warehouse || 
                res.warehouse;

              const warehouseName = warehouse?.name || warehouse?.warehouseName || "Central Warehouse";
              const warehouseAddress = warehouse?.address || "Contact warehouse keeper";

              const vin = res.caseLine?.guaranteeCase?.vehicleProcessingRecord?.vin || "N/A";

              return (
                <View key={res.reservationId} style={styles.itemCard}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemLabel}>Component</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Ready for Pickup</Text>
                    </View>
                  </View>

                  <Text style={styles.componentName}>{componentName}</Text>
                  <Text style={styles.serialText}>Serial: {serial}</Text>

                  <View style={styles.locationBox}>
                    <View style={styles.locationHeader}>
                      <Ionicons name="location-outline" size={16} color="#C2410C" style={{marginTop: 2}} />
                      <Text style={styles.locationTitle}>Pickup Location</Text>
                    </View>
                    <View style={styles.locationContent}>
                      <Text style={styles.warehouseName}>{warehouseName}</Text>
                      <Text style={styles.warehouseAddress}>{warehouseAddress}</Text>
                    </View>
                  </View>

                  <Text style={styles.vinText}>Vehicle: {vin}</Text>
                  
                  <View style={styles.instructionBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#B45309" />
                    <Text style={styles.instructionText}>
                        Please contact the warehouse keeper to pick up items.
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
            <View style={styles.divider} />
            <Ionicons name="cube-outline" size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>No pickup requests</Text>
            <Text style={styles.emptySubText}>Components will appear here once approved</Text>
        </View>
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
    overflow: "hidden",
  },
  centered: {
    padding: 20,
    alignItems: 'center',
  },
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  mainIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#FFEDD5", 
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  mainSubtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C2410C",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  itemCard: {
    // Style item card
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C2410C",
  },
  componentName: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  serialText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  locationBox: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C2410C",
  },
  locationContent: {
    paddingLeft: 22,
  },
  warehouseName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  warehouseAddress: {
    fontSize: 13,
    color: "#4B5563",
  },
  vinText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
  },
  instructionText: {
    fontSize: 12,
    color: "#92400E",
    flex: 1,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubText: {
    fontSize: 12,
    color: "#9CA3AF",
  }
});