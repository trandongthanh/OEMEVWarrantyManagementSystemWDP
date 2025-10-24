import { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView, StatusBar, Text } from "react-native";
import {
  Home,
  ClipboardList,
  Clock,
  FileText,
  Package, // ✅ Thêm Package
} from "lucide-react-native";

// ✅ SỬA ĐỔI: Dùng các hook đã chuẩn hóa
import { useAuth } from "../../hooks/useAuth";
import { useRoleProtection } from "../../hooks/useRoleProtection";

// ✅ SỬA ĐỔI: Import các màn hình con thực tế
import DashboardOverview from "./DashboardOverview";
import MyTasks from "./MyTasks";
import WorkHistory from "./WorkHistory";
import PartsInventory from "./PartsInventory";

// ✅ SỬA ĐỔI: Import các component chung
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

export default function TechnicianDashboard({ navigation }) {
  // ✅ SỬA ĐỔI: Dùng hook
  useRoleProtection(["service_center_technician"]);
  const { user, logout } = useAuth();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout(); // Gọi hàm logout từ useAuth
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  // ✅ SỬA ĐỔI: Thêm "Parts Inventory"
  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "tasks", icon: ClipboardList, label: "My Tasks" },
    { id: "parts", icon: Package, label: "Parts Inventory" },
    { id: "history", icon: Clock, label: "Work History" },
  ];

  // ✅ SỬA ĐỔI: Render các màn hình con thực tế
  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <DashboardOverview />;
      case "tasks":
        return <MyTasks />;
      case "parts":
        return <PartsInventory />;
      case "history":
        return <WorkHistory />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          navItems={navItems}
          brandIcon={FileText}
          brandName="Technician"
          brandSubtitle="Workspace"
          currentUser={user} // ✅ SỬL: Dùng user từ useAuth
          onLogout={handleLogout}
        />

        <View style={styles.mainContent}>
          <DashboardHeader
            onSearch={(query) => setSearchQuery(query)}
            searchPlaceholder="Search tasks, vehicles..."
            showSearch={activeNav === "dashboard"}
            showNotifications={true}
            currentPage={
              navItems.find((item) => item.id === activeNav)?.label
            }
            searchValue={searchQuery}
          />

          <View style={styles.contentArea}>{renderContent()}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB", // bg-gray-50
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  contentArea: {
    flex: 1,
  },
});

