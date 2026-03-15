import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js'; // Your auth middleware

const router = Router();
const reviewController = new ReviewController();
// All review routes require authentication
router.use(authenticate);

// Review routes
router.post('/', reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/user', reviewController.getUserReviews);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

export default router;