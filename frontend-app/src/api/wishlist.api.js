import axiosInstance from './axios';

export const wishlistApi = {
    getWishlist: () => axiosInstance.get('/wishlist'),
    addToWishlist: (productId) => axiosInstance.post(`/wishlist/add/${productId}`),
    removeFromWishlist: (productId) => axiosInstance.delete(`/wishlist/remove/${productId}`),
    toggleWishlistItem: (productId) => axiosInstance.patch(`/wishlist/toggle/${productId}`),
    clearWishlist: () => axiosInstance.delete('/wishlist/clear'),
    getWishlistCount: () => axiosInstance.get('/wishlist/count'),
    checkProductInWishlist: (productId) => axiosInstance.get(`/wishlist/check/${productId}`)
};
