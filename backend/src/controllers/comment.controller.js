import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { CommentService } from "../services/comment.service.js";

export class CommentController {
    constructor(commentService = new CommentService()) {
        this.commentService = commentService;
    }

    // Create a new comment
    createComment = asyncHandler(async (req, res, next) => {
        const commentData = {
            ...req.body,
            userId: req.user._id
        };

        try {
            const comment = await this.commentService.createComment(commentData);
            sendResponse(res, 201, "Comment created successfully", comment);
        } catch (error) {
            sendResponse(res, 500, "Failed to create comment", { error: error.message });
        }
    });

    // Get a specific comment
    getComment = asyncHandler(async (req, res, next) => {
        const { id: commentId } = req.params;

        try {
            const comment = await this.commentService.getCommentById(commentId);
            
            if (!comment) {
                return sendResponse(res, 404, "Comment not found");
            }

            sendResponse(res, 200, "Comment fetched successfully", comment);
        } catch (error) {
            sendResponse(res, 500, "Failed to fetch comment", { error: error.message });
        }
    });

    // Get comments for a product
    getProductComments = asyncHandler(async (req, res, next) => {
        const { productId } = req.params;
        const { page, limit, sortBy, sortOrder } = req.query;

        try {
            const result = await this.commentService.getProductComments(productId, {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder
            });

            sendResponse(res, 200, "Product comments fetched successfully", result);
        } catch (error) {
            sendResponse(res, 500, "Failed to fetch product comments", { error: error.message });
        }
    });

    // Get comments for a service
    getServiceComments = asyncHandler(async (req, res, next) => {
        const { serviceId } = req.params;
        const { page, limit, sortBy, sortOrder } = req.query;

        try {
            const result = await this.commentService.getServiceComments(serviceId, {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder
            });

            sendResponse(res, 200, "Service comments fetched successfully", result);
        } catch (error) {
            sendResponse(res, 500, "Failed to fetch service comments", { error: error.message });
        }
    });

    // Get replies for a comment
    getCommentReplies = asyncHandler(async (req, res, next) => {
        const { commentId } = req.params;
        const { page, limit } = req.query;

        try {
            const result = await this.commentService.getCommentReplies(commentId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            sendResponse(res, 200, "Comment replies fetched successfully", result);
        } catch (error) {
            sendResponse(res, 500, "Failed to fetch comment replies", { error: error.message });
        }
    });

    // Update a comment
    updateComment = asyncHandler(async (req, res, next) => {
        const { id: commentId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        try {
            const comment = await this.commentService.updateComment(commentId, userId, content);
            sendResponse(res, 200, "Comment updated successfully", comment);
        } catch (error) {
            sendResponse(res, 500, "Failed to update comment", { error: error.message });
        }
    });

    // Delete a comment
    deleteComment = asyncHandler(async (req, res, next) => {
        const { id: commentId } = req.params;
        const userId = req.user._id;

        try {
            const comment = await this.commentService.deleteComment(commentId, userId);
            sendResponse(res, 200, "Comment deleted successfully", comment);
        } catch (error) {
            sendResponse(res, 500, "Failed to delete comment", { error: error.message });
        }
    });

    // Toggle like on a comment
    toggleLike = asyncHandler(async (req, res, next) => {
        const { id: commentId } = req.params;
        const userId = req.user._id;

        try {
            const comment = await this.commentService.toggleLike(commentId, userId);
            sendResponse(res, 200, "Like toggled successfully", comment);
        } catch (error) {
            sendResponse(res, 500, "Failed to toggle like", { error: error.message });
        }
    });

    // Flag a comment (for moderation)
    flagComment = asyncHandler(async (req, res, next) => {
        const { id: commentId } = req.params;
        const { reason } = req.body;

        try {
            const comment = await this.commentService.flagComment(commentId, reason);
            sendResponse(res, 200, "Comment flagged successfully", comment);
        } catch (error) {
            sendResponse(res, 500, "Failed to flag comment", { error: error.message });
        }
    });

    // Get comments for the logged-in user
    getUserComments = asyncHandler(async (req, res, next) => {
        const userId = req.user._id;
        const { page, limit } = req.query;

        try {
            const result = await this.commentService.getUserComments(userId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            sendResponse(res, 200, "User comments fetched successfully", result);
        } catch (error) {
            sendResponse(res, 500, "Failed to fetch user comments", { error: error.message });
        }
    });
}
