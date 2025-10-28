import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StaffVehicleSearch from "./StaffVehicleSearch";
import StaffCaseListScreen from "./StaffCaseListScreen"; // ✅ Thêm mới
import StaffMessageListScreen from "./StaffMessageListScreen";
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
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Cases":
              iconName = "briefcase-outline"; // ✅ biểu tượng cho case
              break;
            case "Messages":
              iconName = "chatbubbles-outline";
              break;
            case "StaffInfo":
              iconName = "person-circle-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* 🏠 Home Tab (Search Vehicle) */}
      <Tab.Screen
        name="Home"
        component={StaffVehicleSearch}
        options={{ title: "Home" }}
      />

      {/* 📂 Cases Tab */}
      <Tab.Screen
        name="Cases"
        component={StaffCaseListScreen}
        options={{ title: "Cases" }}
      />

      {/* 💬 Messages Tab */}
      <Tab.Screen
        name="Messages"
        component={StaffMessageListScreen}
        options={{ title: "Messages" }}
      />

      {/* 👤 My Info Tab */}
      <Tab.Screen
        name="StaffInfo"
        component={StaffInfoScreen}
        options={{ title: "My Info" }}
      />
    </Tab.Navigator>
  );
}
