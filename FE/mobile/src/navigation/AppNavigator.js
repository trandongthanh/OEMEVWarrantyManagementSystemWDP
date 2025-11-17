import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 📄 Screens
import LoginScreen from "../screens/LoginScreen";
import ManagerDashboardTabs from "../screens/manager/ManagerDashboardTabs";
import StaffDashboardTabs from "../screens/staff/StaffDashboardTabs";
import TechnicianTabNavigator from "./TechnicianTabNavigator";
import StaffChatScreen from "../screens/staff/StaffChatScreen"; // 👈 thêm vào đây
import TrackingTokenScreen from "../screens/track/TrackingTokenScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: "#0B3D91" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {/* 🔐 Login Screen */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* 👨‍💼 Manager */}
        <Stack.Screen
          name="ManagerDashboardTabs"
          component={ManagerDashboardTabs}
          options={{ title: "Manager Dashboard", headerShown: false }}
        />

        {/* 🧾 Staff (Tabs) */}
        <Stack.Screen
          name="StaffDashboardTabs"
          component={StaffDashboardTabs}
          options={{
            headerShown: false,
          }}
        />

        {/* 💬 Chat chi tiết */}
        <Stack.Screen
          name="StaffChatScreen"
          component={StaffChatScreen}
          options={{
            headerShown: false, // ✅ full màn hình chat
          }}
        />

        {/* 🔧 Technician */}
        <Stack.Screen
          name="TechnicianDashboard"
          component={TechnicianTabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TrackingToken"
          component={TrackingTokenScreen}
          options={{
            headerShown: true,
            title: "Track Vehicle",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
