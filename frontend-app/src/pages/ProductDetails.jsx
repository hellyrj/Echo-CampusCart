import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProductApi } from '../hooks/useProductApi';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingCart, ArrowLeft, Package, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetails = () => {
    const { productId } = useParams();
    console.log('ProductDetails component mounted with productId:', productId);
    
    const { getProduct } = useProductApi();
    const { toggleWishlistItem, isProductInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Helper function to get image URL (same as Products page)
    const getImageUrl = (image) => {
        if (!image) return 'https://via.placeholder.com/600x600/e5e7eb/6b7280?text=No+Image';
        
        if (image.url) return image.url;
        if (image.startsWith('http')) return image;
        if (image.startsWith('/')) return `http://localhost:5000${image}`;
        return `http://localhost:5000/uploads/${image}`;
    };


    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading product with ID:', productId);
            const result = await getProduct(productId);
            
            console.log('Product API result:', result);
            
            if (result.success) {
                const productData = result.data.data; // Extract actual product data
                console.log('Product data loaded:', productData);
                console.log('Product keys:', Object.keys(productData));
                console.log('Product images:', productData.images);
                console.log('Product vendorId:', productData.vendorId);
                console.log('Full product structure:', JSON.stringify(productData, null, 2));
                setProduct(productData);
                
                // Debug: Check product state immediately after setting
                setTimeout(() => {
                    console.log('Product state after setProduct:', product);
                    console.log('Product state images:', product?.images);
                    console.log('Product state vendorId:', product?.vendorId);
                }, 100);
            } else {
                console.error('Product load failed:', result.message);
                setError(result.message || 'Failed to load product');
            }
        } catch (err) {
            console.error('Product load error:', err);
            setError(err.response?.data?.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            alert('Please login to add items to cart');
            return;
        }

        try {
            await addToCart(product._id, quantity);
            alert('Product added to cart successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            alert('Please login to add items to wishlist');
            return;
        }

        try {
            await toggleWishlistItem(product._id);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const nextImage = () => {
        if (product.images && product.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }
    };

    const prevImage = () => {
        if (product.images && product.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">Error: {error}</div>
                    <button 
                        onClick={loadProduct}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-600 text-lg mb-4">Product not found</div>
                    <Link 
                        to="/products"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
                    >
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Products
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Images */}
                        <div className="p-6">
                            <div className="relative">
                                {/* Main Image */}
                                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(product.images[currentImageIndex])}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/600x600/e5e7eb/6b7280?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                            <span className="text-gray-400 text-lg font-medium">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Carousel Controls - Only show if multiple images */}
                                {product.images && product.images.length > 1 && (
                                    <>
                                        {/* Previous Button */}
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        
                                        {/* Next Button */}
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                        
                                        {/* Image Indicators */}
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                            {product.images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => goToImage(index)}
                                                    className={'w-3 h-3 rounded-full transition-all ' + (
                                                        index === currentImageIndex
                                                            ? 'bg-white w-8'
                                                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        
                                        {/* Image Counter */}
                                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                                            {currentImageIndex + 1} / {product.images.length}
                                        </div>
                                    </>
                                )}

                                {/* Wishlist Button */}
                                <button
                                    onClick={handleWishlistToggle}
                                    className={'absolute top-4 right-4 p-3 rounded-full transition-colors ' + (
                                        isProductInWishlist(product._id) 
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                            : 'bg-white text-gray-400 hover:bg-gray-200'
                                    )}
                                >
                                    <Heart className={'w-6 h-6 ' + (isProductInWishlist(product._id) ? 'fill-current' : '')} />
                                </button>
                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images && product.images.length > 1 && (
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToImage(index)}
                                            className={'aspect-square rounded-lg overflow-hidden border-2 transition-all ' + (
                                                index === currentImageIndex 
                                                    ? 'border-blue-500' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            )}
                                        >
                                            <img
                                                src={getImageUrl(image)}
                                                alt={product.name + ' ' + (index + 1)}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/150x150/e5e7eb/6b7280?text=No+Image';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="p-6">
                            <div className="mb-6">
                                {/* Product Name */}
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                                
                                {/* Price and Rating */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-3xl font-bold text-blue-600">
                                        ${product.basePrice || product.price}
                                    </div>
                                    {product.averageRating > 0 && (
                                        <div className="flex items-center">
                                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-gray-600">
                                                {product.averageRating.toFixed(1)} ({product.reviewCount})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Category Tags */}
                                {product.categories && product.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {product.categories.map((category, index) => (
                                            <span 
                                                key={index} 
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                            >
                                                {typeof category === 'string' ? category : category.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Stock Status */}
                                {product.inventory && (
                                    <div className="mb-4">
                                        <span className={'text-sm font-medium ' + (
                                            product.inventory.totalStock > 0 ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            {product.inventory.totalStock > 0 
                                                ? product.inventory.totalStock + ' in stock' 
                                                : 'Out of stock'}
                                        </span>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {product.description || 'No description available'}
                                    </p>
                                </div>

                                {/* Vendor Information */}
                                {product.vendorId && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Vendor Information</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {product.vendorId._id ? (
                                                    <Link 
                                                        to={`/vendor/${product.vendorId._id}`}
                                                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                    >
                                                        {product.vendorId.storeName || 'Unknown Vendor'}
                                                    </Link>
                                                ) : (
                                                    <span className="text-blue-600 font-medium">
                                                        {product.vendorId.storeName || 'Unknown Vendor'}
                                                    </span>
                                                )}
                                                {product.vendorId.universityNear && (
                                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {product.vendorId.universityNear}
                                                    </div>
                                                )}
                                                <div className="flex gap-2 mt-2">
                                                    {product.vendorId.deliveryAvailable && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Delivery Available
                                                        </span>
                                                    )}
                                                    {product.vendorId.pickupAvailable && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Pickup Available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quantity and Add to Cart */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                id="quantity"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                                            />
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.inventory && product.inventory.totalStock <= 0}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
