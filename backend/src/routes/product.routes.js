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

// Simple test endpoint (no auth)
router.get('/test-simple', (req, res) => {
    console.log(' SIMPLE TEST ENDPOINT REACHED!');
    res.json({ message: 'Simple test works!', timestamp: new Date() });
});

// Vendor routes (must come BEFORE /:id)
router.get('/vendor/my-products', authenticate, authorize('vendor'), productController.getVendorProducts);
router.get('/vendor/test-auth', authenticate, authorize('vendor'), async (req, res) => {
    console.log(' TEST ENDPOINT REACHED!');
    console.log('=== VENDOR AUTH TEST ===');
    console.log('User ID from token:', req.user._id);
    console.log('User ID type:', typeof req.user._id);
    
    const vendorService = new (await import('../services/vendor.service.js')).default();
    const vendor = await vendorService.getVendorByUserId(req.user._id);
    console.log('Vendor found:', vendor);
    console.log('Vendor ID:', vendor?._id);
    console.log('Vendor ID type:', typeof vendor?._id);
    
    // Test with a sample product
    const Product = (await import('../models/product.model.js')).default;
    const sampleProduct = await Product.findOne({ vendorId: vendor?._id });
    console.log('Sample product:', sampleProduct?._id);
    console.log('Sample product vendorId:', sampleProduct?.vendorId);
    console.log('Sample product vendorId type:', typeof sampleProduct?.vendorId);
    
    res.json({
        userId: req.user._id,
        vendorId: vendor?._id,
        vendorExists: !!vendor,
        sampleProduct: {
            id: sampleProduct?._id,
            vendorId: sampleProduct?.vendorId,
            match: sampleProduct?.vendorId?.toString() === vendor?._id?.toString()
        }
    });
});
router.post('/', authenticate, authorize('vendor'), uploadProductImages, productController.createProduct);

// Product management routes
router.put('/:id', authenticate, authorize('vendor'), uploadProductImages, productController.updateProduct);
router.delete('/:id', authenticate, authorize('vendor'), productController.deleteProduct);

// Image management routes
router.post('/:id/images', authenticate, authorize('vendor'), uploadProductImages, productController.addProductImages);
router.delete('/:id/images/:imageIndex', authenticate, authorize('vendor'), productController.removeProductImage);

// Product status management
router.patch('/:id/availability', authenticate, authorize('vendor'), productController.updateAvailability);
router.patch('/:id/inventory', authenticate, authorize('vendor'), productController.updateInventory);

// Admin routes
router.patch('/:id/admin-approve', authenticate, authorize('admin'), productController.adminApprove);
router.patch('/:id/admin-reject', authenticate, authorize('admin'), productController.adminReject);

export default router;