import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { tokenService } from '../services/token.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (tokenService.getToken()) {
        const response = await authApi.getProfile();
        setUser(response.data.data);
      }
    } catch (error) {
      tokenService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { user, token } = response.data.data;
    tokenService.setToken(token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    const { user, token } = response.data.data;
    tokenService.setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    tokenService.removeToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    role: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};