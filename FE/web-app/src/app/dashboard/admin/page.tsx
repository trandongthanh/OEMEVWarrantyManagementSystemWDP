"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Home, UserPlus } from "lucide-react";
import { authService } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import { Sidebar, DashboardHeader } from "@/components/dashboard";
import { CreateUserAccount } from "@/components/dashboard/managerdashboard/CreateUserAccount";

interface CurrentUser {
  userId: string;
  roleName: string;
}

export default function AdminDashboard() {
  // Protect route: only allow emv_admin
  useRoleProtection(["emv_admin"]);

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "create-user", icon: UserPlus, label: "Create User Account" },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case "create-user":
        return <CreateUserAccount />;

      case "dashboard":
        return (
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mb-8">
                Welcome back, EMV Administrator
              </p>

              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <UserPlus className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        User Management
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Create and manage user accounts across the system
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNav("create-user")}
                    className="mt-4 w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                  >
                    Create User Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

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
        navItems={navItems}
        brandIcon={UserPlus}
        brandName="EMV Admin"
        brandSubtitle="System Administration"
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onSearch={() => {}}
          onNavigate={setActiveNav}
          searchPlaceholder="Search..."
          showSearch={false}
          showNotifications={true}
          currentPage={
            activeNav === "dashboard"
              ? undefined
              : navItems.find((item) => item.id === activeNav)?.label
          }
        />

        {renderContent()}
      </div>
    </div>
  );
}
