import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { ReviewService } from "../services/review.service.js";

export class ReviewController {
    constructor() {
        this.reviewService = new ReviewService();
    }

    createReview = asyncHandler(async (req, res) => {
        const { productId, rating, comment } = req.body;
        const review = await this.reviewService.createReview(
            req.user.id,
            productId,
            rating,
            comment
        );

        sendResponse(res, 201, "Review created successfully", review);
    });

    getProductReviews = asyncHandler(async (req, res) => {
        const reviews = await this.reviewService.getProductReviews(req.params.productId);
        sendResponse(res, 200, "Product reviews fetched successfully", reviews);
    });

    getReviewById = asyncHandler(async (req, res) => {
        const review = await this.reviewService.getReviewById(req.params.id);
        sendResponse(res, 200, "Review fetched successfully", review);
    });

    updateReview = asyncHandler(async (req, res) => {
        const updated = await this.reviewService.updateReview(
            req.params.id, 
            req.user.id, 
            req.body
        );
        sendResponse(res, 200, "Review updated successfully", updated);
    });

    deleteReview = asyncHandler(async (req, res) => {
        const result = await this.reviewService.deleteReview(
            req.params.id, 
            req.user.id
        );
        sendResponse(res, 200, "Review deleted successfully", result);
    });

    getUserReviews = asyncHandler(async (req, res) => {
        const reviews = await this.reviewService.getUserReviews(req.user.id);
        sendResponse(res, 200, "User reviews fetched successfully", reviews);
    });
}
