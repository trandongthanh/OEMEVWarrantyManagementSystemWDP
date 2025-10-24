import { useState } from "react";
import { StyleSheet, View, SafeAreaView, StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  ClipboardList,
  Clock,
  Package,
  Car,
  Wrench,
  History,
  FolderOpen,
} from "lucide-react-native";

// Hooks
import { useAuth } from "../../hooks/useAuth";
import { useRoleProtection } from "../../hooks/useRoleProtection";

// Screens
import DashboardOverview from "./DashboardOverview";
import MyTasks from "./MyTasks";
import WorkHistory from "./WorkHistory";
import PartsInventory from "./PartsInventory";

// Components
import DashboardHeader from "../../components/dashboard/DashboardHeader";

const Tab = createBottomTabNavigator();

// --- Component chính ---
export default function TechnicianDashboard({ navigation }) {
  useRoleProtection(["service_center_technician"]);
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Custom header component
  const CustomHeader = ({ route }) => {
    const getHeaderTitle = () => {
      switch (route.name) {
        case "Dashboard":
          return "Dashboard";
        case "Tasks":
          return "My Tasks";
        case "Parts":
          return "Parts Inventory";
        case "History":
          return "Work History";
        default:
          return "Technician";
      }
    };

    const showSearch = route.name === "Dashboard";

    return (
      <DashboardHeader
        onSearch={(query) => setSearchQuery(query)}
        searchPlaceholder="Search tasks, vehicles..."
        showSearch={showSearch}
        showNotifications={true}
        currentPage={getHeaderTitle()}
        searchValue={searchQuery}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            // Kích thước icon khi focused
            const iconSize = focused ? size + 2 : size;
            
            if (route.name === "Dashboard") {
              return <Home size={iconSize} color={color} />;
            } else if (route.name === "Tasks") {
              return <ClipboardList size={iconSize} color={color} />;
            } else if (route.name === "Parts") {
              return <Package size={iconSize} color={color} />;
            } else if (route.name === "History") {
              return <History size={iconSize} color={color} />;
            }
          },
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          header: (props) => <CustomHeader {...props} />,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardOverview}
          options={{
            tabBarLabel: "Dashboard",
          }}
        />
        <Tab.Screen 
          name="Tasks" 
          component={MyTasks}
          options={{
            tabBarLabel: "Tasks",
          }}
        />
        <Tab.Screen 
          name="Parts" 
          component={PartsInventory}
          options={{
            tabBarLabel: "Parts",
          }}
        />
        <Tab.Screen 
          name="History" 
          component={WorkHistory}
          options={{
            tabBarLabel: "History",
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Shadow cho Android
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});