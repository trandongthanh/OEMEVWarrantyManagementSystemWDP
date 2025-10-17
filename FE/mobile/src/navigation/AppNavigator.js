import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 📄 Screens
import LoginScreen from "../screens/LoginScreen";
import ManagerDashboard from "../screens/ManagerDashboard";
import StaffDashboardTabs from "../screens/staff/StaffDashboardTabs"; // ✅ sửa: dùng Tabs thay vì Dashboard
import TechnicianDashboard from "../screens/TechnicianDashboard";

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
          options={{
            title: "Manager Dashboard",
          }}
        />

        {/* 🧾 Staff (Tabs) */}
        <Stack.Screen
          name="StaffDashboardTabs"
          component={StaffDashboardTabs}
          options={{
            headerShown: false, // ✅ ẩn header để tab bar có không gian riêng
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
