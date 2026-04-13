import axiosInstance from './axios';

export const vendorApi = {
    // Vendor application
    submitVendorApplication: (applicationData) => axiosInstance.post('/vendors/apply', applicationData),
    
    // Get vendor applications (admin only)
    getVendorApplications: (status) => axiosInstance.get('/vendors/applications', { params: { status } }),
    
    // Approve vendor application (admin only)
    approveVendorApplication: (id, approvalData) => axiosInstance.put(`/vendors/applications/${id}/approve`, approvalData),
    
    // Reject vendor application (admin only)
    rejectVendorApplication: (id, rejectionData) => axiosInstance.put(`/vendors/applications/${id}/reject`, rejectionData),
    
    // Get vendor by ID
    getVendor: (id) => axiosInstance.get(`/vendors/${id}`),
    
    // Get nearby vendors (public)
    getNearbyVendors: (params) => axiosInstance.get('/vendors/nearby', { params }),
    
    // Public endpoints
    getUniversities: () => axiosInstance.get('/universities'),
    getCategories: () => axiosInstance.get('/categories'),
    
    // Vendor-specific endpoints (for authenticated vendors)
    getMyVendorProfile: () => axiosInstance.get('/vendors/profile/me'),
    getAllMyVendorProfiles: () => axiosInstance.get('/vendors/profiles/me'),
    getMyProducts: () => axiosInstance.get('/vendors/products/me'),
    createMyProduct: (productData) => axiosInstance.post('/vendors/products', productData),
    updateMyProduct: (id, productData) => axiosInstance.put(`/vendors/products/${id}`, productData),
    deleteMyProduct: (id) => axiosInstance.delete(`/vendors/products/${id}`),
    
    // Update vendor (vendor owner only)
    updateVendor: (id, vendorData) => axiosInstance.put(`/vendors/${id}`, vendorData),
    
    // Delete vendor (vendor owner only)
    deleteVendor: (id) => axiosInstance.delete(`/vendors/${id}`),
};
