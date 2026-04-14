import axiosInstance from './axios';

export const adminApi = {
    // =========================
    // VENDOR MANAGEMENT
    // =========================
    
    // Get all vendor applications (with optional status filter)
    // Query params: ?status=pending|approved|rejected
    getVendorApplications: (status) => {
        const params = status ? { status } : {};
        return axiosInstance.get('/admin/applications', { params });
    },
    
    // Get all vendors with filters
    // Query params: ?isApproved=true|false&isActive=true|false
    getAllVendors: (filters) => {
        return axiosInstance.get('/admin', { params: filters });
    },
    
    // Get single vendor details
    getVendorDetails: (vendorId) => axiosInstance.get(`/admin/${vendorId}`),
    
    // Approve vendor application
    approveVendorApplication: (vendorId, approvalData) => {
        return axiosInstance.patch(`/admin/${vendorId}/approve`, approvalData);
    },
    
    // Reject vendor application
    rejectVendorApplication: (vendorId, rejectionData) => {
        return axiosInstance.patch(`/admin/${vendorId}/reject`, rejectionData);
    },
    
    // Toggle vendor active status (activate/deactivate)
    toggleVendorStatus: (vendorId) => {
        return axiosInstance.patch(`/admin/${vendorId}/toggle-status`);
    },
    
    // =========================
    // USER MANAGEMENT
    // =========================
    
    // Get all users
    getAllUsers: (filters) => {
        return axiosInstance.get('/admin/users', { params: filters });
    },
    
    // Get user details
    getUserDetails: (userId) => axiosInstance.get(`/admin/users/${userId}`),
    
    // Update user role
    updateUserRole: (userId, role) => {
        return axiosInstance.patch(`/admin/users/${userId}/role`, { role });
    },
    
    // Toggle user active status
    toggleUserStatus: (userId) => {
        return axiosInstance.patch(`/admin/users/${userId}/toggle-status`);
    },
    
    // =========================
    // SYSTEM MANAGEMENT
    // =========================
    
    // Get system statistics
    getSystemStats: () => axiosInstance.get('/admin/stats'),
    
    // Get universities management
    getUniversities: () => axiosInstance.get('/admin/universities'),
    
    // Add university
    addUniversity: (universityData) => {
        return axiosInstance.post('/admin/universities', universityData);
    },
    
    // Update university
    updateUniversity: (universityId, universityData) => {
        return axiosInstance.put(`/admin/universities/${universityId}`, universityData);
    },
    
    // Delete university
    deleteUniversity: (universityId) => {
        return axiosInstance.delete(`/admin/universities/${universityId}`);
    },
    
    // =========================
    // CONTENT MANAGEMENT
    // =========================
    
    // Get all products (admin view)
    getAllProducts: (filters) => {
        return axiosInstance.get('/admin/products', { params: filters });
    },
    
    // Update product status
    updateProductStatus: (productId, status) => {
        return axiosInstance.patch(`/admin/products/${productId}/status`, { status });
    },
    
    // Delete product
    deleteProduct: (productId) => {
        return axiosInstance.delete(`/admin/products/${productId}`);
    },
    
    // =========================
    // REPORTS & ANALYTICS
    // =========================
    
    // Get vendor applications report
    getVendorApplicationsReport: (filters) => {
        return axiosInstance.get('/admin/reports/vendor-applications', { params: filters });
    },
    
    // Get sales report
    getSalesReport: (filters) => {
        return axiosInstance.get('/admin/reports/sales', { params: filters });
    },
    
    // Get user activity report
    getUserActivityReport: (filters) => {
        return axiosInstance.get('/admin/reports/user-activity', { params: filters });
    },
};
