import axiosInstance from './axios';

export const vendorApi = {
    // =========================
    // PUBLIC ENDPOINTS
    // =========================
    
    // Get nearby vendors (public)
    getNearbyVendors: (params) => axiosInstance.get('/vendors/nearby', { params }),
    
    // Search vendors with location and item filtering (public)
    searchVendors: (params) => axiosInstance.get('/vendors/search', { params }),
    
    // Get approved vendors (public)
    getApprovedVendors: () => axiosInstance.get('/vendors'),
    
    // Get single vendor by ID (public)
    getVendor: (id) => axiosInstance.get(`/vendors/${id}`),
    
    // Get vendor products (public)
    getVendorProducts: (vendorId, params = {}) => axiosInstance.get(`/vendors/${vendorId}/products`, { params }),
    
    // Get universities (public)
    getUniversities: () => axiosInstance.get('/vendors/universities'),
    
    // Get categories (public)
    getCategories: () => axiosInstance.get('/vendors/categories'),
    
    // Get vendor files (public - for document viewing)
    getFile: (fileId) => `${axiosInstance.defaults.baseURL}/vendors/files/${fileId}`,

    // =========================
    // VENDOR APPLICATION
    // =========================
    
    // Submit vendor application (supports both FormData and JSON)
    submitVendorApplication: (applicationData) => {
        const config = applicationData instanceof FormData 
            ? { 
                headers: { 'Content-Type': 'multipart/form-data' }
              }
            : {};
        return axiosInstance.post('/vendors/apply', applicationData, config);
    },

    // =========================
    // AUTHENTICATED VENDOR ENDPOINTS
    // =========================
    
    // Get my vendor profile
    getMyVendorProfile: () => axiosInstance.get('/vendors/me'),
    
    // Update vendor profile (supports both FormData and JSON)
    updateVendor: (id, vendorData) => {
        const config = vendorData instanceof FormData
            ? {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
            : {};
        // For JSON, let axios handle the Content-Type header automatically
        return axiosInstance.put(`/vendors/${id}`, vendorData, config);
    },
    
    // Delete vendor account
    deleteVendor: (id) => axiosInstance.delete(`/vendors/${id}`),
};
