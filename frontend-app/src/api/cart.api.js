import axiosInstance from './axios';

export const cartApi = {
  getCart: () => axiosInstance.get('/cart'),
  addToCart: (data) => axiosInstance.post('/cart/add', data),
  updateItemQuantity: (itemId, quantity) => axiosInstance.patch(`/cart/item/${itemId}`, { quantity }),
  removeFromCart: (itemId) => axiosInstance.delete(`/cart/item/${itemId}`),
  clearCart: () => axiosInstance.delete('/cart/clear'),
  applyCoupon: (couponCode) => axiosInstance.post('/cart/coupon', { couponCode }),
  removeCoupon: () => axiosInstance.delete('/cart/coupon'),
  addNotes: (notes) => axiosInstance.patch('/cart/notes', { notes }),
  getCartCount: () => axiosInstance.get('/cart/count'),
  validateCart: () => axiosInstance.post('/cart/validate'),
  mergeCarts: (sessionCartItems) => axiosInstance.post('/cart/merge', { sessionCartItems })
};
