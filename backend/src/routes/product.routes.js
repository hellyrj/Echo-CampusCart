import {Router} from 'express';
import { ProductController} from '../controllers/product.controller.js';

const router = Router();
const productController = new ProductController();
// In your routes file
router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/popular', productController.getPopularProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;