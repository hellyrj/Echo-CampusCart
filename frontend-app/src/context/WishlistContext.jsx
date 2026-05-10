// context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../api/wishlist.api';

const WishlistContext = createContext();

export const useWishlistContext = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlistContext must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    // Load wishlist when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist();
        } else {
            setWishlist([]);
        }
    }, [isAuthenticated]);

    const loadWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlist([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await wishlistApi.getWishlist();
            console.log('Wishlist API response:', response.data);

            // Handle different response structures
            const products = response.data?.data?.products ||
                           response.data?.products ||
                           [];

            console.log('Loaded wishlist products:', products);
            setWishlist(products);
        } catch (err) {
            console.error('Error loading wishlist:', err);
            setError(err.response?.data?.message || 'Failed to load wishlist');
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const addToWishlist = useCallback(async (productId) => {
        try {
            setLoading(true);
            const response = await wishlistApi.addToWishlist(productId);
            console.log('Add to wishlist response:', response.data);

            // Reload wishlist to get updated data
            await loadWishlist();

            return response.data;
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadWishlist]);

    const removeFromWishlist = useCallback(async (productId) => {
        try {
            setLoading(true);
            const response = await wishlistApi.removeFromWishlist(productId);
            console.log('Remove from wishlist response:', response.data);

            // Reload wishlist to get updated data
            await loadWishlist();

            return response.data;
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadWishlist]);

    const toggleWishlistItem = useCallback(async (productId) => {
        try {
            setLoading(true);
            console.log('Toggling wishlist item:', productId);

            const response = await wishlistApi.toggleWishlistItem(productId);
            console.log('Toggle wishlist response:', response.data);

            // Reload wishlist to get updated data
            await loadWishlist();

            return response.data;
        } catch (err) {
            console.error('Error toggling wishlist:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadWishlist]);

    const clearWishlist = useCallback(async () => {
        try {
            setLoading(true);
            await wishlistApi.clearWishlist();
            setWishlist([]);
        } catch (err) {
            console.error('Error clearing wishlist:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const isProductInWishlist = useCallback((productId) => {
        return wishlist.some(item => item._id === productId);
    }, [wishlist]);

    const value = {
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        error,
        loadWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlistItem,
        clearWishlist,
        isProductInWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};