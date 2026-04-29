import { useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart.api';

// Module-level shared state - all components using this hook share this data
let sharedCart = { items: [], itemCount: 0, totalQuantity: 0, subtotal: 0, discountAmount: 0, total: 0 };
let sharedLoading = false;
let sharedError = null;
const listeners = new Set();

function notifyListeners() {
    listeners.forEach(cb => cb());
}

function updateState(newCart, newLoading, newError) {
    sharedCart = newCart;
    sharedLoading = newLoading;
    sharedError = newError;
    notifyListeners();
}

function emptyCart() {
    return { items: [], itemCount: 0, totalQuantity: 0, subtotal: 0, discountAmount: 0, total: 0 };
}

async function loadCartData() {
    try {
        updateState(sharedCart, true, null);
        const response = await cartApi.getCart();
        const cart = response.data?.data || response.data || emptyCart();
        updateState(cart, false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to load cart');
        console.error('Error loading cart:', err);
    }
}

async function addItem(productId, quantity = 1) {
    try {
        const response = await cartApi.addToCart({ productId, quantity });
        const cart = response.data?.data || response.data || emptyCart();
        updateState(cart, false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to add to cart');
        throw err;
    }
}

async function updateQuantity(itemId, quantity) {
    try {
        const response = await cartApi.updateItemQuantity(itemId, quantity);
        const cart = response.data?.data || response.data || emptyCart();
        updateState(cart, false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to update quantity');
        throw err;
    }
}

async function removeItem(itemId) {
    try {
        const response = await cartApi.removeFromCart(itemId);
        const cart = response.data?.data || response.data || emptyCart();
        updateState(cart, false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to remove item');
        throw err;
    }
}

async function clearAll() {
    try {
        await cartApi.clearCart();
        updateState(emptyCart(), false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to clear cart');
        throw err;
    }
}

async function applyCode(couponCode) {
    try {
        const response = await cartApi.applyCoupon(couponCode);
        const cart = response.data?.data || response.data || emptyCart();
        updateState(cart, false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Invalid coupon');
        throw err;
    }
}

async function removeCode() {
    try {
        const response = await cartApi.removeCoupon();
        const cart = response.data?.data || response.data || emptyCart();
        updateState(cart, false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to remove coupon');
        throw err;
    }
}

export const useCart = () => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const listener = () => setTick(t => t + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    const loadCart = useCallback(async () => {
        await loadCartData();
    }, []);

    const addToCart = useCallback(async (productId, quantity = 1) => {
        await addItem(productId, quantity);
    }, []);

    const updateItemQuantity = useCallback(async (itemId, quantity) => {
        await updateQuantity(itemId, quantity);
    }, []);

    const removeFromCart = useCallback(async (itemId) => {
        await removeItem(itemId);
    }, []);

    const clearCart = useCallback(async () => {
        await clearAll();
    }, []);

    const applyCoupon = useCallback(async (couponCode) => {
        await applyCode(couponCode);
    }, []);

    const removeCoupon = useCallback(async () => {
        await removeCode();
    }, []);

    return {
        cart: sharedCart,
        items: sharedCart.items || [],
        itemCount: sharedCart.itemCount || 0,
        totalQuantity: sharedCart.totalQuantity || 0,
        subtotal: sharedCart.subtotal || 0,
        discountAmount: sharedCart.discountAmount || 0,
        total: sharedCart.total || 0,
        coupon: sharedCart.coupon || null,
        loading: sharedLoading,
        error: sharedError,
        loadCart,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
    };
};
