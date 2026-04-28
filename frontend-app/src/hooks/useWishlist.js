import { useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/wishlist.api';

// Module-level shared state - all components using this hook share this data
let sharedWishlist = [];
let sharedWishlistCount = 0;
let sharedLoading = false;
let sharedError = null;
const listeners = new Set();

function notifyListeners() {
    listeners.forEach(cb => cb());
}

function updateState(newWishlist, newCount, newLoading, newError) {
    sharedWishlist = newWishlist;
    sharedWishlistCount = newCount;
    sharedLoading = newLoading;
    sharedError = newError;
    notifyListeners();
}

async function loadWishlistData() {
    try {
        updateState(sharedWishlist, sharedWishlistCount, true, null);
        const response = await wishlistApi.getWishlist();
        const products = response.data?.products || [];
        updateState(products, products.length, false, null);
    } catch (err) {
        updateState(sharedWishlist, sharedWishlistCount, false, err.response?.data?.message || 'Failed to load wishlist');
        console.error('Error loading wishlist:', err);
    }
}

async function addItem(productId) {
    try {
        const response = await wishlistApi.addToWishlist(productId);
        const products = response.data?.products || [];
        updateState(products, products.length, false, null);
    } catch (err) {
        updateState(sharedWishlist, sharedWishlistCount, false, err.response?.data?.message || 'Failed to add');
        throw err;
    }
}

async function removeItem(productId) {
    try {
        const response = await wishlistApi.removeFromWishlist(productId);
        const products = response.data?.products || [];
        updateState(products, products.length, false, null);
    } catch (err) {
        updateState(sharedWishlist, sharedWishlistCount, false, err.response?.data?.message || 'Failed to remove');
        throw err;
    }
}

async function toggleItem(productId) {
    try {
        await wishlistApi.toggleWishlistItem(productId);
        await loadWishlistData();
    } catch (err) {
        updateState(sharedWishlist, sharedWishlistCount, false, err.response?.data?.message || 'Failed to toggle');
        throw err;
    }
}

async function clearItems() {
    try {
        await wishlistApi.clearWishlist();
        updateState([], 0, false, null);
    } catch (err) {
        updateState(sharedWishlist, sharedWishlistCount, false, err.response?.data?.message || 'Failed to clear');
        throw err;
    }
}

export const useWishlist = () => {
    // Force re-render when shared state changes
    const [, setTick] = useState(0);

    useEffect(() => {
        const listener = () => setTick(t => t + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    const loadWishlist = useCallback(async () => {
        await loadWishlistData();
    }, []);

    const addToWishlist = useCallback(async (productId) => {
        await addItem(productId);
    }, []);

    const removeFromWishlist = useCallback(async (productId) => {
        await removeItem(productId);
    }, []);

    const toggleWishlistItem = useCallback(async (productId) => {
        await toggleItem(productId);
    }, []);

    const clearWishlist = useCallback(async () => {
        await clearItems();
    }, []);

    const isProductInWishlist = useCallback((productId) => {
        return sharedWishlist.some(item => item._id === productId);
    }, []);

    return {
        wishlist: sharedWishlist,
        wishlistCount: sharedWishlistCount,
        loading: sharedLoading,
        error: sharedError,
        loadWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlistItem,
        clearWishlist,
        isProductInWishlist
    };
};
