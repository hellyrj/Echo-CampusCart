import Comment from "../models/comment.model.js";
import Product from "../models/product.model.js";
import Service from "../models/service.model.js";
import User from "../models/user.model.js";

export class CommentService {
    async createComment(commentData) {
        try {
            // Validate that either productId or serviceId is provided
            if (!commentData.productId && !commentData.serviceId) {
                throw new Error("Either productId or serviceId is required");
            }

            // If productId is provided, verify product exists
            if (commentData.productId) {
                const product = await Product.findById(commentData.productId);
                if (!product) {
                    throw new Error("Product not found");
                }
            }

            // If serviceId is provided, verify service exists
            if (commentData.serviceId) {
                const service = await Service.findById(commentData.serviceId);
                if (!service) {
                    throw new Error("Service not found");
                }
            }

            // Verify user exists
            const user = await User.findById(commentData.userId);
            if (!user) {
                throw new Error("User not found");
            }

            // If this is a reply, verify parent comment exists
            if (commentData.parentCommentId) {
                const parentComment = await Comment.findById(commentData.parentCommentId);
                if (!parentComment) {
                    throw new Error("Parent comment not found");
                }
                // Increment parent comment's reply count
                await parentComment.incrementReplyCount();
            }

            const comment = new Comment(commentData);
            await comment.save();

            // Populate related documents for response
            await comment.populate('userId', 'name email profilePicture');
            if (comment.productId) {
                await comment.populate('productId', 'name basePrice');
            }
            if (comment.serviceId) {
                await comment.populate('serviceId', 'title basePrice');
            }

            return comment;
        } catch (error) {
            throw new Error(`Failed to create comment: ${error.message}`);
        }
    }

    async getCommentById(commentId) {
        try {
            const comment = await Comment.findById(commentId)
                .populate('userId', 'name email profilePicture')
                .populate('productId', 'name basePrice')
                .populate('serviceId', 'title basePrice')
                .populate('parentCommentId', 'content userId');

            if (!comment) {
                return null;
            }

            return comment;
        } catch (error) {
            throw new Error(`Failed to get comment: ${error.message}`);
        }
    }

    async getProductComments(productId, options = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            const skip = (page - 1) * limit;

            const query = { 
                productId, 
                parentCommentId: null, // Only get top-level comments
                isDeleted: false 
            };

            const comments = await Comment.find(query)
                .populate('userId', 'name email profilePicture')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit);

            // Get replies for each comment
            const commentsWithReplies = await Promise.all(
                comments.map(async (comment) => {
                    const replies = await Comment.find({
                        parentCommentId: comment._id,
                        isDeleted: false
                    })
                    .populate('userId', 'name email profilePicture')
                    .sort({ createdAt: 1 })
                    .limit(5);

                    return {
                        ...comment.toObject(),
                        replies
                    };
                })
            );

            const total = await Comment.countDocuments(query);

            return {
                comments: commentsWithReplies,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get product comments: ${error.message}`);
        }
    }

    async getServiceComments(serviceId, options = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            const skip = (page - 1) * limit;

            const query = { 
                serviceId, 
                parentCommentId: null, // Only get top-level comments
                isDeleted: false 
            };

            const comments = await Comment.find(query)
                .populate('userId', 'name email profilePicture')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit);

            // Get replies for each comment
            const commentsWithReplies = await Promise.all(
                comments.map(async (comment) => {
                    const replies = await Comment.find({
                        parentCommentId: comment._id,
                        isDeleted: false
                    })
                    .populate('userId', 'name email profilePicture')
                    .sort({ createdAt: 1 })
                    .limit(5);

                    return {
                        ...comment.toObject(),
                        replies
                    };
                })
            );

            const total = await Comment.countDocuments(query);

            return {
                comments: commentsWithReplies,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get service comments: ${error.message}`);
        }
    }

    async getCommentReplies(commentId, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;

            const query = { 
                parentCommentId: commentId,
                isDeleted: false 
            };

            const replies = await Comment.find(query)
                .populate('userId', 'name email profilePicture')
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit);

            const total = await Comment.countDocuments(query);

            return {
                replies,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get comment replies: ${error.message}`);
        }
    }

    async updateComment(commentId, userId, content) {
        try {
            const comment = await Comment.findById(commentId);
            
            if (!comment) {
                throw new Error("Comment not found");
            }

            // Only the comment owner can update
            if (comment.userId.toString() !== userId.toString()) {
                throw new Error("You can only update your own comments");
            }

            comment.content = content;
            comment.isEdited = true;
            await comment.save();

            // Populate related documents for response
            await comment.populate('userId', 'name email profilePicture');

            return comment;
        } catch (error) {
            throw new Error(`Failed to update comment: ${error.message}`);
        }
    }

    async deleteComment(commentId, userId) {
        try {
            const comment = await Comment.findById(commentId);
            
            if (!comment) {
                throw new Error("Comment not found");
            }

            // Only the comment owner can delete
            if (comment.userId.toString() !== userId.toString()) {
                throw new Error("You can only delete your own comments");
            }

            // Soft delete
            comment.isDeleted = true;
            await comment.save();

            // If this is a reply, decrement parent comment's reply count
            if (comment.parentCommentId) {
                const parentComment = await Comment.findById(comment.parentCommentId);
                if (parentComment) {
                    await parentComment.decrementReplyCount();
                }
            }

            return comment;
        } catch (error) {
            throw new Error(`Failed to delete comment: ${error.message}`);
        }
    }

    async toggleLike(commentId, userId) {
        try {
            const comment = await Comment.findById(commentId);
            
            if (!comment) {
                throw new Error("Comment not found");
            }

            await comment.toggleLike(userId);

            // Populate related documents for response
            await comment.populate('userId', 'name email profilePicture');

            return comment;
        } catch (error) {
            throw new Error(`Failed to toggle like: ${error.message}`);
        }
    }

    async flagComment(commentId, reason) {
        try {
            const comment = await Comment.findById(commentId);
            
            if (!comment) {
                throw new Error("Comment not found");
            }

            comment.isFlagged = true;
            comment.flagReason = reason;
            await comment.save();

            return comment;
        } catch (error) {
            throw new Error(`Failed to flag comment: ${error.message}`);
        }
    }

    async getUserComments(userId, options = {}) {
        try {
            const { page = 1, limit = 20 } = options;
            const skip = (page - 1) * limit;

            const query = { 
                userId,
                isDeleted: false 
            };

            const comments = await Comment.find(query)
                .populate('productId', 'name basePrice images')
                .populate('serviceId', 'title basePrice images')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Comment.countDocuments(query);

            return {
                comments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to get user comments: ${error.message}`);
        }
    }
}
