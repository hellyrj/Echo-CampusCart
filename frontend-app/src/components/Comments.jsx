import React, { useState, useEffect } from 'react';
import { useComment } from '../hooks/useComment';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ThumbsUp, Reply, Edit, Trash2, Send, X } from 'lucide-react';

const Comments = ({ itemId, itemType = 'product' }) => {
    const { isAuthenticated, user } = useAuth();
    const { 
        getProductComments, 
        getServiceComments, 
        createComment, 
        updateComment, 
        deleteComment, 
        toggleLike,
        loading 
    } = useComment();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [showReplies, setShowReplies] = useState({});

    useEffect(() => {
        loadComments();
    }, [itemId, itemType]);

    const loadComments = async () => {
        try {
            let result;
            if (itemType === 'product') {
                result = await getProductComments(itemId);
            } else {
                result = await getServiceComments(itemId);
            }
            
            if (result.success) {
                setComments(result.data?.comments || []);
            }
        } catch (err) {
            console.error('Error loading comments:', err);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const commentData = {
                content: newComment,
                [itemType === 'product' ? 'productId' : 'serviceId']: itemId
            };

            const result = await createComment(commentData);
            if (result.success) {
                setNewComment('');
                loadComments();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to post comment');
        }
    };

    const handleSubmitReply = async (e, parentCommentId) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            const commentData = {
                content: replyText,
                parentCommentId: parentCommentId,
                [itemType === 'product' ? 'productId' : 'serviceId']: itemId
            };

            const result = await createComment(commentData);
            if (result.success) {
                setReplyText('');
                setReplyTo(null);
                loadComments();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to post reply');
        }
    };

    const handleEditSubmit = async (e, commentId) => {
        e.preventDefault();
        if (!editText.trim()) return;

        try {
            const result = await updateComment(commentId, editText);
            if (result.success) {
                setEditingComment(null);
                setEditText('');
                loadComments();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update comment');
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const result = await deleteComment(commentId);
            if (result.success) {
                loadComments();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete comment');
        }
    };

    const handleLike = async (commentId) => {
        try {
            await toggleLike(commentId);
            loadComments();
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const CommentItem = ({ comment, isReply = false }) => {
        const isOwner = user && comment.userId._id === user._id;

        return (
            <div className={`${isReply ? 'ml-8 mt-3' : 'mb-4'} p-4 rounded-lg border ${isOwner ? 'border-l-4' : ''}`} style={{ borderLeftColor: isOwner ? '#606C38' : undefined }}>
                <div className="flex items-start gap-3">
                    {comment.userId.profilePicture ? (
                        <img
                            src={comment.userId.profilePicture.startsWith('http') ? comment.userId.profilePicture : `http://localhost:5000/uploads/${comment.userId.profilePicture}`}
                            alt={comment.userId.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${comment.userId.profilePicture ? 'hidden' : ''}`} style={{ backgroundColor: '#606C38' }}>
                        {comment.userId.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold" style={{ color: '#283618' }}>
                                {comment.userId.name || 'Anonymous'}
                            </span>
                            {isOwner && (
                                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}>
                                    owner
                                </span>
                            )}
                            <span className="text-sm" style={{ color: '#606C38' }}>
                                {formatDate(comment.createdAt)}
                            </span>
                            {comment.isEdited && (
                                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#FEFAE0', color: '#606C38' }}>
                                    Edited
                                </span>
                            )}
                        </div>

                        {editingComment === comment._id ? (
                            <form onSubmit={(e) => handleEditSubmit(e, comment._id)} className="mt-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 resize-none"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                    rows="3"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        className="px-3 py-1 rounded text-sm"
                                        style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingComment(null);
                                            setEditText('');
                                        }}
                                        className="px-3 py-1 rounded text-sm"
                                        style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="mt-1" style={{ color: '#283618' }}>{comment.content}</p>
                        )}

                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => handleLike(comment._id)}
                                className={`flex items-center gap-1 text-sm hover:opacity-70 transition-opacity ${
                                    comment.likes?.includes(user?._id) ? 'text-red-500' : ''
                                }`}
                                style={{ color: comment.likes?.includes(user?._id) ? '#DC2626' : '#606C38' }}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                {comment.likeCount || 0}
                            </button>

                            {!isReply && (
                                <button
                                    onClick={() => {
                                        setReplyTo(comment._id);
                                        setReplyText('');
                                    }}
                                    className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
                                    style={{ color: '#606C38' }}
                                >
                                    <Reply className="w-4 h-4" />
                                    Reply
                                </button>
                            )}

                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditingComment(comment._id);
                                            setEditText(comment.content);
                                        }}
                                        className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
                                        style={{ color: '#606C38' }}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
                                        style={{ color: '#DC2626' }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Reply Form */}
                        {replyTo === comment._id && (
                            <form onSubmit={(e) => handleSubmitReply(e, comment._id)} className="mt-3">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 resize-none"
                                    style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                                    rows="2"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        className="px-3 py-1 rounded text-sm flex items-center gap-1"
                                        style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                                    >
                                        <Send className="w-4 h-4" />
                                        Reply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplyTo(null);
                                            setReplyText('');
                                        }}
                                        className="px-3 py-1 rounded text-sm"
                                        style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Replies */}
                        {!isReply && comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3">
                                <button
                                    onClick={() => setShowReplies(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                    className="text-sm hover:opacity-70 transition-opacity"
                                    style={{ color: '#606C38' }}
                                >
                                    {showReplies[comment._id] ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                                {showReplies[comment._id] && (
                                    <div>
                                        {comment.replies.map(reply => (
                                            <CommentItem key={reply._id} comment={reply} isReply={true} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#283618' }}>
                <MessageSquare className="w-6 h-6" style={{ color: '#606C38' }} />
                Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                        style={{ borderColor: '#D1D5DB', focusRingColor: '#606C38' }}
                        rows="3"
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={loading || !newComment.trim()}
                            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                        >
                            <Send className="w-4 h-4" />
                            Post Comment
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-4 rounded-lg mb-6 text-center" style={{ backgroundColor: '#FEFAE0', border: '1px solid #606C38' }}>
                    <p style={{ color: '#283618' }}>Please log in to leave a comment</p>
                </div>
            )}

            {/* Comments List */}
            {loading && comments.length === 0 ? (
                <div className="text-center py-8">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#606C38' }}>
                    No comments yet. Be the first to share your thoughts!
                </div>
            ) : (
                <div>
                    {comments.map(comment => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;
