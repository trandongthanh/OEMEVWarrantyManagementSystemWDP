import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import {
  DashboardStack,
  TasksStack,
  ScheduleStack,
  PartsStack,
  HistoryStack,
} from "./TechnicianStackNavigator";

const Tab = createBottomTabNavigator();

const TechnicianTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarActiveTintColor: "#1D4ED8", 
        tabBarInactiveTintColor: "#6B7280", 
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "DashboardTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "TasksTab") {
            iconName = focused ? "clipboard" : "clipboard-outline";
          } else if (route.name === "ScheduleTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "PartsTab") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "HistoryTab") {
            iconName = focused ? "time" : "time-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksStack}
        options={{ tabBarLabel: "My Tasks" }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleStack}
        options={{ tabBarLabel: "Schedule" }}
      />
      <Tab.Screen
        name="PartsTab"
        component={PartsStack}
        options={{ tabBarLabel: "Parts" }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ tabBarLabel: "History" }}
      />
    </Tab.Navigator>
  );
};

export default TechnicianTabNavigator;