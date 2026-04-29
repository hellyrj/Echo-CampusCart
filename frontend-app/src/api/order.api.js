import axiosInstance from './axios';

export const orderApi = {
  // Cart analysis and checkout
  analyzeCart: () => axiosInstance.get('/orders/analyze-cart'),
  checkout: (checkoutData) => axiosInstance.post('/orders/checkout', checkoutData),
  
  // Student orders
  getStudentOrders: () => axiosInstance.get('/orders/student'),
  getStudentOrderGroups: () => axiosInstance.get('/orders/student/groups'),
  getOrderById: (orderId) => axiosInstance.get(`/orders/${orderId}`),
  
  // Order management
  updateOrderStatus: (orderId, status) => axiosInstance.patch(`/orders/${orderId}/status`, { status }),
  updatePaymentStatus: (orderId, paymentStatus) => axiosInstance.patch(`/orders/${orderId}/payment`, { paymentStatus }),
  
  // Vendor orders
  getVendorOrders: () => axiosInstance.get('/orders/vendor'),
  getVendorOrderGroups: () => axiosInstance.get('/orders/vendor/groups')
};
