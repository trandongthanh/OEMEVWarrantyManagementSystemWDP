import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StaffVehicleSearch from "./StaffVehicleSearch";
import StaffWarrantySearch from "./StaffWarrantySearch";
import StaffInfoScreen from "./StaffInfoScreen"; // 👈 thêm màn mới
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
          let iconName;
          if (route.name === "VehicleSearch") iconName = "search-outline";
          else if (route.name === "WarrantySearch") iconName = "car-outline";
          else if (route.name === "StaffInfo")
            iconName = "person-circle-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="VehicleSearch"
        component={StaffVehicleSearch}
        options={{ title: "Search Vehicle" }}
      />
      <Tab.Screen
        name="WarrantySearch"
        component={StaffWarrantySearch}
        options={{ title: "Warranty Info" }}
      />
      <Tab.Screen
        name="StaffInfo"
        component={StaffInfoScreen}
        options={{ title: "My Info" }}
      />
    </Tab.Navigator>
  );
}
