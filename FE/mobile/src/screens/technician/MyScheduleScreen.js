import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { workScheduleService } from "../../services/technician";
import AvatarLogoutMenu from "../../components/technician/AvatarLogoutMenu"; 

const { width: screenWidth } = Dimensions.get("window");

const getDaysOfWeek = (startDate) => {
  const days = [];
  const start = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }
  return days;
};

const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  const adjustedStart = (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);

  for (let i = 0; i < adjustedStart; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

const getStatusInfo = (status) => {
  switch (status) {
    case "AVAILABLE":
      return { bg: "#F0FDF4", text: "#16A34A", icon: "checkmark-circle" };
    case "UNAVAILABLE":
      return { bg: "#FEF2F2", text: "#DC2626", icon: "close-circle" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280", icon: "ellipse" };
  }
};

export default function MyScheduleScreen() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("week"); 
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDateRange = useCallback(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [currentDate, viewMode]);

  const loadMySchedule = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const response = await workScheduleService.getMySchedule({
        startDate,
        endDate,
      });

      const schedulesData = Array.isArray(response.data)
        ? response.data
        : response.data.schedules;

      setSchedules(schedulesData || []);
    } catch (error) {
      console.error("Error loading schedule:", error);
      Alert.alert("Error", "Unable to load work schedule.");
    } finally {
      setLoading(false);
      setRefreshing(false); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMySchedule();
    }, [currentDate, viewMode])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMySchedule();
  }, [currentDate, viewMode]);

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction * 7)); 
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const displayDate = useMemo(() => {
    if (viewMode === "week") {
      const { startDate, endDate } = getDateRange();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  }, [currentDate, viewMode, getDateRange]);

  const schedulesByDate = useMemo(() => {
    const map = new Map();
    schedules.forEach((s) => {
      map.set(s.workDate, s);
    });
    return map;
  }, [schedules]);

  // --- Render Views ---
  const renderWeekView = () => {
    const { startDate } = getDateRange();
    const weekStart = new Date(startDate);
    const days = getDaysOfWeek(startDate);

    return (
      <View style={styles.weekContainer}>
        {days.map((date, index) => {
          const dateStr = date.toISOString().split("T")[0];
          const schedule = schedulesByDate.get(dateStr);
          const statusInfo = schedule ? getStatusInfo(schedule.status) : null;
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <View
              key={dateStr}
              style={[
                styles.dayCard,
                isToday && styles.todayCard,
              ]}
            >
              <Text
                style={[
                  styles.dayOfWeek,
                  isToday && styles.todayText,
                ]}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text
                style={[
                  styles.dayOfMonth,
                  isToday && styles.todayText,
                ]}
              >
                {date.getDate()}
              </Text>
              {schedule ? (
                <View
                  style={[
                    styles.statusBadgeWeek,
                    { backgroundColor: statusInfo.bg },
                  ]}
                >
                  <Ionicons
                    name={statusInfo.icon}
                    size={14}
                    color={statusInfo.text}
                  />
                  <Text
                    style={[styles.statusTextWeek, { color: statusInfo.text }]}
                  >
                    {schedule.status}
                  </Text>
                </View>
              ) : (
                <View style={styles.statusBadgeWeek}>
                  <Text style={styles.statusTextWeek}>No Schedule</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderMonthView = () => {
    const monthDays = getDaysInMonth(currentDate);
    const daySize = (screenWidth - 32 - 12) / 7; 

    return (
      <View style={styles.monthContainer}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <View key={day} style={[styles.dayHeader, { width: daySize }]}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
        {monthDays.map((date, index) => {
          if (!date) {
            return (
              <View key={`empty-${index}`} style={[styles.dayCell, { width: daySize, height: daySize }]} />
            );
          }
          const dateStr = date.toISOString().split("T")[0];
          const schedule = schedulesByDate.get(dateStr);
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <View
              key={dateStr}
              style={[
                styles.dayCell,
                { width: daySize, height: daySize },
                isToday && styles.todayCell,
              ]}
            >
              <Text style={styles.dayCellText}>{date.getDate()}</Text>
              {schedule && (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusInfo(schedule.status).text },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <AvatarLogoutMenu />
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "week" && styles.toggleActive,
            ]}
            onPress={() => setViewMode("week")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "week" && styles.toggleTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "month" && styles.toggleActive,
            ]}
            onPress={() => setViewMode("month")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "month" && styles.toggleTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateNavigator}>
        <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.dateDisplay}>{displayDate}</Text>
        <TouchableOpacity onPress={() => navigateDate(1)} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#1D4ED8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#1D4ED8" style={{ marginTop: 32 }} />
        ) : viewMode === "week" ? (
          renderWeekView()
        ) : (
          renderMonthView()
        )}
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
  controlsContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  toggleTextActive: {
    color: "#1D4ED8",
  },
  dateNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  navButton: {
    padding: 8,
  },
  dateDisplay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  scrollContainer: {
    flex: 1,
  },
  // Week View
  weekContainer: {
    padding: 16,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todayCard: {
    backgroundColor: "#DBEAFE",
    borderColor: "#1D4ED8",
    borderWidth: 1,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  dayOfMonth: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 4,
  },
  todayText: {
    color: "#1E40AF",
  },
  statusBadgeWeek: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#F3F4F6",
  },
  statusTextWeek: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  // Month View
  monthContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
  },
  dayHeader: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  dayCell: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    margin: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  todayCell: {
    backgroundColor: "#DBEAFE",
    borderColor: "#1D4ED8",
  },
  dayCellText: {
    fontSize: 14,
    color: "#111827",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    bottom: 6,
  },
});