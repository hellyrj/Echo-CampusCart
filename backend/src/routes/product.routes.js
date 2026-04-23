import {Router} from 'express';
import {authenticate} from "../middlewares/auth.middleware.js";
import { authorize} from "../middlewares/authorize.middleware.js";
import { ProductController} from '../controllers/product.controller.js';
import { uploadProductImages, uploadSingleProductImage } from '../middlewares/productUpload.js';

const router = Router();
const productController = new ProductController();

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/popular', productController.getPopularProducts);
router.get('/:id', productController.getProduct);

// Vendor routes (require authentication and vendor role)
router.post('/', authenticate, authorize('vendor'), uploadProductImages, productController.createProduct);
router.get('/vendor/my-products', authenticate, authorize('vendor'), productController.getVendorProducts);

// Product management routes (vendor only)
router.put('/:id', authenticate, authorize('vendor'), uploadProductImages, productController.updateProduct);
router.delete('/:id', authenticate, authorize('vendor'), productController.deleteProduct);

// Image management routes
router.post('/:id/images', authenticate, authorize('vendor'), uploadProductImages, productController.addProductImages);
router.delete('/:id/images/:imageIndex', authenticate, authorize('vendor'), productController.removeProductImage);

// Product status management
router.patch('/:id/availability', authenticate, authorize('vendor'), productController.updateAvailability);
router.patch('/:id/inventory', authenticate, authorize('vendor'), productController.updateInventory);

// Admin routes (require admin role)
router.patch('/:id/admin-approve', authenticate, authorize('admin'), productController.adminApprove);
router.patch('/:id/admin-reject', authenticate, authorize('admin'), productController.adminReject);

export default router;