import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const RatingComponent = ({ productId, currentRating, reviewCount, onRatingUpdate, size = 'medium' }) => {
    const { isAuthenticated } = useAuth();
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewText, setReviewText] = useState('');

    const starSizes = {
        small: 'w-4 h-4',
        medium: 'w-5 h-5',
        large: 'w-6 h-6'
    };

    const handleRatingClick = async (rating) => {
        if (!isAuthenticated) {
            alert('Please login to rate products');
            return;
        }

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            
            const response = await axiosInstance.post('/reviews', {
                productId,
                rating,
                comment: reviewText || 'Great product!'
            });

            if (response.data.success) {
                setUserRating(rating);
                setShowReviewForm(false);
                setReviewText('');
                // Update parent component with new rating
                if (onRatingUpdate) {
                    onRatingUpdate(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            if (error.response?.status === 400) {
                alert(error.response.data.message || 'You have already rated this product');
            } else {
                alert('Failed to submit rating. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Display Rating */}
            <div className="flex items-center gap-2">
                <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`${starSizes[size]} ${
                                star <= Math.round(currentRating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                            } cursor-pointer transition-colors hover:scale-110`}
                            onClick={() => setShowReviewForm(true)}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-600">
                    {currentRating ? currentRating.toFixed(1) : '0.0'}
                    {reviewCount ? ` (${reviewCount} reviews)` : ' (No reviews yet)'}
                </span>
            </div>

            {/* User Rating (if logged in and has rated) */}
            {isAuthenticated && userRating > 0 && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Your rating:</span>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`${starSizes.small} ${
                                    star <= userRating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Rating Form Modal */}
            {showReviewForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#283618' }}>
                            Rate this Product
                        </h3>
                        
                        {/* Interactive Stars */}
                        <div className="flex justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-8 h-8 mx-1 cursor-pointer transition-all ${
                                        star <= (hoverRating || userRating)
                                            ? 'text-yellow-400 fill-current scale-110'
                                            : 'text-gray-300 hover:text-yellow-200'
                                    }`}
                                    onClick={() => setUserRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>

                        {/* Review Text */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                Review (optional)
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with this product..."
                                className="w-full px-3 py-2 border rounded-md resize-none"
                                rows={3}
                                style={{ borderColor: '#DDA15E' }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowReviewForm(false);
                                    setUserRating(0);
                                    setReviewText('');
                                }}
                                className="flex-1 px-4 py-2 border rounded-md hover:opacity-70 transition-all"
                                style={{ borderColor: '#DDA15E', color: '#283618' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRatingClick(userRating)}
                                disabled={userRating === 0 || isSubmitting}
                                className="flex-1 px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ backgroundColor: '#606C38' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatingComponent;
