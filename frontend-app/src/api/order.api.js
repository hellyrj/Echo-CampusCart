import axiosInstance from './axios';

export const orderApi = {
    // Customer endpoints
    checkout: (orderData) => axiosInstance.post('/orders/checkout', orderData),
    getMyOrders: (params) => axiosInstance.get('/orders/my-orders', { params }),
    getOrder: (id) => axiosInstance.get(`/orders/${id}`),
    trackOrder: (orderNumber) => axiosInstance.get(`/orders/track/${orderNumber}`),
    cancelOrder: (orderId, reason) => axiosInstance.post(`/orders/${orderId}/cancel`, { reason }),
    validateCart: () => axiosInstance.get('/orders/validate-cart'),
    getOrderStats: () => axiosInstance.get('/orders/stats'),
    
    // Vendor endpoints
    getVendorOrders: (params) => axiosInstance.get('/orders/vendor/orders', { params }),
    updateOrderStatus: (orderId, statusData) => axiosInstance.patch(`/orders/vendor/${orderId}/status`, statusData),
    cancelVendorOrder: (orderId, reason) => axiosInstance.post(`/orders/vendor/${orderId}/cancel`, { reason }),
};