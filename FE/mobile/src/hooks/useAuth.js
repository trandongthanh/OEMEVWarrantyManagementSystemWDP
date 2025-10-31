import React, { useState, useEffect, useContext, createContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      await authService.login(username, password);
      const userInfo = await authService.getUserInfo();
      setUser(userInfo);
      return userInfo;
    } catch (err) {
      setError(err.message || "Login failed");
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null); 
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

