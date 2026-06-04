import { Router } from "express";
import { CommentController } from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
const commentController = new CommentController();

// =========================
// PUBLIC ENDPOINTS
// =========================

// Get comments for a product (public)
router.get(
    "/product/:productId",
    commentController.getProductComments
);

// Get comments for a service (public)
router.get(
    "/service/:serviceId",
    commentController.getServiceComments
);

// Get replies for a comment (public)
router.get(
    "/:commentId/replies",
    commentController.getCommentReplies
);

// =========================
// PROTECTED ENDPOINTS
// =========================

// Create a new comment
router.post(
    "/",
    authenticate,
    commentController.createComment
);

// Get a specific comment
router.get(
    "/:id",
    authenticate,
    commentController.getComment
);

// Update a comment
router.put(
    "/:id",
    authenticate,
    commentController.updateComment
);

// Delete a comment
router.delete(
    "/:id",
    authenticate,
    commentController.deleteComment
);

// Toggle like on a comment
router.post(
    "/:id/like",
    authenticate,
    commentController.toggleLike
);

// Flag a comment (for moderation)
router.post(
    "/:id/flag",
    authenticate,
    commentController.flagComment
);

// Get comments for the logged-in user
router.get(
    "/user/my-comments",
    authenticate,
    commentController.getUserComments
);

export default router;
