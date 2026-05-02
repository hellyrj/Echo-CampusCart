// routes/wishlist.routes.js
import { Router } from 'express';
import { authenticate } from "../middlewares/auth.middleware.js";
import { WishlistController } from '../controllers/wishlist.controller.js';

const router = Router();
const wishlistController = new WishlistController();

// All wishlist routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Get wishlist count
router.get('/count', wishlistController.getWishlistCount);

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkProductInWishlist);

// Add product to wishlist
router.post('/add/:productId', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

// Toggle product in wishlist (add if not present, remove if present)
router.patch('/toggle/:productId', wishlistController.toggleWishlistItem);

// Clear entire wishlist
router.delete('/clear', wishlistController.clearWishlist);

export default router;