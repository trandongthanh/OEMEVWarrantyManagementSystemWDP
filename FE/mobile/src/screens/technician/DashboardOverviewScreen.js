import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { technicianService } from "../../services/technician"; 
import ComponentsToInstall from "../../components/technician/ComponentsToInstall";
import RepairsToComplete from "../../components/technician/RepairsToComplete";
import AvatarLogoutMenu from "../../components/technician/AvatarLogoutMenu"; 
import ComponentsToPickup from "../../components/technician/ComponentsToPickup";

export default function DashboardOverviewScreen() {
  const [processingRecords, setProcessingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    loadProcessingRecords();
  }, []);

  const loadProcessingRecords = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const response = await technicianService.getAssignedRecords();
      const allRecords = response.data?.records?.records || [];
      setProcessingRecords(allRecords);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProcessingRecords();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProcessingRecords();
    setRefreshKey((prev) => prev + 1);
  }, []);

  const stats = useMemo(() => {
    const active = processingRecords.filter(
      (r) => r.status === "IN_DIAGNOSIS" || r.status === "IN_REPAIR"
    ).length;
    const totalActive = processingRecords.length;
    const completed = processingRecords.filter(r => r.status === 'COMPLETED').length;
    
    return { totalCount: totalActive, activeCount: active, completedCount: completed };
  }, [processingRecords]);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <AvatarLogoutMenu />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: "#DBEAFE" }]}>
            <Text style={[styles.statNumber, { color: "#1E40AF" }]}>
              {isLoading ? "-" : stats.totalCount}
            </Text>
            <Text style={[styles.statLabel, { color: "#1E3A8A" }]}>
              Total
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#F3E8FF" }]}>
            <Text style={[styles.statNumber, { color: "#5B21B6" }]}>
              {isLoading ? "-" : stats.activeCount}
            </Text>
            <Text style={[styles.statLabel, { color: "#4C1D95" }]}>Active</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#D1FAE5" }]}>
            <Text style={[styles.statNumber, { color: "#065F46" }]}>
              {isLoading ? "-" : stats.completedCount}
            </Text>
            <Text style={[styles.statLabel, { color: "#044229" }]}>Done</Text>
          </View>
        </View>

        <View style={styles.actionItemsContainer}>
            <ComponentsToPickup 
              key={`pickup-${refreshKey}`} 
              onActionSuccess={triggerRefresh} 
            />
            <View style={{ height: 16 }} />
            
            <ComponentsToInstall 
              key={`install-${refreshKey}`} 
              onActionSuccess={triggerRefresh} 
            />
            <View style={{ height: 16 }} />
            
            <RepairsToComplete 
              key={`complete-${refreshKey}`} 
              onActionSuccess={triggerRefresh}
            />
        </View>

      </ScrollView>
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
    paddingVertical: 12, 
    paddingHorizontal: 16,
    paddingTop: 40, 
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  actionItemsContainer: { 
    padding: 16,
    paddingTop: 16, 
  },
});