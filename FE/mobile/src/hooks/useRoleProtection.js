import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './useAuth';

/**
 * Hook để bảo vệ màn hình (route) dựa trên vai trò người dùng.
 * Nếu không có quyền, sẽ điều hướng về màn hình Login.
 * @param {string[]} allowedRoles - Mảng các vai trò được phép truy cập.
 */
export const useRoleProtection = (allowedRoles = []) => {
  const navigation = useNavigation();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const hasAccess = user && allowedRoles.includes(user.roleName);

    if (!hasAccess) {
      console.warn(
        `[Role Protection] Access Denied. User role: "${user?.roleName}". Required: "${allowedRoles.join(
          ", "
        )}". Redirecting to Login.`
      );
      
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [user, isLoading, navigation]);
};

