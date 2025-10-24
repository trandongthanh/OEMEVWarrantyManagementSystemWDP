import React, { useState, useEffect, useContext, createContext } from 'react';
// ✅ SỬA ĐỔI: Import authService đúng cách
import authService from '../services/authService';

// 1. Tạo Context để chứa thông tin auth
const AuthContext = createContext(null);

// 2. Tạo Provider: component này sẽ bao bọc toàn bộ ứng dụng của bạn
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hàm này sẽ được gọi khi ứng dụng khởi động để kiểm tra
    // xem người dùng đã đăng nhập từ phiên trước chưa.
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const userInfo = await authService.getUserInfo();
        if (userInfo) {
          setUser(userInfo);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to check auth status", e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setIsLoading(true);
      // Gọi service để đăng nhập
      await authService.login(username, password);
      // Lấy thông tin người dùng sau khi đăng nhập thành công
      const userInfo = await authService.getUserInfo();
      setUser(userInfo);
      return userInfo; // Trả về thông tin user để màn hình Login xử lý điều hướng
    } catch (err) {
      setError(err.message || "Login failed");
      setUser(null);
      throw err; // Ném lỗi ra để component có thể bắt và hiển thị
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null); // Xóa thông tin người dùng trong state
    setError(null);
  };

  // Cung cấp các giá trị cho các component con
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Tạo custom hook để dễ dàng sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

