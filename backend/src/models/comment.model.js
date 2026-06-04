import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    // User who made the comment
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Can be either a product or service
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    },

    // Comment content
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },

    // For threaded replies
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    // Reply count
    replyCount: {
        type: Number,
        default: 0
    },

    // Likes/Reactions
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    likeCount: {
        type: Number,
        default: 0
    },

    // Comment status
    isEdited: {
        type: Boolean,
        default: false
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    // Moderation
    isFlagged: {
        type: Boolean,
        default: false
    },

    flagReason: String

}, {
    timestamps: true
});

// Indexes for performance
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ productId: 1, createdAt: -1 });
commentSchema.index({ serviceId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ isDeleted: 1 });

// Method to toggle like
commentSchema.methods.toggleLike = async function(userId) {
    const likeIndex = this.likes.indexOf(userId);
    
    if (likeIndex === -1) {
        this.likes.push(userId);
        this.likeCount += 1;
    } else {
        this.likes.splice(likeIndex, 1);
        this.likeCount -= 1;
    }
    
    await this.save();
    return this;
};

// Method to increment reply count
commentSchema.methods.incrementReplyCount = async function() {
    this.replyCount += 1;
    await this.save();
};

// Method to decrement reply count
commentSchema.methods.decrementReplyCount = async function() {
    if (this.replyCount > 0) {
        this.replyCount -= 1;
        await this.save();
    }
};

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
