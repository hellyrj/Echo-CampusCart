import { Router } from 'express';
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { OrderController } from '../controllers/order.controller.js';

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post('/checkout', orderController.createOrder); // done
router.get('/my-orders', orderController.getUserOrders); //done
router.get('/validate-cart', orderController.validateCartForCheckout); //done
router.get('/stats', orderController.getOrderStats); //done

// Must come before /:orderId routes
router.get('/track/:orderNumber', orderController.getOrderByNumber);

// Order management (both customer and vendor can view)
router.get('/:id', orderController.getOrder);

// Customer actions
router.post('/:orderId/cancel', orderController.cancelOrder);

// Vendor routes
router.get('/vendor/orders', authorize('vendor'), orderController.getVendorOrders);
router.patch('/vendor/:orderId/status', authorize('vendor'), orderController.updateVendorOrderStatus);
router.post('/vendor/:orderId/cancel', authorize('vendor'), orderController.cancelVendorOrder);

export default router;