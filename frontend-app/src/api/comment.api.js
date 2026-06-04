import axiosInstance from './axios';

export const commentApi = {
    // =========================
    // PUBLIC ENDPOINTS
    // =========================

    // Get comments for a product
    getProductComments: async (productId, params = {}) => {
        const response = await axiosInstance.get(`/comments/product/${productId}`, { params });
        return response.data;
    },

    // Get comments for a service
    getServiceComments: async (serviceId, params = {}) => {
        const response = await axiosInstance.get(`/comments/service/${serviceId}`, { params });
        return response.data;
    },

    // Get replies for a comment
    getCommentReplies: async (commentId, params = {}) => {
        const response = await axiosInstance.get(`/comments/${commentId}/replies`, { params });
        return response.data;
    },

    // =========================
    // PROTECTED ENDPOINTS
    // =========================

    // Create a new comment
    createComment: async (commentData) => {
        const response = await axiosInstance.post('/comments', commentData);
        return response.data;
    },

    // Get a specific comment
    getComment: async (commentId) => {
        const response = await axiosInstance.get(`/comments/${commentId}`);
        return response.data;
    },

    // Update a comment
    updateComment: async (commentId, content) => {
        const response = await axiosInstance.put(`/comments/${commentId}`, { content });
        return response.data;
    },

    // Delete a comment
    deleteComment: async (commentId) => {
        const response = await axiosInstance.delete(`/comments/${commentId}`);
        return response.data;
    },

    // Toggle like on a comment
    toggleLike: async (commentId) => {
        const response = await axiosInstance.post(`/comments/${commentId}/like`);
        return response.data;
    },

    // Flag a comment (for moderation)
    flagComment: async (commentId, reason) => {
        const response = await axiosInstance.post(`/comments/${commentId}/flag`, { reason });
        return response.data;
    },

    // Get comments for the logged-in user
    getUserComments: async (params = {}) => {
        const response = await axiosInstance.get('/comments/user/my-comments', { params });
        return response.data;
    }
};

export default commentApi;
