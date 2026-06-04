import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Check, Package, X, Store } from 'lucide-react';
import RatingComponent from '../components/RatingComponent';

const Wishlist = () => {
    const { wishlist, loading, error, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart, removeFromCart, updateProductQuantity, isInCart, loading: cartLoading } = useCart();
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const [addingToCart, setAddingToCart] = useState({});
    const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });

    const showToastMessage = (message, type = 'success') => {
        setShowToast({ show: true, message, type });
        setTimeout(() => {
            setShowToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();
        
        if (!isAuthenticated) {
            showToastMessage('Please login to add items to cart', 'error');
            return;
        }
        
        setAddingToCart(prev => ({ ...prev, [product._id]: true }));
        
        try {
            await addToCart(product._id, 1);
            showToastMessage('Item added to cart!', 'success');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            showToastMessage(error.response?.data?.message || 'Failed to add to cart', 'error');
        } finally {
            setTimeout(() => {
                setAddingToCart(prev => ({ ...prev, [product._id]: false }));
            }, 500);
        }
    };

    const handleRemoveFromCart = async (productId, e) => {
        e.stopPropagation();
        
        setAddingToCart(prev => ({ ...prev, [productId]: true }));
        
        try {
            await updateProductQuantity(productId, 0);
            showToastMessage('Item removed from cart', 'success');
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            showToastMessage('Failed to remove from cart', 'error');
        } finally {
            setTimeout(() => {
                setAddingToCart(prev => ({ ...prev, [productId]: false }));
            }, 500);
        }
    };

    const handleRemoveItem = async (productId, e) => {
        e.stopPropagation();
        
        try {
            await removeFromWishlist(productId);
            showToastMessage('Item removed from wishlist', 'success');
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            showToastMessage('Failed to remove from wishlist', 'error');
        }
    };

    const handleClearWishlist = async () => {
        try {
            await clearWishlist();
            showToastMessage('Wishlist cleared', 'success');
        } catch (error) {
            console.error('Failed to clear wishlist:', error);
            showToastMessage('Failed to clear wishlist', 'error');
        }
    };

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-3" style={{ color: theme.text.primary }}>Please Login</h2>
                        <p className="mb-6" style={{ color: theme.text.secondary }}>
                            You need to be logged in to view and manage your wishlist.
                        </p>
                        <div className="space-y-3">
                            <Link
                                to="/login"
                                className="block w-full text-white text-center px-6 py-3 rounded-md transition-colors"
                                style={{ backgroundColor: theme.secondary }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="block w-full text-white text-center px-6 py-3 rounded-md transition-colors"
                                style={{ backgroundColor: theme.secondary }}
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center py-8" style={{ backgroundColor: theme.background }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: theme.secondary }}></div>
                    <p style={{ color: theme.text.primary }}>Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: theme.background }}>
            {/* Toast Notification */}
            {showToast.show && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                    <div className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
                        showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                        {showToast.type === 'success' ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <Heart className="w-5 h-5" />
                        )}
                        {showToast.message}
                    </div>
                </div>
            )}

            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/products"
                                className="hover:opacity-70 transition-opacity"
                                title="Back to Products"
                            >
                                <ArrowLeft className="w-6 h-6" style={{ color: theme.text.primary }} />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
                                    My Wishlist
                                    {wishlist.length > 0 && (
                                        <span className="ml-3 text-lg font-normal" style={{ color: theme.text.secondary }}>
                                            ({wishlist.length} items)
                                        </span>
                                    )}
                                </h1>
                            </div>
                        </div>
                        
                        {wishlist.length > 0 && (
                            <button
                                onClick={handleClearWishlist}
                                className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors font-medium"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}
                </div>

                {/* Empty Wishlist */}
                {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-lg shadow-md p-12 max-w-2xl mx-auto">
                            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold mb-3" style={{ color: theme.text.primary }}>
                                Your Wishlist is Empty
                            </h2>
                            <p className="mb-8 text-lg" style={{ color: theme.text.secondary }}>
                                Start exploring our products and save your favorites here!
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center text-white px-8 py-3 rounded-md transition-all hover:scale-105 text-lg font-medium"
                                style={{ backgroundColor: theme.secondary }}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Browse Products
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Wishlist Grid - Same styling as Products page */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((product) => {
                            const inCart = isInCart(product._id);
                            const isAdding = addingToCart[product._id];
                            
                            return (
                                <div 
                                    key={product._id}
                                    onClick={() => window.location.href = `/products/${product._id}`}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden flex flex-col"
                                >
                                    <div className="relative">
                                        <div className="aspect-square bg-gray-200">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0].url || product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-2"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg">
                                                    <span className="text-gray-400 text-sm font-medium">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Remove from Wishlist Button */}
                                        <button
                                            onClick={(e) => handleRemoveItem(product._id, e)}
                                            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-red-100 transition-all shadow-md"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                    
                                    <div className="p-3 flex flex-col flex-grow">
                                        <h3 className="text-base font-semibold mb-1 line-clamp-2" style={{ color: theme.text.primary }}>
                                            {product.name}
                                        </h3>
                                        
                                        {product.vendorId ? (
                                            <div className="mb-1.5 p-1 rounded-md" style={{ backgroundColor: theme.surface }}>
                                                <div className="flex items-center space-x-1.5">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.secondary}20` }}>
                                                        <Store className="w-3 h-3" style={{ color: theme.text.primary }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {product.vendorId._id ? (
                                                            <Link 
                                                                to={`/vendor/${product.vendorId._id}`}
                                                                className="text-xs font-medium hover:opacity-70 truncate block"
                                                                style={{ color: theme.text.primary }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {product.vendorId.storeName || 'Unknown Vendor'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs font-medium truncate block" style={{ color: theme.text.primary }}>
                                                                {product.vendorId.storeName || 'Unknown Vendor'}
                                                            </span>
                                                        )}
                                                        {product.vendorId.universityNear && (
                                                            <span className="text-[10px] block truncate" style={{ color: theme.text.secondary }}>
                                                                📍 {product.vendorId.universityNear}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-1.5 p-1 rounded-md" style={{ backgroundColor: theme.surface }}>
                                                <div className="flex items-center space-x-1.5">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.secondary}20` }}>
                                                        <Store className="w-3 h-3" style={{ color: theme.text.primary }} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium" style={{ color: theme.text.primary }}>
                                                            Vendor info...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Inventory Status */}
                                        {product.inventory && (
                                            <div className="mb-1.5">
                                                <div className={'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ' + (
                                                    product.inventory.totalStock > 0 
                                                        ? 'bg-green-50 text-green-700 border border-green-200' 
                                                        : 'bg-red-50 text-red-700 border border-red-200'
                                                )}>
                                                    {product.inventory.totalStock > 0 ? (
                                                        <>
                                                            <Package className="w-3 h-3" />
                                                            <span>{product.inventory.totalStock} in stock</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="w-3 h-3" />
                                                            <span>Out of stock</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Rating and Stock Status Side by Side */}
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                                                <RatingComponent
                                                    productId={product._id}
                                                    currentRating={product.averageRating}
                                                    reviewCount={product.reviewCount}
                                                    onRatingUpdate={() => {}}
                                                    size="small"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Price and Cart Actions */}
                                        <div className="flex items-center justify-between mt-auto pt-1">
                                            <span className="text-lg font-bold" style={{ color: theme.text.primary }}>
                                                ${product.basePrice || product.price || 0}
                                            </span>
                                            
                                            {cartLoading && isAdding ? (
                                                <button
                                                    disabled
                                                    className="px-2 py-1 rounded-md flex items-center gap-1 text-xs opacity-70"
                                                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                                >
                                                    <div className="w-3 h-3 border-2 border-white rounded-full animate-spin border-t-transparent" />
                                                    {inCart ? 'Removing...' : 'Adding...'}
                                                </button>
                                            ) : inCart ? (
                                                <button
                                                    onClick={(e) => handleRemoveFromCart(product._id, e)}
                                                    disabled={isAdding}
                                                    className="px-2 py-1 rounded-md transition-all duration-200 hover:scale-105 flex items-center gap-1 text-xs disabled:opacity-50"
                                                    style={{ backgroundColor: '#10b981', color: 'white' }}
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Added
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleAddToCart(product, e)}
                                                    disabled={isAdding || (product.inventory && product.inventory.totalStock === 0)}
                                                    className="px-2 py-1 rounded-md transition-all duration-200 hover:scale-105 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                                >
                                                    <ShoppingCart className="w-3 h-3" />
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;