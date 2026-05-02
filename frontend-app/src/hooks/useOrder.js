import { useState, useCallback } from 'react';
import { orderApi } from '../api/order.api';
import { useAuth } from '../context/AuthContext';

export const useOrder = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const createOrder = useCallback(async (orderData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.checkout(orderData);
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create order';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getMyOrders = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.getMyOrders(params);
            return { 
                success: true, 
                data: response.data?.data || response.data,
                pagination: response.data?.pagination 
            };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch orders';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getOrder = useCallback(async (orderId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.getOrder(orderId);
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch order';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const trackOrder = useCallback(async (orderNumber) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.trackOrder(orderNumber);
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to track order';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelOrder = useCallback(async (orderId, reason) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.cancelOrder(orderId, reason);
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to cancel order';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const validateCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.validateCart();
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to validate cart';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getOrderStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.getOrderStats();
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch order stats';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Vendor operations
    const getVendorOrders = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.getVendorOrders(params);
            return { 
                success: true, 
                data: response.data?.data || response.data,
                pagination: response.data?.pagination 
            };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch vendor orders';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = useCallback(async (orderId, status, note = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.updateOrderStatus(orderId, { status, note });
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update order status';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelVendorOrder = useCallback(async (orderId, reason) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderApi.cancelVendorOrder(orderId, reason);
            return { success: true, data: response.data?.data || response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to cancel vendor order';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createOrder,
        getMyOrders,
        getOrder,
        trackOrder,
        cancelOrder,
        validateCart,
        getOrderStats,
        getVendorOrders,
        updateOrderStatus,
        cancelVendorOrder,
        setError
    };
};