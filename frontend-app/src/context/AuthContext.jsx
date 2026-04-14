import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('AuthContext - Checking authentication...');
        const token = localStorage.getItem('token');
        console.log('AuthContext - Token found:', !!token);
        
        if (token) {
            try {
                console.log('AuthContext - Making profile request...');
                const response = await authApi.getProfile();
                console.log('AuthContext - Profile response:', response);
                setUser(response.data.data);
                setIsAuthenticated(true);
                console.log('AuthContext - User authenticated:', response.data.data);
            } catch (error) {
                console.error('AuthContext - Error checking auth:', error);
                localStorage.removeItem('token');
                setUser(null);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
        console.log('AuthContext - Authentication check completed');
    };

    const login = async (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
