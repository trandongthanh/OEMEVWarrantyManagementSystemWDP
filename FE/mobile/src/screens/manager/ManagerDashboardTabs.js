import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// 🧩 Import các màn hình của Manager
import ManagerDashboardHome from "./ManagerDashboardHome";
import ManagerCustomersScreen from "./ManagerCustomersScreen";
import ManagerCaseLinesScreen from "./ManagerCaseLinesScreen";
import ManagerTaskAssignmentScreen from "./ManagerTaskAssignmentScreen";
import ManagerInfoScreen from "./ManagerInfoScreen";

const Tab = createBottomTabNavigator();

export default function ManagerDashboardTabs() {
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
            case "Dashboard":
              iconName = "home-outline";
              break;
            case "Customers":
              iconName = "people-outline";
              break;
            case "CaseLines":
              iconName = "checkbox-outline";
              break;
            case "TaskAssignment":
              iconName = "clipboard-outline";
              break;
            case "MyInfo":
              iconName = "person-circle-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* 🏠 Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={ManagerDashboardHome}
        options={{ title: "Dashboard" }}
      />

      {/* 👥 Customers */}
      <Tab.Screen
        name="Customers"
        component={ManagerCustomersScreen}
        options={{ title: "Customers" }}
      />

      {/* 🧾 Case Lines */}
      <Tab.Screen
        name="CaseLines"
        component={ManagerCaseLinesScreen}
        options={{ title: "Case Lines" }}
      />

      {/* 📋 Task Assignment */}
      <Tab.Screen
        name="TaskAssignment"
        component={ManagerTaskAssignmentScreen}
        options={{ title: "Task Assignment" }}
      />

      {/* 👤 My Info */}
      <Tab.Screen
        name="MyInfo"
        component={ManagerInfoScreen}
        options={{ title: "My Info" }}
      />
    </Tab.Navigator>
  );
}
