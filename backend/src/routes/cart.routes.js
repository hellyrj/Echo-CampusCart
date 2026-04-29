// routes/cart.routes.js
import { Router } from 'express';
import { authenticate } from "../middlewares/auth.middleware.js";
import { CartController } from '../controllers/cart.controller.js';

const router = Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticate);

// Basic cart operations
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/item/:itemId', cartController.updateItemQuantity);
router.delete('/item/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

// Coupon operations
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

// Notes
router.patch('/notes', cartController.addNotes);

// Utility endpoints
router.get('/count', cartController.getCartCount);
router.post('/validate', cartController.validateCart);
router.post('/merge', cartController.mergeCarts);

export default router;