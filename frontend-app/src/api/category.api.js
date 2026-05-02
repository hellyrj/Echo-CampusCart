import axiosInstance from './axios';

export const categoryApi = {
    getCategories: (params) => axiosInstance.get('/vendors/categories', { params }),
    getCategory: (id) => axiosInstance.get(`/categories/${id}`),
    createCategory: (categoryData) => axiosInstance.post('/categories', categoryData),
    updateCategory: (id, categoryData) => axiosInstance.put(`/categories/${id}`, categoryData),
    deleteCategory: (id) => axiosInstance.delete(`/categories/${id}`),
};
