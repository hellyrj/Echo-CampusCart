import { useCallback } from 'react';
import { useApiCall } from './useApiCall';
import { authApi } from '../api/auth.api';
import { tokenService } from '../services/token.service';

export const useAuthApi = () => {
  const { executeCall, loading, error, resetError } = useApiCall();

  const login = useCallback(async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { user, token } = response.data.data;
      tokenService.setToken(token);
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  }, [executeCall]);

  const register = useCallback(async (userData) => {
    try {
      const response = await authApi.register(userData);
      const { user, token } = response.data.data;
      tokenService.setToken(token);
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  }, [executeCall]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      tokenService.removeToken();
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Logout failed' };
    }
  }, []);

  return { login, register, logout, loading, error, resetError };
};

export default useAuthApi;
