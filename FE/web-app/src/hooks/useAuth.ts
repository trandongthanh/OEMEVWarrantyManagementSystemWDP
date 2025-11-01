import { useState, useEffect, useCallback } from "react";
import { authService, DecodedToken } from "@/services/authService";
import { useRouter } from "next/navigation";

/**
 * Authentication Hook
 * Manages authentication state and provides auth-related functions
 */

interface UseAuthReturn {
  user: DecodedToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

/**
 * Get dashboard route based on user role
 */
function getDashboardRouteByRole(roleName: string): string {
  const roleRoutes: Record<string, string> = {
    service_center_staff: "/dashboard/staff",
    service_center_technician: "/dashboard/technician",
    service_center_manager: "/dashboard/manager",
    emv_staff: "/dashboard/emv_staff",
    parts_coordinator_company: "/dashboard/company",
    parts_coordinator_service_center: "/dashboard/parts-coordinator",
  };

  return roleRoutes[roleName] || "/dashboard";
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(
    async (username: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Call login service
        const token = await authService.login({ username, password });

        // Decode token and set user
        const decodedUser = authService.decodeToken(token);
        setUser(decodedUser);
        setIsAuthenticated(true);

        // Role-based redirect to appropriate dashboard
        const dashboardRoute = getDashboardRouteByRole(decodedUser.roleName);
        router.push(dashboardRoute);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        setIsAuthenticated(false);
        setUser(null);
        throw err; // Re-throw for component-level handling
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
  };
}
