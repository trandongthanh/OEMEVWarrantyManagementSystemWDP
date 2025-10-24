import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './useAuth'; // Sử dụng hook auth đã cập nhật

/**
 * Hook để bảo vệ màn hình (route) dựa trên vai trò người dùng.
 * Nếu không có quyền, sẽ điều hướng về màn hình Login.
 * @param {string[]} allowedRoles - Mảng các vai trò được phép truy cập.
 */
export const useRoleProtection = (allowedRoles = []) => {
  const navigation = useNavigation();
  const { user, isLoading, logout } = useAuth(); // Lấy trạng thái user và loading

  useEffect(() => {
    // Bỏ qua kiểm tra nếu auth context đang trong trạng thái loading
    if (isLoading) {
      return;
    }

    const hasAccess = user && allowedRoles.includes(user.roleName);

    // Nếu kiểm tra xong mà không có user, hoặc role không được phép
    if (!hasAccess) {
      console.warn(
        `[Role Protection] Access Denied. User role: "${user?.roleName}". Required: "${allowedRoles.join(
          ", "
        )}". Redirecting to Login.`
      );
      
      // Đảm bảo logout sạch sẽ trước khi điều hướng
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [user, isLoading, navigation]); // Effect sẽ chạy lại khi user hoặc isLoading thay đổi
};

