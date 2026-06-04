import { useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart.api';
import { useAuth } from '../context/AuthContext';

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
        console.log('Cart API response:', response.data);
        
        // Handle different response structures
        const cart = response.data?.data || response.data || emptyCart();
        console.log('Parsed cart data:', cart);
        updateState(cart, false, null);
    } catch (err) {
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to load cart');
        console.error('Error loading cart:', err);
    }
}

async function addItem(productId, quantity = 1) {
    try {
        console.log('Adding to cart:', { productId, quantity });
        const response = await cartApi.addToCart({ productId, quantity });
        console.log('Add to cart response:', response.data);
        
        const cart = response.data?.data || response.data || emptyCart();
        console.log('Updated cart:', cart);
        updateState(cart, false, null);
        return cart;
    } catch (err) {
        console.error('Add to cart error:', err);
        updateState(sharedCart, false, err.response?.data?.message || 'Failed to add to cart');
        throw err;
    }
}

async function updateQuantity(itemId, quantity) {
    try {
        const response = await cartApi.updateItemQuantity(itemId, quantity);
        const cart = response.data?.data || response.data || emptyCart();
        updateState(cart, false, null);
        return cart;
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
        return cart;
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
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const listener = () => setTick(t => t + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    // Load cart when auth state changes
    useEffect(() => {
        if (isAuthenticated) {
            loadCartData();
        } else {
            updateState(emptyCart(), false, null);
        }
    }, [isAuthenticated]);

    const loadCart = useCallback(async () => {
        await loadCartData();
    }, []);

    const addToCart = useCallback(async (productId, quantity = 1) => {
        return await addItem(productId, quantity);
    }, []);

    const updateItemQuantity = useCallback(async (itemId, quantity) => {
        return await updateQuantity(itemId, quantity);
    }, []);

    const removeFromCart = useCallback(async (itemId) => {
        return await removeItem(itemId);
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

    // Helper method to check if a product is in cart
    const isInCart = useCallback((productId) => {
        if (!sharedCart.items || !Array.isArray(sharedCart.items)) return false;
        return sharedCart.items.some(item => {
            // Handle both itemId and productId fields
            const itemProductId = item.productId?._id || item.productId || item.itemId;
            return itemProductId === productId;
        });
    }, []);

    // Helper method to get quantity of a product in cart
    const getCartQuantity = useCallback((productId) => {
        if (!sharedCart.items || !Array.isArray(sharedCart.items)) return 0;
        const item = sharedCart.items.find(item => {
            const itemProductId = item.productId?._id || item.productId || item.itemId;
            return itemProductId === productId;
        });
        return item?.quantity || 0;
    }, []);

    // Helper method to update product quantity directly using productId
    const updateProductQuantity = useCallback(async (productId, quantity) => {
        try {
            // Find the cart item by productId
            if (!sharedCart.items || !Array.isArray(sharedCart.items)) return;
            
            const cartItem = sharedCart.items.find(item => {
                const itemProductId = item.productId?._id || item.productId || item.itemId;
                return itemProductId === productId;
            });
            
            if (cartItem) {
                const itemId = cartItem._id || cartItem.id;
                if (quantity === 0) {
                    await removeItem(itemId);
                } else {
                    await updateQuantity(itemId, quantity);
                }
            } else if (quantity > 0) {
                await addItem(productId, quantity);
            }
        } catch (err) {
            console.error('Error updating product quantity:', err);
            throw err;
        }
    }, []);

    // Helper method to get cart total
    const getCartTotal = useCallback(() => {
        return sharedCart.total || sharedCart.subtotal || 0;
    }, []);

    // Helper method to get item count
    const getItemCount = useCallback(() => {
        return sharedCart.itemCount || sharedCart.totalQuantity || 0;
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
        removeCoupon,
        // New helper methods for product card
        isInCart,
        getCartQuantity,
        updateProductQuantity,
        getCartTotal,
        getItemCount
    };
};