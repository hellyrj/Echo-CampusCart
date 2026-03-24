import axiosInstance from './axios';

export const productApi = {
    createProduct: (productData) => axiosInstance.post('/products', productData),
    getProducts: (params) => axiosInstance.get('/products', { params }),
    searchProducts: (query) => axiosInstance.get('/products/search', { params: { q: query } }),
    getPopularProducts: () => axiosInstance.get('/products/popular'),
    getProduct: (id) => axiosInstance.get(`/products/${id}`),
    updateProduct: (id, productData) => axiosInstance.put(`/products/${id}`, productData),
    deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),
};
