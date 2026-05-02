import axiosInstance from './axios';

export const productApi = {
    createProduct: (productData) => {
        // If productData is FormData, set proper content type
        const config = productData instanceof FormData 
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        return axiosInstance.post('/products', productData, config);
    },
    
    getProducts: (params) => axiosInstance.get('/products', { params }),
    
    getVendorProducts: (params) => axiosInstance.get('/products/vendor/my-products', { params }),
    
    searchProducts: (params) => axiosInstance.get('/products/search', { params }),
    
    getPopularProducts: (params) => axiosInstance.get('/products/popular', { params }),
    
    getProduct: (id) => axiosInstance.get(`/products/${id}`),
    
    updateProduct: (id, productData) => {
        // If productData is FormData, set proper content type
        const config = productData instanceof FormData 
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        return axiosInstance.put(`/products/${id}`, productData, config);
    },
    
    deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),
    
    // Image management
    addProductImages: (productId, images) => {
        const formData = new FormData();
        images.forEach(image => {
            formData.append('images', image);
        });
        return axiosInstance.post(`/products/${productId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    removeProductImage: (productId, imageIndex) => 
        axiosInstance.delete(`/products/${productId}/images/${imageIndex}`),
    
    // Product status management
    updateAvailability: (productId, isAvailable) => 
        axiosInstance.patch(`/products/${productId}/availability`, { isAvailable }),
    
    updateInventory: (productId, inventoryData) => 
        axiosInstance.patch(`/products/${productId}/inventory`, inventoryData),
    
    // Admin endpoints
    adminApproveProduct: (productId, approved) => 
        axiosInstance.patch(`/products/${productId}/admin-approve`, { approved }),
    
    adminRejectProduct: (productId, rejectionReason) => 
        axiosInstance.patch(`/products/${productId}/admin-reject`, { rejectionReason }),
};
