// hooks/useAuthApi.js
import { useCallback } from 'react';
import { useApiCall } from './useApiCall';
import { authApi } from '../api/auth.api';
import { tokenService } from '../services/token.service';
import { useAuth } from '../context/AuthContext';

 const useAuthApi = () => {
    const { executeCall, loading, error, resetError } = useApiCall();
    const { login: authLogin } = useAuth();

    const login = useCallback(async (credentials) => {
        const result = await executeCall(authApi.login, credentials);
        
        if (result.success) {
            const { user, token } = result.data.data;
            tokenService.setToken(token);
            await authLogin(user);
            return { success: true, user };
        }
        
        return { success: false, message: result.message };
    }, [executeCall, authLogin]);

    const register = useCallback(async (userData) => {
        const result = await executeCall(authApi.register, userData);
        
        if (result.success) {
            const { user, token } = result.data.data;
            tokenService.setToken(token);
            await authLogin(user);
            return { success: true, user };
        }
        
        return { success: false, message: result.message };
    }, [executeCall, authLogin]);

    const logout = useCallback(async () => {
        const result = await executeCall(authApi.logout);
        if (result.success) {
            tokenService.removeToken();
            return { success: true };
        }
        return { success: false, message: result.message };
    }, [executeCall]);

    return { login, register, logout, loading, error, resetError };
};

export default useAuthApi;