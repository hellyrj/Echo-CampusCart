import { useState, useCallback } from 'react';
import { vendorApi } from '../api/vendor.api';

export const useVendorApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createVendor = useCallback(async (vendorData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.createVendor(vendorData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create vendor';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getNearbyVendors = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getNearbyVendors(params);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch nearby vendors';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getVendor = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getVendor(id);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateVendor = useCallback(async (id, vendorData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.updateVendor(id, vendorData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update vendor';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteVendor = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await vendorApi.deleteVendor(id);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete vendor';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createVendor,
        getNearbyVendors,
        getVendor,
        updateVendor,
        deleteVendor,
        loading,
        error
    };
};
