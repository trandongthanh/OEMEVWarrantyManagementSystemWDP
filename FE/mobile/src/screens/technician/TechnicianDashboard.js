import { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView, StatusBar } from "react-native";

// ✅ SỬA ĐỔI: Dùng icon phiên bản mobile
import { Home, ClipboardList, Clock, FileText } from "lucide-react-native";

// ✅ Giữ nguyên: Các service và hook này không thay đổi
import { authService } from "../../services";
import { useRoleProtection } from "../../hooks/useRoleProtection";

// ⚠️ CẢNH BÁO: Các component này BẮT BUỘC phải được tạo lại cho mobile
// Nếu chưa tạo, ứng dụng sẽ báo lỗi.
// Tôi sẽ tạm comment chúng ra để code có thể chạy được.
/*
import {
  DashboardOverview,
  MyTasks,
  PartsInventory,
  WorkHistory,
} from "../../components/dashboard/techniciandashboard";
*/

// ✅ SỬA ĐỔI: Dùng các component mobile bạn đã tạo
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

// Component tạm thời để thay thế, tránh lỗi
const PlaceholderComponent = ({ name }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 18, color: "#666" }}>{name} Content</Text>
  </View>
);
const DashboardOverview = () => <PlaceholderComponent name="Dashboard Overview" />;
const MyTasks = () => <PlaceholderComponent name="My Tasks" />;
const PartsInventory = () => <PlaceholderComponent name="Parts Inventory" />;
const WorkHistory = () => <PlaceholderComponent name="Work History" />;


export default function TechnicianDashboard({ navigation }) {
  // ✅ Giữ nguyên: Logic hook bảo vệ route
  useRoleProtection(["service_center_technician"]);

  // ✅ Giữ nguyên: Toàn bộ logic state
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Mặc định thu gọn trên mobile
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // ⚠️ QUAN TRỌNG: authService phải được sửa để dùng AsyncStorage
    // thay vì localStorage.
    const userInfo = authService.getUserInfo();
    console.log("📋 User Info from storage:", userInfo);

    if (userInfo) {
      setCurrentUser(userInfo);
    } else {
      const user = authService.getCurrentUser();
      console.log("⚠️ No stored user info, using token data:", user);
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    // Sau khi logout, reset về màn hình Login
    authService.logout();
    navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
    });
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "tasks", icon: ClipboardList, label: "My Tasks" },
    { id: "history", icon: Clock, label: "Work History" },
  ];

  // ✅ Giữ nguyên: Logic render nội dung chính
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

  // ✅ SỬA ĐỔI HOÀN TOÀN: Cấu trúc JSX dùng component của React Native
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/*
          Sidebar trên mobile thường là một Drawer.
          Phiên bản này mô phỏng lại giao diện web.
        */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          navItems={navItems}
          brandIcon={FileText}
          brandName="Technician"
          brandSubtitle="Workspace"
          currentUser={currentUser}
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

          <View style={styles.contentArea}>
            {renderContent()}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ✅ SỬA ĐỔI: Dùng StyleSheet để tạo kiểu
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
    padding: 16,
  },
});
