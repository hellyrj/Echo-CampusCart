import { useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

export const useAuthApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login: authLogin, user } = useAuth();

    const login = useCallback(async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.login(credentials);
            const { user, token } = response.data.data;
            
            localStorage.setItem('token', token);
            await authLogin(user);
            
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [authLogin]);

    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.register(userData);
            const { user, token } = response.data.data;
            
            localStorage.setItem('token', token);
            await authLogin(user);
            
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [authLogin]);

    const getProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.getProfile();
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch profile';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return { login, register, getProfile, loading, error, resetError };
};
