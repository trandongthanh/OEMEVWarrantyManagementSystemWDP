"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Home, TrendingDown, FileText, BarChart3 } from "lucide-react";
import { authService } from "@/services";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import { Sidebar, DashboardHeader } from "@/components/dashboard";

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
    {
      id: "problematic-models",
      icon: TrendingDown,
      label: "Problematic Models",
    },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
  ];

  const renderContent = () => {
    switch (activeNav) {
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      System Analytics
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    View comprehensive system statistics and performance metrics
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Vehicle Issues
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Track and analyze problematic vehicle models
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reports
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Generate and export detailed system reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                System Analytics
              </h1>
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Analytics features coming soon</p>
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
        brandIcon={FileText}
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
