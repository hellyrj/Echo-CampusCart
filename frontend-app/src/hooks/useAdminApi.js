import { useState, useCallback } from 'react';
import { adminApi } from '../api/admin.api';

export const useAdminApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Vendor Management
    const getVendorApplications = useCallback(async (status) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getVendorApplications(status);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor applications';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllVendors = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getAllVendors(filters);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendors';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getVendorDetails = useCallback(async (vendorId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getVendorDetails(vendorId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor details';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const approveVendorApplication = useCallback(async (vendorId, approvalData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.approveVendorApplication(vendorId, approvalData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to approve vendor application';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const rejectVendorApplication = useCallback(async (vendorId, rejectionData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.rejectVendorApplication(vendorId, rejectionData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to reject vendor application';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleVendorStatus = useCallback(async (vendorId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.toggleVendorStatus(vendorId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to toggle vendor status';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // User Management
    const getAllUsers = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getAllUsers(filters);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch users';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserDetails = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getUserDetails(userId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch user details';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserRole = useCallback(async (userId, role) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.updateUserRole(userId, role);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update user role';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleUserStatus = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.toggleUserStatus(userId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to toggle user status';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // System Management
    const getSystemStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getSystemStats();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch system stats';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // University Management
    const getUniversities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getUniversities();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch universities';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const addUniversity = useCallback(async (universityData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.addUniversity(universityData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add university';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUniversity = useCallback(async (universityId, universityData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.updateUniversity(universityId, universityData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update university';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUniversity = useCallback(async (universityId) => {
        setLoading(true);
        setError(null);
        try {
            await adminApi.deleteUniversity(universityId);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete university';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Content Management
    const getAllProducts = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getAllProducts(filters);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch products';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProductStatus = useCallback(async (productId, status) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.updateProductStatus(productId, status);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update product status';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (productId) => {
        setLoading(true);
        setError(null);
        try {
            await adminApi.deleteProduct(productId);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete product';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Reports & Analytics
    const getVendorApplicationsReport = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getVendorApplicationsReport(filters);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch vendor applications report';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getSalesReport = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getSalesReport(filters);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch sales report';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserActivityReport = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getUserActivityReport(filters);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch user activity report';
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
        // Vendor Management
        getVendorApplications,
        getAllVendors,
        getVendorDetails,
        approveVendorApplication,
        rejectVendorApplication,
        toggleVendorStatus,
        
        // User Management
        getAllUsers,
        getUserDetails,
        updateUserRole,
        toggleUserStatus,
        
        // System Management
        getSystemStats,
        
        // University Management
        getUniversities,
        addUniversity,
        updateUniversity,
        deleteUniversity,
        
        // Content Management
        getAllProducts,
        updateProductStatus,
        deleteProduct,
        
        // Reports & Analytics
        getVendorApplicationsReport,
        getSalesReport,
        getUserActivityReport,
        
        // State
        loading,
        error,
        resetError
    };
};
