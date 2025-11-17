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
import { componentReservationService } from "../../services/technician";

export default function ComponentsToPickup() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(null); //

  const loadComponentsToPickup = async () => {
    try {
      setLoading(true);
      const response = await componentReservationService.getComponentReservations({
        status: "RESERVED",
      });

      const reservedItems = response.data?.reservations || [];
      setReservations(reservedItems);
    } catch (error) {
      console.error("Failed to load components to pickup:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách chờ lấy.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadComponentsToPickup();
    }, [])
  );

  const handlePickupClick = async (reservationId) => {
    if (isSubmitting) return;

    Alert.alert(
      "Xác nhận lấy hàng",
      "Bạn có chắc chắn muốn lấy linh kiện này từ kho?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "default",
          onPress: async () => {
            setIsSubmitting(reservationId);
            try {
              await componentReservationService.pickupComponents([reservationId]);
              Alert.alert("Thành công", "Linh kiện đã được lấy.");
              loadComponentsToPickup(); 
            } catch (error) {
              console.error("Failed to pickup component:", error);
              Alert.alert("Lỗi", error.response?.data?.message || "Không thể lấy linh kiện.");
            } finally {
              setIsSubmitting(null);
            }
          },
        },
      ]
    );
  };

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centeredView}>
          <ActivityIndicator size="small" color="#F59E0B" />
          <Text style={styles.loadingText}>Đang tải mục chờ lấy...</Text>
        </View>
      );
    }

    if (reservations.length === 0) {
      return (
        <View style={styles.centeredView}>
          <Ionicons name="archive-outline" size={24} color="#9CA3AF" />
          <Text style={styles.emptyText}>Không có linh kiện chờ lấy</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {reservations.map((res) => {
          const resId = res.reservationId;
          const component = res.component;
          const caseLine = res.caseLine;

          return (
            <View key={resId} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Ionicons name="archive-outline" size={16} color="#D97706" />
                  <Text style={styles.itemName}>
                    {component?.typeComponent?.name || "Linh kiện"}
                  </Text>
                </View>

                <View style={styles.itemMeta}>
                  <Text style={styles.metaText} numberOfLines={1}>
                    <Text style={styles.metaLabel}>Serial:</Text> {component?.serialNumber || "N/A"}
                  </Text>
                  <Text style={styles.metaText} numberOfLines={1}>
                    <Text style={styles.metaLabel}>Vị trí:</Text> {component?.warehouse?.name || "Kho"}
                  </Text>
                  <Text style={styles.metaText} ellipsizeMode="tail" numberOfLines={1}>
                    <Text style={styles.metaLabel}>Case:</Text> {caseLine?.guaranteeCaseId}
                  </Text>
                </View>
                <Text style={styles.itemStatus}>
                  Trạng thái: Đã đặt (RESERVED)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handlePickupClick(resId)}
                style={[styles.pickupButton, isSubmitting === resId && styles.disabledButton]}
                disabled={isSubmitting === resId}
              >
                {isSubmitting === resId ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="hand-right-outline" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.pickupButtonText}>Lấy hàng</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  }, [loading, reservations, isSubmitting]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="archive" size={20} color="#D97706" />
          </View>
          <View>
            <Text style={styles.title}>Chờ lấy hàng</Text>
            <Text style={styles.subtitle}>Linh kiện đã được duyệt (Reserved)</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{reservations.length}</Text>
          </View>
        </View>
        {renderContent}
      </View>
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
    backgroundColor: "#FFFBEB", //
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
    backgroundColor: "#FFFBEB", //
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: "auto",
  },
  countText: {
    color: "#D97706", //
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
    color: "#D97706",
    fontStyle: "italic",
  },
  pickupButton: {
    flexDirection: "row",
    backgroundColor: "#F59E0B", //
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  pickupButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: "#FCD34D",
  },
});