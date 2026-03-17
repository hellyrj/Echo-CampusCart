import { useCallback } from 'react';
import { useApiCall } from './useApiCall';
import { authApi } from '../api/auth.api';
import { tokenService } from '../services/token.service';

export const useAuthApi = () => {
  const { executeCall, loading, error, resetError } = useApiCall();

  const login = useCallback(async (credentials) => {
    const result = await executeCall(authApi.login, credentials);
    if (result.success) {
      const { user, token } = result.data.data;
      tokenService.setToken(token);
      return { success: true, user };
    }
    return { success: false, message: result.message };
  }, [executeCall]);

  const register = useCallback(async (userData) => {
    const result = await executeCall(authApi.register, userData);
    if (result.success) {
      const { user, token } = result.data.data;
      tokenService.setToken(token);
      return { success: true, user };
    }
    return { success: false, message: result.message };
  }, [executeCall]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      tokenService.removeToken();
    }
  }, []);

  const getProfile = useCallback(async () => {
    const result = await executeCall(authApi.getProfile);
    return result;
  }, [executeCall]);

  return {
    login,
    register,
    logout,
    getProfile,
    loading,
    error,
    resetError
  };
};

export default useAuthApi;
