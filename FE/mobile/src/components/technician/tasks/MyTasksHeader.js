import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Search,
  ClipboardList,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react-native";
import { STATUS_OPTIONS } from "../../../utils/technician/taskUtils";
import MyTasksStatCard from "./MyTasksStatCard";

export default function MyTasksHeader({
  stats,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>Manage your assigned warranty cases</Text>
      </View>

      <View style={styles.statsRow}>
        <MyTasksStatCard
          icon={<ClipboardList size={18} color="#3B82F6" />}
          label="Total"
          value={stats.total}
          color="#3B82F6"
        />
        <MyTasksStatCard
          icon={<AlertCircle size={18} color="#EF4444" />}
          label="Urgent"
          value={stats.urgent}
          color="#EF4444"
        />
        <MyTasksStatCard
          icon={<Calendar size={18} color="#10B981" />}
          label="Today"
          value={stats.today}
          color="#10B981"
        />
        <MyTasksStatCard
          icon={<Clock size={18} color="#F59E0B" />}
          label="Pending"
          value={stats.pending}
          color="#F59E0B"
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
                key={String(option.value)}
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