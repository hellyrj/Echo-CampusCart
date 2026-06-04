import axiosInstance from './axios';

export const bookingApi = {
    // =========================
    // CUSTOMER ENDPOINTS
    // =========================

    // Create a new booking
    createBooking: async (bookingData) => {
        const response = await axiosInstance.post('/bookings', bookingData);
        return response.data;
    },

    // Get all bookings for the logged-in user
    getMyBookings: async (params = {}) => {
        const response = await axiosInstance.get('/bookings/my-bookings', { params });
        return response.data;
    },

    // Get a specific booking
    getBooking: async (bookingId) => {
        const response = await axiosInstance.get(`/bookings/${bookingId}`);
        return response.data;
    },

    // Cancel a booking
    cancelBooking: async (bookingId, reason) => {
        const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`, { reason });
        return response.data;
    },

    // =========================
    // VENDOR ENDPOINTS
    // =========================

    // Get all bookings for the logged-in vendor
    getVendorBookings: async (params = {}) => {
        const response = await axiosInstance.get('/bookings/vendor/my-bookings', { params });
        return response.data;
    },

    // Update booking status
    updateBookingStatus: async (bookingId, status, note) => {
        const response = await axiosInstance.put(`/bookings/${bookingId}/status`, { status, note });
        return response.data;
    },

    // Update payment status
    updatePaymentStatus: async (bookingId, paymentStatus, transactionId) => {
        const response = await axiosInstance.put(`/bookings/${bookingId}/payment`, { paymentStatus, transactionId });
        return response.data;
    },

    // Get booking stats for vendor
    getBookingStats: async () => {
        const response = await axiosInstance.get('/bookings/vendor/stats');
        return response.data;
    }
};

export default bookingApi;
