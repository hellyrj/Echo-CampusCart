import { useState } from 'react';
import { commentApi } from '../api/comment.api';

export const useComment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createComment = async (commentData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.createComment(commentData);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to create comment');
            throw err;
        }
    };

    const getProductComments = async (productId, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.getProductComments(productId, params);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch comments');
            throw err;
        }
    };

    const getServiceComments = async (serviceId, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.getServiceComments(serviceId, params);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch comments');
            throw err;
        }
    };

    const getCommentReplies = async (commentId, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.getCommentReplies(commentId, params);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch replies');
            throw err;
        }
    };

    const updateComment = async (commentId, content) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.updateComment(commentId, content);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to update comment');
            throw err;
        }
    };

    const deleteComment = async (commentId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.deleteComment(commentId);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to delete comment');
            throw err;
        }
    };

    const toggleLike = async (commentId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.toggleLike(commentId);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to toggle like');
            throw err;
        }
    };

    const flagComment = async (commentId, reason) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.flagComment(commentId, reason);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to flag comment');
            throw err;
        }
    };

    const getUserComments = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await commentApi.getUserComments(params);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to fetch user comments');
            throw err;
        }
    };

    return {
        loading,
        error,
        createComment,
        getProductComments,
        getServiceComments,
        getCommentReplies,
        updateComment,
        deleteComment,
        toggleLike,
        flagComment,
        getUserComments
    };
};
