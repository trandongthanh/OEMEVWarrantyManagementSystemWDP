import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import LoginScreen from "../screens/LoginScreen";
import ManagerDashboardTabs from "../screens/manager/ManagerDashboardTabs";
import StaffDashboardTabs from "../screens/staff/StaffDashboardTabs";
import TechnicianTabNavigator from "./TechnicianTabNavigator";
import StaffChatScreen from "../screens/staff/StaffChatScreen";
import TrackingScreen from "../screens/customer/TrackingScreen"; // ⭐ NEW SCREEN
import SupportChatScreen from "../screens/customer/SupportChatScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TrackingScreen" // ⭐ MÀN HÌNH ĐẦU TIÊN
        screenOptions={{
          headerStyle: { backgroundColor: "#0B3D91" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {/* ⭐ Mở app -> vào đây */}
        <Stack.Screen
          name="TrackingScreen"
          component={TrackingScreen}
          options={{ headerShown: false }}
        />

        {/* Login */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* Manager */}
        <Stack.Screen
          name="ManagerDashboardTabs"
          component={ManagerDashboardTabs}
          options={{ headerShown: false }}
        />

        {/* Staff */}
        <Stack.Screen
          name="StaffDashboardTabs"
          component={StaffDashboardTabs}
          options={{ headerShown: false }}
        />

        {/* Chat */}
        <Stack.Screen
          name="StaffChatScreen"
          component={StaffChatScreen}
          options={{ headerShown: false }}
        />

        {/* Technician */}
        <Stack.Screen
          name="TechnicianDashboard"
          component={TechnicianTabNavigator}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="SupportChatScreen"
          component={SupportChatScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
