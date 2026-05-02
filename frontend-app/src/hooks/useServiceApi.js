import { useState, useCallback } from 'react';
import { serviceApi } from '../api/service.api';

export const useServiceApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to handle API calls with loading and error states
    const handleApiCall = useCallback(async (apiCall, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall(...args);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // =========================
    // VENDOR OPERATIONS
    // =========================

    const createService = useCallback((serviceData) => {
        return handleApiCall(serviceApi.createService, serviceData);
    }, [handleApiCall]);

    const getMyServices = useCallback((params) => {
        return handleApiCall(serviceApi.getMyServices, params);
    }, [handleApiCall]);

    const updateService = useCallback((serviceId, serviceData) => {
        return handleApiCall(serviceApi.updateService, serviceId, serviceData);
    }, [handleApiCall]);

    const deleteService = useCallback((serviceId) => {
        return handleApiCall(serviceApi.deleteService, serviceId);
    }, [handleApiCall]);

    // =========================
    // PUBLIC OPERATIONS
    // =========================

    const getAllServices = useCallback((params) => {
        return handleApiCall(serviceApi.getAllServices, params);
    }, [handleApiCall]);

    const getService = useCallback((serviceId) => {
        return handleApiCall(serviceApi.getService, serviceId);
    }, [handleApiCall]);

    const getVendorServices = useCallback((vendorId, params) => {
        return handleApiCall(serviceApi.getVendorServices, vendorId, params);
    }, [handleApiCall]);

    const searchServices = useCallback((searchParams) => {
        return handleApiCall(serviceApi.searchServices, searchParams);
    }, [handleApiCall]);

    const getServiceCategories = useCallback(() => {
        return handleApiCall(serviceApi.getServiceCategories);
    }, [handleApiCall]);

    return {
        // State
        loading,
        error,
        
        // Vendor operations
        createService,
        getMyServices,
        updateService,
        deleteService,
        
        // Public operations
        getAllServices,
        getService,
        getVendorServices,
        searchServices,
        getServiceCategories,
        
        // Utility
        clearError: () => setError(null)
    };
};
