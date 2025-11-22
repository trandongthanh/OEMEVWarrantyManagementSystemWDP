import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TechnicianTabNavigator from "./TechnicianTabNavigator";
import CaseDetailsScreen from "../screens/technician/CaseDetailsScreen";

const Stack = createStackNavigator();

export default function TechnicianStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="TechnicianTabs" 
        component={TechnicianTabNavigator} 
      />

      <Stack.Screen 
        name="CaseDetails" 
        component={CaseDetailsScreen}
        options={{
          presentation: 'card', 
        }}
      />
    </Stack.Navigator>
  );
}