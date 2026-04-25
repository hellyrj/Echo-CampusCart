import { useState, useCallback } from 'react';
import { vendorApi } from '../api/vendor.api';

export const useVendorApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Vendor Application
    const submitVendorApplication = useCallback(async (applicationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.submitVendorApplication(applicationData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to submit vendor application';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Public Vendor Operations
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

    const getApprovedVendors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getApprovedVendors();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch approved vendors';
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
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getVendorDetails = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getVendor(id);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor details';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getVendorProducts = useCallback(async (vendorId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getVendorProducts(vendorId);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor products';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Authenticated Vendor Operations
    const getMyVendorProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getMyVendorProfile();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor profile';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Utility Operations
    const getUniversities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getUniversities();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch universities';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await vendorApi.getCategories();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getFileUrl = useCallback((fileId) => {
        return vendorApi.getFile(fileId);
    }, []);

    // Legacy operations (for backward compatibility)
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

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Vendor Application
        submitVendorApplication,
        
        // Public Operations
        getNearbyVendors,
        getApprovedVendors,
        getVendor,
        getVendorDetails,
        getVendorProducts,
        
        // Authenticated Vendor Operations
        getMyVendorProfile,
        
        // Utility Operations
        getUniversities,
        getCategories,
        getFileUrl,
        
        // Legacy Operations
        updateVendor,
        deleteVendor,
        
        // State
        loading,
        error,
        resetError
    };
};
