import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardOverviewScreen from "../screens/technician/DashboardOverviewScreen";
import MyTasksScreen from "../screens/technician/MyTasksScreen";
import CaseDetailsScreen from "../screens/technician/CaseDetailsScreen";
import MyScheduleScreen from "../screens/technician/MyScheduleScreen";
import PartsInventoryScreen from "../screens/technician/PartsInventoryScreen";
import WorkHistoryScreen from "../screens/technician/WorkHistoryScreen";

const Stack = createStackNavigator();

const screenOptions = {
  headerShown: false, 
};

export const DashboardStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="DashboardOverview"
      component={DashboardOverviewScreen}
    />
  </Stack.Navigator>
);

export const TasksStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MyTasks" component={MyTasksScreen} />
    <Stack.Screen name="CaseDetails" component={CaseDetailsScreen} />
  </Stack.Navigator>
);

export const ScheduleStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
  </Stack.Navigator>
);

export const PartsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="PartsInventory" component={PartsInventoryScreen} />
  </Stack.Navigator>
);

export const HistoryStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="WorkHistory" component={WorkHistoryScreen} />
  </Stack.Navigator>
);