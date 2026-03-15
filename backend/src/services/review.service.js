import reviewRepository from "../repositories/review.repository.js";
import  ProductRepository  from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

export class ReviewService { 
    constructor(reviewRepo = reviewRepository, productRepo = ProductRepository) {
        this.reviewRepo = reviewRepo;
        this.productRepo = productRepo;
    }

    async createReview(userId , productId, rating , comment) {
        const product = await this.productRepo.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        const existing = await this.reviewRepo.findByUserAndProduct(userId, productId);
        if (existing) throw new ApiError(400, "you already reviewed this product");

        const review = await this.reviewRepo.create({userId, productId, rating, comment});

        //update product average rating
        const reviews = await this.reviewRepo.getProductReviews(productId);
        const averageRating = 
             reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
             await this.productRepo.update(productId, { averageRating , reviewCount: reviews.length});
     return review;        
    }

    async getProductReviews(productId) {
        return this.reviewRepo.getProductReviews(productId);
    }

    async updateReview(reviewId , userId, data) {
        const review = await this.reviewRepo.findById(reviewId)
        if(!review) throw new ApiError(404, "Review not found");
        if (review.userId.toString() != userId)
            throw new ApiError(403, "You can only update your own review");

        const update = await this.reviewRepo.update(reviewId, data);
             

    // Recalculate product rating
    const reviews = await this.reviewRepo.getProductReviews(review.productId);
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await this.productRepo.update(review.productId, {
      averageRating,
      reviewCount: reviews.length
    });

    return { success: true };

    }

    async getReviewById(reviewId) {
        const review = await this.reviewRepo.findById(reviewId);
        if (!review) throw new ApiError(404, "Review not found");
        return review;
    }

    async deleteReview(reviewId, userId) {
        const review = await this.reviewRepo.findById(reviewId);
        if (!review) throw new ApiError(404, "Review not found");
        if (review.userId.toString() !== userId)
            throw new ApiError(403, "You can only delete your own review");

        await this.reviewRepo.delete(reviewId);

        // Recalculate product rating
        const reviews = await this.reviewRepo.getProductReviews(review.productId);
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        await this.productRepo.update(review.productId, {
            averageRating,
            reviewCount: reviews.length
        });

        return { success: true };
    }

    async getUserReviews(userId) {
        return this.reviewRepo.findByUser(userId);
    }
}