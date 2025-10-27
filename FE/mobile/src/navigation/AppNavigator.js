import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 📄 Screens
import LoginScreen from "../screens/LoginScreen";
import ManagerDashboard from "../screens/ManagerDashboard";
import StaffDashboardTabs from "../screens/staff/StaffDashboardTabs";
import TechnicianDashboard from "../screens/TechnicianDashboard";
import StaffChatScreen from "../screens/staff/StaffChatScreen"; // 👈 thêm vào đây

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
          name="ManagerDashboard"
          component={ManagerDashboard}
          options={{ title: "Manager Dashboard" }}
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
          component={TechnicianDashboard}
          options={{
            title: "Technician Dashboard",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
