import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Search,
  FileText,
  CheckCircle,
  Calendar,
  TrendingUp,
} from "lucide-react-native";
import { STATUS_OPTIONS } from "../../../utils/technician/historyUtils";
import HistoryStatCard from "./HistoryStatCard";

export default function HistoryHeader({
  stats,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Work History</Text>
        <Text style={styles.subtitle}>Review your complete work history</Text>
      </View>

      <View style={styles.statsRow}>
        <HistoryStatCard
          icon={<FileText size={18} color="#8B5CF6" />}
          label="Total"
          value={stats.total}
          color="#8B5CF6"
        />
        <HistoryStatCard
          icon={<CheckCircle size={18} color="#10B981" />}
          label="Completed"
          value={stats.completed}
          color="#10B981"
        />
        <HistoryStatCard
          icon={<Calendar size={18} color="#3B82F6" />}
          label="This Month"
          value={stats.thisMonth}
          color="#3B82F6"
        />
        <HistoryStatCard
          icon={<TrendingUp size={18} color="#6366F1" />}
          label="Success %"
          value={`${stats.successRate}%`}
          color="#6366F1"
        />
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by VIN, model..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={onStatusChange}
            style={styles.picker}
            dropdownIconColor="#6B7280"
          >
            {STATUS_OPTIONS.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  filterContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#111827",
    fontSize: 14,
  },
  pickerWrapper: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: "#111827",
    fontSize: 14,
  },
});