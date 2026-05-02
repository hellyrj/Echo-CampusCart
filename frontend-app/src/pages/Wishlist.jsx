import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

const Wishlist = () => {
    const { wishlist, loading, error, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromWishlist(productId);
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    const handleClearWishlist = async () => {
        try {
            await clearWishlist();
        } catch (error) {
            console.error('Failed to clear wishlist:', error);
        }
    };

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Please Login</h2>
                        <p className="text-gray-600 mb-6">
                            You need to be logged in to view and manage your wishlist.
                        </p>
                        <div className="space-y-3">
                            <Link
                                to="/login"
                                className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="block w-full bg-white text-blue-600 text-center px-6 py-3 rounded-md border border-blue-600 hover:bg-blue-50 transition-colors"
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/products"
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Products
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    My Wishlist
                                    {wishlist.length > 0 && (
                                        <span className="ml-3 text-lg font-normal text-gray-500">
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
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                Your Wishlist is Empty
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                Start exploring our products and save your favorites here!
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Browse Products
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Wishlist Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((product, index) => {
                            const productKey = product._id || `wishlist-item-${index}`;
                            return (
                                <div 
                                    key={productKey} 
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all group relative"
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveItem(product._id)}
                                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 hover:bg-red-100 transition-all shadow-md opacity-0 group-hover:opacity-100"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>

                                    {/* Product Image */}
                                    <Link to={`/products/${product._id}`} className="block">
                                        <div className="aspect-w-16 aspect-h-12 bg-gray-200 overflow-hidden h-48">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0].url || `/uploads/${product.images[0]}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Product Details */}
                                    <div className="p-4">
                                        <Link to={`/products/${product._id}`}>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.description}
                                        </p>

                                        {/* Vendor Info */}
                                        {product.vendorId && product.vendorId.storeName && (
                                            <div className="mb-3 p-2 bg-gray-50 rounded-md">
                                                <p className="text-xs text-gray-500">Sold by</p>
                                                <Link 
                                                    to={`/vendor/${product.vendorId._id}`}
                                                    className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                                                >
                                                    {product.vendorId.storeName}
                                                </Link>
                                            </div>
                                        )}

                                        {/* Price and Actions */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-blue-600">
                                                ${product.basePrice || product.price || 0}
                                            </span>
                                            <button 
                                                onClick={() => handleAddToCart(product._id)}
                                                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center"
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-1" />
                                                Add to Cart
                                            </button>
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
