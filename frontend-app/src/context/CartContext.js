import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../api/axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Load cart from backend when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            loadCartFromBackend();
        } else {
            // Clear cart when logged out
            setCartItems([]);
            // Load guest cart from localStorage
            loadCartFromLocalStorage();
        }
    }, [isAuthenticated, user]);

    const loadCartFromBackend = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/cart');
            if (response.data.success) {
                setCartItems(response.data.data.items || []);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            loadCartFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    const loadCartFromLocalStorage = () => {
        try {
            const savedCart = localStorage.getItem('guestCart');
            if (savedCart) {
                const guestCart = JSON.parse(savedCart);
                setCartItems(guestCart);
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        }
    };

    // Merge guest cart with backend cart when logging in
    const mergeGuestCartWithBackend = async (guestCart) => {
        setIsSyncing(true);
        try {
            for (const item of guestCart) {
                await axiosInstance.post('/cart/add', {
                    productId: item.productId,
                    quantity: item.quantity
                });
            }
            // Clear guest cart after merge
            localStorage.removeItem('guestCart');
            // Reload cart from backend
            await loadCartFromBackend();
        } catch (error) {
            console.error('Error merging cart:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Save guest cart to localStorage when not authenticated
    useEffect(() => {
        if (!isAuthenticated && cartItems.length > 0) {
            localStorage.setItem('guestCart', JSON.stringify(cartItems));
        }
    }, [cartItems, isAuthenticated]);

    const addToCart = async (productId, quantity = 1) => {
        setLoading(true);
        try {
            if (isAuthenticated) {
                const response = await axiosInstance.post('/cart/add', { productId, quantity });
                if (response.data.success) {
                    await loadCartFromBackend();
                    return true;
                }
            } else {
                // Add to local cart (guest)
                setCartItems(prev => {
                    const existing = prev.find(item => item.productId === productId);
                    if (existing) {
                        return prev.map(item =>
                            item.productId === productId
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    }
                    return [...prev, { productId, quantity, product: null }];
                });
                return true;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        setLoading(true);
        try {
            if (isAuthenticated) {
                await axiosInstance.delete(`/cart/remove/${productId}`);
                await loadCartFromBackend();
            } else {
                setCartItems(prev => prev.filter(item => item.productId !== productId));
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        setLoading(true);
        try {
            if (isAuthenticated) {
                await axiosInstance.put(`/cart/update/${productId}`, { quantity });
                await loadCartFromBackend();
            } else {
                setCartItems(prev =>
                    prev.map(item =>
                        item.productId === productId ? { ...item, quantity } : item
                    )
                );
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item.productId === productId);
    };

    const getCartQuantity = (productId) => {
        const item = cartItems.find(item => item.productId === productId);
        return item?.quantity || 0;
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.product?.basePrice || item.product?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const clearCart = async () => {
        setLoading(true);
        try {
            if (isAuthenticated) {
                await axiosInstance.delete('/cart/clear');
                setCartItems([]);
            } else {
                setCartItems([]);
                localStorage.removeItem('guestCart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCart = async () => {
        if (isAuthenticated) {
            await loadCartFromBackend();
        } else {
            loadCartFromLocalStorage();
        }
    };

    // Return the provider with all values - NO JSX SYNTAX HERE
    return React.createElement(
        CartContext.Provider,
        {
            value: {
                cartItems,
                loading,
                isSyncing,
                addToCart,
                removeFromCart,
                updateQuantity,
                isInCart,
                getCartQuantity,
                getCartTotal,
                clearCart,
                loadCart
            }
        },
        children
    );
};