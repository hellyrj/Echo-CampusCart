import axiosInstance from './axios';

export const vendorApi = {
    // =========================
    // PUBLIC ENDPOINTS
    // =========================
    
    // Get nearby vendors (public)
    getNearbyVendors: (params) => axiosInstance.get('/vendors/nearby', { params }),
    
    // Get approved vendors (public)
    getApprovedVendors: () => axiosInstance.get('/vendors'),
    
    // Get single vendor by ID (public)
    getVendor: (id) => axiosInstance.get(`/vendors/${id}`),
    
    // Get universities (public)
    getUniversities: () => axiosInstance.get('/universities'),
    
    // Get categories (public)
    getCategories: () => axiosInstance.get('/categories'),
    
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
    
    // Get my products
    getMyProducts: () => axiosInstance.get('/vendors/me/products'),
    
    // Create product
    createMyProduct: (productData) => axiosInstance.post('/vendors/me/products', productData),
    
    // Update product
    updateMyProduct: (id, productData) => axiosInstance.put(`/vendors/me/products/${id}`, productData),
    
    // Delete product
    deleteMyProduct: (id) => axiosInstance.delete(`/vendors/me/products/${id}`),
    
    // Update vendor profile
    updateVendor: (id, vendorData) => axiosInstance.put(`/vendors/${id}`, vendorData),
    
    // Delete vendor account
    deleteVendor: (id) => axiosInstance.delete(`/vendors/${id}`),
};
