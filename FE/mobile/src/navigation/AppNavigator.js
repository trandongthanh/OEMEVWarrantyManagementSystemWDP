import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 📄 Screens
import LoginScreen from "../screens/LoginScreen";
import ManagerDashboard from "../screens/ManagerDashboard";
import StaffDashboardTabs from "../screens/staff/StaffDashboardTabs";
import TechnicianDashboard from "../screens/technician/TechnicianDashboard";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* 🔐 Màn hình Login */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* 👨‍💼 Màn hình Manager */}
        <Stack.Screen
          name="ManagerDashboard"
          component={ManagerDashboard}
          // ✅ Đã sửa: Ẩn header mặc định
          options={{ headerShown: false }}
        />

        {/* 🧾 Màn hình Staff (sử dụng Tabs) */}
        <Stack.Screen
          name="StaffDashboardTabs"
          component={StaffDashboardTabs}
          // ✅ Giữ nguyên: Đã ẩn header
          options={{ headerShown: false }}
        />

        {/* 🔧 Màn hình Technician */}
        <Stack.Screen
          name="TechnicianDashboard"
          component={TechnicianDashboard}
          // ✅ Đã sửa: Ẩn header mặc định
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

