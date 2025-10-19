import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StaffVehicleSearch from "./StaffVehicleSearch";
import StaffInfoScreen from "./StaffInfoScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function StaffDashboardTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9AA7B5",
        tabBarStyle: {
          backgroundColor: "#0B0F14",
          borderTopWidth: 1,
          borderTopColor: "#1F2833",
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 3,
        },
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === "VehicleSearch"
              ? "search-outline"
              : "person-circle-outline";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="VehicleSearch"
        component={StaffVehicleSearch}
        options={{ title: "Search Vehicle" }}
      />
      <Tab.Screen
        name="StaffInfo"
        component={StaffInfoScreen}
        options={{ title: "My Info" }}
      />
    </Tab.Navigator>
  );
}
