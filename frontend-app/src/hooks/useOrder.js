import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/order.api';

// Module-level shared state
let sharedOrders = [];
let sharedOrderGroups = [];
let sharedLoading = false;
let sharedError = null;
const listeners = new Set();

function notifyListeners() {
    listeners.forEach(cb => cb());
}

function updateState(newOrders, newOrderGroups, newLoading, newError) {
    sharedOrders = newOrders;
    sharedOrderGroups = newOrderGroups;
    sharedLoading = newLoading;
    sharedError = newError;
    notifyListeners();
}

async function loadOrders() {
    try {
        updateState(sharedOrders, sharedOrderGroups, true, null);
        const response = await orderApi.getStudentOrders();
        const orders = response.data?.data || response.data || [];
        updateState(orders, sharedOrderGroups, false, null);
    } catch (err) {
        updateState(sharedOrders, sharedOrderGroups, false, err.response?.data?.message || 'Failed to load orders');
        console.error('Error loading orders:', err);
    }
}

async function loadOrderGroups() {
    try {
        updateState(sharedOrders, sharedOrderGroups, true, null);
        const response = await orderApi.getStudentOrderGroups();
        const orderGroups = response.data?.data || response.data || [];
        updateState(sharedOrders, orderGroups, false, null);
    } catch (err) {
        updateState(sharedOrders, sharedOrderGroups, false, err.response?.data?.message || 'Failed to load order groups');
        console.error('Error loading order groups:', err);
    }
}

async function analyzeCart() {
    try {
        const response = await orderApi.analyzeCart();
        return response.data?.data || response.data || {};
    } catch (err) {
        console.error('Error analyzing cart:', err);
        throw err;
    }
}

async function checkout(checkoutData) {
    try {
        const response = await orderApi.checkout(checkoutData);
        const result = response.data?.data || response.data;
        
        // Reload orders after successful checkout
        await loadOrders();
        await loadOrderGroups();
        
        return result;
    } catch (err) {
        const error = err.response?.data?.message || 'Checkout failed';
        updateState(sharedOrders, sharedOrderGroups, false, error);
        throw err;
    }
}

async function updateStatus(orderId, status) {
    try {
        const response = await orderApi.updateOrderStatus(orderId, status);
        const updatedOrder = response.data?.data || response.data;
        
        // Update local state
        const updatedOrders = sharedOrders.map(order => 
            order._id === orderId ? updatedOrder : order
        );
        updateState(updatedOrders, sharedOrderGroups, false, null);
        
        return updatedOrder;
    } catch (err) {
        console.error('Error updating order status:', err);
        throw err;
    }
}

async function updatePaymentStatus(orderId, paymentStatus) {
    try {
        const response = await orderApi.updatePaymentStatus(orderId, paymentStatus);
        const updatedOrder = response.data?.data || response.data;
        
        // Update local state
        const updatedOrders = sharedOrders.map(order => 
            order._id === orderId ? updatedOrder : order
        );
        updateState(updatedOrders, sharedOrderGroups, false, null);
        
        return updatedOrder;
    } catch (err) {
        console.error('Error updating payment status:', err);
        throw err;
    }
}

export const useOrder = () => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const listener = () => setTick(t => t + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    // Load orders on mount
    useEffect(() => {
        loadOrders();
        loadOrderGroups();
    }, []);

    return {
        // State
        orders: sharedOrders,
        orderGroups: sharedOrderGroups,
        loading: sharedLoading,
        error: sharedError,
        
        // Actions
        loadOrders: useCallback(loadOrders, []),
        loadOrderGroups: useCallback(loadOrderGroups, []),
        analyzeCart: useCallback(analyzeCart, []),
        checkout: useCallback(checkout, []),
        updateOrderStatus: useCallback(updateStatus, []),
        updatePaymentStatus: useCallback(updatePaymentStatus, [])
    };
};
