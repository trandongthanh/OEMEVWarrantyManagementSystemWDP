import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Import các màn hình
import DashboardOverviewScreen from "../screens/technician/DashboardOverviewScreen";
import MyTasksScreen from "../screens/technician/MyTasksScreen";
import MyScheduleScreen from "../screens/technician/MyScheduleScreen";
import PartsInventoryScreen from "../screens/technician/PartsInventoryScreen";
import WorkHistoryScreen from "../screens/technician/WorkHistoryScreen";

const Stack = createStackNavigator();
const screenOptions = { headerShown: false };

const DashboardStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="DashboardOverview" component={DashboardOverviewScreen} />
  </Stack.Navigator>
);

const TasksStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    {/* CHỈ ĐỂ LẠI MÀN HÌNH DANH SÁCH, XÓA CASE DETAILS */}
    <Stack.Screen name="MyTasks" component={MyTasksScreen} />
  </Stack.Navigator>
);

const ScheduleStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
  </Stack.Navigator>
);

const PartsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="PartsInventory" component={PartsInventoryScreen} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="WorkHistory" component={WorkHistoryScreen} />
  </Stack.Navigator>
);

const Tab = createBottomTabNavigator();

const TechnicianTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1D4ED8",
        tabBarInactiveTintColor: "#6B7280",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "DashboardTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "TasksTab") {
            iconName = focused ? "clipboard" : "clipboard-outline";
          } else if (route.name === "ScheduleTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "PartsTab") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "HistoryTab") {
            iconName = focused ? "time" : "time-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksStack}
        options={{ tabBarLabel: "My Tasks" }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleStack}
        options={{ tabBarLabel: "Schedule" }}
      />
      <Tab.Screen
        name="PartsTab"
        component={PartsStack}
        options={{ tabBarLabel: "Parts" }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ tabBarLabel: "History" }}
      />
    </Tab.Navigator>
  );
};

export default TechnicianTabNavigator;