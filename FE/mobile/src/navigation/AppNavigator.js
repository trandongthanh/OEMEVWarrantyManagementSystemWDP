import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 📄 Screens
import LoginScreen from "../screens/LoginScreen";
import ManagerDashboard from "../screens/ManagerDashboard";
import StaffDashboard from "../screens/StaffDashboard";
import TechnicianDashboard from "../screens/TechnicianDashboard";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
            headerStyle: { backgroundColor: "#0B3D91" },
            headerTintColor: "#fff",
          }}
        />

        {/* 🧾 Staff */}
        <Stack.Screen
          name="StaffDashboard"
          component={StaffDashboard}
          options={{
            title: "Staff Dashboard",
            headerStyle: { backgroundColor: "#0B3D91" },
            headerTintColor: "#fff",
          }}
        />

        {/* 🔧 Technician */}
        <Stack.Screen
          name="TechnicianDashboard"
          component={TechnicianDashboard}
          options={{
            title: "Technician Dashboard",
            headerStyle: { backgroundColor: "#0B3D91" },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
