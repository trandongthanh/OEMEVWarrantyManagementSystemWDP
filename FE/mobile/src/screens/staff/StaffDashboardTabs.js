import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StaffVehicleSearch from "./StaffVehicleSearch";
import StaffCaseListScreen from "./StaffCaseListScreen";
import StaffMessageListScreen from "./StaffMessageListScreen";
import StaffInfoScreen from "./StaffInfoScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function StaffDashboardTabs({ route }) {
  // ✅ Nhận token từ LoginScreen
  const token = route?.params?.token;
  console.log("🔑 Token received in StaffDashboardTabs:", token);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB", // Xanh đậm hơn chút cho rõ trên nền trắng
        tabBarInactiveTintColor: "#6B7280", // Xám trung tính
        tabBarStyle: {
          backgroundColor: "#FFFFFF", // Nền trắng
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB", // Viền xám nhạt
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8, // Bóng đổ Android
          shadowColor: "#000", // Bóng đổ iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
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
              iconName = "briefcase-outline";
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
      {/* 🏠 Home Tab */}
      <Tab.Screen
        name="Home"
        component={StaffVehicleSearch}
        initialParams={{ token }}
        options={{ title: "Home" }}
      />

      {/* 📂 Cases Tab */}
      <Tab.Screen
        name="Cases"
        component={StaffCaseListScreen}
        initialParams={{ token }}
        options={{ title: "Cases" }}
      />

      {/* 💬 Messages Tab */}
      <Tab.Screen
        name="Messages"
        component={StaffMessageListScreen}
        initialParams={{ token }}
        options={{ title: "Messages" }}
      />

      {/* 👤 My Info Tab */}
      <Tab.Screen
        name="StaffInfo"
        component={StaffInfoScreen}
        initialParams={{ token }}
        options={{ title: "My Info" }}
      />
    </Tab.Navigator>
  );
}