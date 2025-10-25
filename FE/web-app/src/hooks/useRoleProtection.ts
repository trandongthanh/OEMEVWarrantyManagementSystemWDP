"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services";

/**
 * Hook to protect routes based on user role
 * Redirects to appropriate dashboard if user doesn't have required role
 */
export function useRoleProtection(allowedRoles: string[]) {
  const router = useRouter();

  useEffect(() => {
    const checkRole = () => {
      // Get user info
      const userInfo = authService.getUserInfo();
      const tokenUser = authService.getCurrentUser();
      const currentRole = userInfo?.roleName || tokenUser?.roleName;

      console.log("🔒 Role Protection Check:", {
        currentRole,
        allowedRoles,
        hasAccess: currentRole && allowedRoles.includes(currentRole),
      });

      // If no role found, redirect to login
      if (!currentRole) {
        console.warn("⚠️ No role found, redirecting to login");
        router.push("/login");
        return;
      }

      // Check if user has required role
      if (!allowedRoles.includes(currentRole)) {
        console.warn(
          `⚠️ Access denied. User role: ${currentRole}, Required: ${allowedRoles.join(
            " or "
          )}`
        );

        // Redirect to appropriate dashboard based on role
        switch (currentRole) {
          case "service_center_technician":
            router.push("/dashboard/technician");
            break;
          case "service_center_staff":
            router.push("/dashboard/staff");
            break;
          case "service_center_manager":
            router.push("/dashboard/manager");
            break;
          default:
            router.push("/login");
        }
      }
    };

    checkRole();
  }, [allowedRoles, router]);
}

export default useRoleProtection;
