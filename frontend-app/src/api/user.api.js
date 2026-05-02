import axiosInstance from './axios';

export const userApi = {
    // Get user notifications
    getNotifications: () => {
        return axiosInstance.get('/user/notifications');
    },

    // Mark notification as read
    markNotificationAsRead: (notificationId) => {
        return axiosInstance.patch(`/user/notifications/${notificationId}/read`);
    },

    // Get user profile
    getProfile: () => {
        return axiosInstance.get('/user/profile');
    },

    // Update user profile
    updateProfile: (profileData) => {
        return axiosInstance.patch('/user/profile', profileData);
    }
};
