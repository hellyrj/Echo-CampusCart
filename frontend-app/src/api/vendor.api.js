import axiosInstance from './axios';

export const vendorApi = {

    /**
     * 
     public endpoints
     */
    // Vendor application
    submitVendorApplication: (applicationData) => axiosInstance.post('/vendors/apply', applicationData),
    // Get nearby vendors (public)
    getNearbyVendors: (params) => axiosInstance.get('/vendors/nearby', { params }),
    // Get approved vendors (public)
    getApprovedVendors: () => axiosInstance.get('/vendors'),
    // Get single vendor by ID (public)
    getVendor: (id) => axiosInstance.get(`/vendors/${id}`),

       // Vendor-specific endpoints (for authenticated vendors)
    getMyVendorProfile: () => axiosInstance.get('/vendors/profile/me'),


  /**
   * 
   * vendor specific endpoints
   */
    // vendor profile
    getMyVendorProfile: () => axiosInstance.get('/vendors/me'),
    getMyProducts: () => axiosInstance.get('/vendors/me/products'),
    //updateVendor: (id, vendorData) => axiosInstance.put(`/vendors/${id}`, vendorData),  
    //deleteVendor: (id) => axiosInstance.delete(`/vendors/${id}`),





    
    // Public endpoints
   // getUniversities: () => axiosInstance.get('/universities'),
   // getCategories: () => axiosInstance.get('/categories'),
    
  
    createMyProduct: (productData) => axiosInstance.post('/vendors/products', productData),
    updateMyProduct: (id, productData) => axiosInstance.put(`/vendors/products/${id}`, productData),
    deleteMyProduct: (id) => axiosInstance.delete(`/vendors/products/${id}`),
    
    // Update vendor (vendor owner only)
    updateVendor: (id, vendorData) => axiosInstance.put(`/vendors/${id}`, vendorData),
    
    // Delete vendor (vendor owner only)
    deleteVendor: (id) => axiosInstance.delete(`/vendors/${id}`),
};
