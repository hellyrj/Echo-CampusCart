import { useState, useCallback } from 'react';
import { categoryApi } from '../api/category.api';

export const useCategoryApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCategories = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryApi.getCategories(params);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategory = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryApi.getCategory(id);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch category';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (categoryData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryApi.createCategory(categoryData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create category';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCategory = useCallback(async (id, categoryData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryApi.updateCategory(id, categoryData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update category';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCategory = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await categoryApi.deleteCategory(id);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete category';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getCategories,
        getCategory,
        createCategory,
        updateCategory,
        deleteCategory,
        loading,
        error
    };
};
