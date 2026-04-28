import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVendorApi } from '../hooks/useVendorApi';
import { Search, Filter, X, Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

const VendorPublicPage = () => {
    const { vendorId } = useParams();
    const { getVendorDetails, getVendorProducts, getCategories } = useVendorApi();
    const { toggleWishlistItem, isProductInWishlist } = useWishlist();
    
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Debounced search function
    const debouncedSearch = useCallback((value) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            setSearchTerm(value);
        }, 300); // 300ms delay
        
        setSearchTimeout(timeout);
    }, [searchTimeout]);

    useEffect(() => {
        loadVendorData();
        loadCategories();
    }, [vendorId]);

    useEffect(() => {
        if (vendor) {
            loadVendorProducts();
        }
    }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy, sortOrder, vendor]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const loadCategories = async () => {
        try {
            console.log('Loading categories...');
            const response = await getCategories();
            console.log('Categories response:', response);
            const categoriesData = response?.data || response || [];
            console.log('Categories loaded:', categoriesData);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (err) {
            console.error('Failed to load categories:', err);
            setCategories([]);
        }
    };

    const loadVendorData = async () => {
        try {
            setLoading(true);
            
            console.log('Loading vendor data for:', vendorId);
            
            // Load vendor details only (products will be loaded separately with filters)
            const vendorData = await getVendorDetails(vendorId);
            
            console.log('Vendor data received:', vendorData);
            
            setVendor(vendorData?.data || vendorData);
            setError(null);
        } catch (err) {
            setError('Failed to load vendor information');
            console.error('Error loading vendor data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadVendorProducts = async () => {
        if (!vendor) {
            console.log('No vendor available, skipping product load');
            return;
        }
        
        try {
            setLoading(true);
            
            // Only apply filters if they have values
            const filters = {};
            
            if (searchTerm && searchTerm.trim()) {
                filters.search = searchTerm.trim();
            }
            
            if (selectedCategory) {
                filters.category = selectedCategory;
            }
            
            if (minPrice && minPrice.trim()) {
                const price = parseFloat(minPrice);
                if (!isNaN(price) && price >= 0) {
                    filters.minPrice = price;
                }
            }
            
            if (maxPrice && maxPrice.trim()) {
                const price = parseFloat(maxPrice);
                if (!isNaN(price) && price >= 0) {
                    filters.maxPrice = price;
                }
            }
            
            if (sortBy) {
                filters.sortBy = sortBy;
            }
            
            if (sortOrder) {
                filters.sortOrder = sortOrder;
            }
            
            console.log('Loading products for vendor:', vendorId);
            console.log('With filters:', filters);
            
            const productsData = await getVendorProducts(vendorId, filters);
            
            console.log('Raw API response:', productsData);
            console.log('Products array:', productsData?.data || productsData);
            console.log('Products length:', (productsData?.data || productsData)?.length || 0);
            
            // Handle different response formats
            const products = productsData?.data || productsData || [];
            setProducts(Array.isArray(products) ? products : []);
            
        } catch (err) {
            console.error('Error loading products:', err);
            console.error('Error response:', err.response?.data);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('name');
        setSortOrder('asc');
        // Clear the search input by triggering a debounced search with empty value
        debouncedSearch('');
    };

    const hasActiveFilters = searchTerm || selectedCategory || minPrice || maxPrice;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
                        <div className="h-32 bg-gray-300 rounded mb-8"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-64 bg-gray-300 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Vendor Not Found
                        </h1>
                        <p className="text-gray-600 mb-8">
                            {error || 'This vendor page does not exist or has been removed.'}
                        </p>
                        <Link
                            to="/products"
                            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                        >
                            Browse All Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex mb-8" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                        <li>
                            <Link to="/" className="text-gray-500 hover:text-gray-700">
                                Home
                            </Link>
                        </li>
                        <li>
                            <span className="text-gray-400">/</span>
                        </li>
                        <li>
                            <Link to="/products" className="text-gray-500 hover:text-gray-700">
                                Products
                            </Link>
                        </li>
                        <li>
                            <span className="text-gray-400">/</span>
                        </li>
                        <li className="text-gray-900 font-medium">
                            {vendor.storeName}
                        </li>
                    </ol>
                </nav>

                {/* Vendor Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {vendor.storeName}
                            </h1>
                            <p className="text-gray-600 mb-4 max-w-2xl">
                                {vendor.description}
                            </p>
                            
                            {/* Vendor Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                {vendor.locationDetails?.city && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {vendor.locationDetails.city}, {vendor.locationDetails.country}
                                    </div>
                                )}
                                
                                {vendor.phone && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {vendor.phone}
                                    </div>
                                )}
                                
                                {vendor.universityNear && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                        Near {vendor.universityNear}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Delivery Status */}
                        <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <div className="flex gap-2 mb-2">
                                {vendor.deliveryAvailable && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104-0m-4 0a2 2 0 110 4m0-4v2m0 4v2m0-4h2" />
                                        </svg>
                                        Delivery Available
                                    </span>
                                )}
                                
                                {vendor.pickupAvailable && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Pickup Available
                                    </span>
                                )}
                            </div>
                            
                            {vendor.deliveryAvailable && vendor.deliveryRadius && (
                                <p className="text-xs text-gray-500">
                                    Delivery radius: {vendor.deliveryRadius}m
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Products ({products.length})
                            </h2>
                            
                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search products by name or description..."
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            debouncedSearch(e.target.value);
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        {/* Filter Button */}
                        <div className="flex gap-2 mb-4 lg:mb-0">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                                        Active
                                    </span>
                                )}
                            </button>
                            
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => {
                                                console.log('Category changed to:', e.target.value);
                                                setSelectedCategory(e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {categories.length === 0 && (
                                            <p className="text-xs text-gray-500 mt-1">No categories available</p>
                                        )}
                                    </div>

                                    {/* Min Price Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Min Price (ETB)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={minPrice}
                                            onChange={(e) => {
                                                console.log('Min price changed to:', e.target.value);
                                                setMinPrice(e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Max Price Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Price (ETB)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="999999"
                                            value={maxPrice}
                                            onChange={(e) => {
                                                console.log('Max price changed to:', e.target.value);
                                                setMaxPrice(e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sort By
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={sortBy}
                                                onChange={(e) => {
                                                    console.log('Sort by changed to:', e.target.value);
                                                    setSortBy(e.target.value);
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option value="name">Name</option>
                                                <option value="basePrice">Price</option>
                                                <option value="createdAt">Date</option>
                                            </select>
                                            <select
                                                value={sortOrder}
                                                onChange={(e) => {
                                                    console.log('Sort order changed to:', e.target.value);
                                                    setSortOrder(e.target.value);
                                                }}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option value="asc">A-Z</option>
                                                <option value="desc">Z-A</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {products.length === 0 && !loading && (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {hasActiveFilters ? 'No Products Found' : 'No Products Available'}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {hasActiveFilters 
                                    ? 'Try adjusting your filters or search terms.' 
                                    : 'This vendor hasn\'t added any products yet. Check back later!'
                                }
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                                    {/* Wishlist Button */}
                                    <button
                                        onClick={() => toggleWishlistItem(product._id)}
                                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md text-red-500 hover:bg-red-50 transition-colors duration-200"
                                        title={isProductInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        <Heart className={`w-5 h-5 ${isProductInWishlist(product._id) ? 'fill-current text-red-600' : 'text-red-400'}`} />
                                    </button>
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-48">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0].url || `/uploads/${product.images[0]}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200"><span class="text-gray-400 text-sm font-medium">No Image</span></div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                                <span className="text-gray-400 text-sm font-medium">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                        
                                        {/* Categories */}
                                        {product.categories && product.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {product.categories.slice(0, 2).map((category, index) => (
                                                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        {typeof category === 'string' ? category : category.name}
                                                    </span>
                                                ))}
                                                {product.categories.length > 2 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{product.categories.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-orange-600">
                                                ETB {product.basePrice || product.price}
                                            </span>
                                            {product.inventory?.totalStock > 0 ? (
                                                <span className="text-xs text-green-600 font-medium">
                                                    In Stock ({product.inventory.totalStock})
                                                </span>
                                            ) : (
                                                <span className="text-xs text-red-600 font-medium">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorPublicPage;
