import { useState, useCallback } from 'react';
import { productApi } from '../api/product.api';

export const useProductApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getProducts = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.getProducts(params);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch products';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getVendorProducts = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.getVendorProducts(params);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor products';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const searchProducts = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.searchProducts(params);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Search failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getPopularProducts = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.getPopularProducts(params);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch popular products';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getProduct = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.getProduct(id);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch product';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduct = useCallback(async (productData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.createProduct(productData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create product';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProduct = useCallback(async (id, productData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.updateProduct(id, productData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update product';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await productApi.deleteProduct(id);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete product';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const addProductImages = useCallback(async (productId, images) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.addProductImages(productId, images);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add product images';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeProductImage = useCallback(async (productId, imageIndex) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.removeProductImage(productId, imageIndex);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to remove product image';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAvailability = useCallback(async (productId, isAvailable) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.updateAvailability(productId, isAvailable);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update product availability';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateInventory = useCallback(async (productId, inventoryData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.updateInventory(productId, inventoryData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update product inventory';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getProducts,
        getVendorProducts,
        searchProducts,
        getPopularProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        addProductImages,
        removeProductImage,
        updateAvailability,
        updateInventory,
        loading,
        error
    };
};
