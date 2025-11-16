"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Home,
  ClipboardList,
  FileText,
  UserCog,
  CheckSquare,
  Calendar,
  Package,
  Layers,
  Warehouse,
  AlertCircle,
} from "lucide-react";
import { authService, userService, Technician } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import {
  Sidebar,
  DashboardHeader,
  ManagerDashboardOverview,
  CustomerManagement,
  CaseLineOperations,
  ScheduleManagement,
  StockTransferRequestList,
  AllCaseLinesList,
  WarehouseOverview,
  CreateUserAccount,
} from "@/components/dashboard";
import TaskAssignmentList from "@/components/dashboard/managerdashboard/TaskAssignmentList";
import { ManagerCasesList } from "@/components/dashboard/managerdashboard/ManagerCasesList";
import { MostProblematicModels } from "@/components/dashboard/managerdashboard";
interface CurrentUser {
  userId: string;
  roleName: string;
  serviceCenterId?: string;
}

export default function ManagerDashboard() {
  // Protect route: only allow managers
  useRoleProtection(["service_center_manager"]);

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);

  // Load current user + fetch data
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData(user);
  }, []);

  const fetchData = async (user: CurrentUser | null) => {
    try {
      const techData = await userService.getTechnicians();
      setTechnicians(techData);

      // Fetch warehouse for this service center
      if (user?.serviceCenterId) {
        const { warehouseService } = await import(
          "@/services/warehouseService"
        );
        const { warehouses } = await warehouseService.getWarehouseInfo();
        const warehouse = warehouses.find(
          (w) => w.serviceCenterId === user.serviceCenterId
        );
        if (warehouse) setWarehouseId(warehouse.warehouseId);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  // ==== Sidebar items ====
  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "customers", icon: UserCog, label: "Customers" },
    { id: "caselines", icon: CheckSquare, label: "Case Lines" },
    { id: "all-caselines", icon: Layers, label: "All Case Lines" },
    { id: "assign-tasks", icon: ClipboardList, label: "Assign Technicians" },
    { id: "tasks", icon: CheckSquare, label: "Task Assignments" },
    { id: "most-problematic", icon: AlertCircle, label: "Most Problematic Models" },
    { id: "schedules", icon: Calendar, label: "Schedules" },
    { id: "warehouse", icon: Warehouse, label: "Warehouse Stock" },
    { id: "transfers", icon: Package, label: "Stock Transfers" },
    // Menu CreateUserAccount chỉ hiển thị nếu manager/admin
    { id: "create-user", icon: UserCog, label: "Create User Account" },
  ];

  // ==== Render content theo activeNav ====
  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return <ManagerDashboardOverview technicians={technicians} />;
      case "customers":
        return <CustomerManagement />;
      case "caselines":
        return <CaseLineOperations />;
      case "all-caselines":
        return <AllCaseLinesList />;
      case "assign-tasks":
        return <ManagerCasesList />;
      case "tasks":
        return <TaskAssignmentList />;
      case "most-problematic":
        return <MostProblematicModels />;
      case "schedules":
        return <ScheduleManagement />;
      case "warehouse":
        return <WarehouseOverview />;
      case "transfers":
        return (
          <StockTransferRequestList
            userRole="service_center_manager"
            warehouseId={warehouseId || undefined}
            onRequestCreated={() => {
              // Refresh transfers list
            }}
          />
        );
      case "create-user":
        return <CreateUserAccount />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        navItems={navItems.filter(
          (item) =>
            item.id !== "create-user" ||
            currentUser?.roleName === "emv_admin" ||
            currentUser?.roleName === "service_center_manager"
        )} // chỉ admin/manager thấy
        brandIcon={FileText}
        brandName="Manager"
        brandSubtitle="Team Management"
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onSearch={(query) => setSearchQuery(query)}
          onNavigate={setActiveNav}
          searchPlaceholder={
            activeNav === "customers"
              ? "Search customers by name, email, or phone..."
              : "Search..."
          }
          showSearch={activeNav === "customers"}
          showNotifications={true}
          currentPage={
            activeNav === "dashboard"
              ? undefined
              : navItems.find((item) => item.id === activeNav)?.label
          }
          searchValue={searchQuery}
        />

        {renderContent()}
      </div>
    </div>
  );
}
