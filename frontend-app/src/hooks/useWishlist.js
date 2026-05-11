// hooks/useWishlist.js
import { useWishlistContext } from '../context/WishlistContext';

export const useWishlist = () => {
    return useWishlistContext();
};