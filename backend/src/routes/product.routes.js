import {Router} from 'express';
import {authenticate} from "../middlewares/auth.middleware.js";
import { ProductController} from '../controllers/product.controller.js';

const router = Router();
const productController = new ProductController();
// In your routes file

//creating product
router.post('/',authenticate, productController.createProduct);
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/popular', productController.getPopularProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', authenticate, productController.updateProduct);
router.delete('/:id',authenticate, productController.deleteProduct);

export default router;