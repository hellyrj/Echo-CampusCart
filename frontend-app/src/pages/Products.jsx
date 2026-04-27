import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductApi } from '../hooks/useProductApi';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Store all products for client-side filtering
    const [categories, setCategories] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    
    const { getProducts, searchProducts, loading: apiLoading } = useProductApi();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const handleVendorApplication = () => {
        navigate('/vendor/apply');
    };

    // Debounced search function
    const debouncedSearch = useCallback((value) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            setSearchTerm(value);
        }, 500); // Increased to 500ms delay for better performance
        
        setSearchTimeout(timeout);
    }, [searchTimeout]);

    useEffect(() => {
        loadProducts();
        loadCategories();
        loadUniversities();
    }, []);

    // Trigger client-side filtering when searchTerm, category, or university changes
    useEffect(() => {
        applyClientSideFilters();
    }, [searchTerm, selectedCategory, selectedUniversity, allProducts]);

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
            console.log('Loading categories from API...');
            // Fetch categories from API instead of hardcoded
            const response = await axiosInstance.get('/vendors/categories');
            console.log('Categories API response:', response.data);
            if (response.data.success) {
                const categoriesData = response.data.data || [];
                console.log('Categories loaded:', categoriesData);
                console.log('Categories length:', categoriesData.length);
                setCategories(categoriesData);
            } else {
                console.error('Failed to load categories:', response.data.message);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // Fallback to hardcoded categories if API fails
            const fallbackCategories = [
                "Stationery",
                "Food & Drinks", 
                "Printing Services",
                "Electronics",
                "Dorm Supplies",
                "Books"
            ];
            console.log('Using fallback categories:', fallbackCategories);
            setCategories(fallbackCategories);
        }
    };

    const loadUniversities = async () => {
        try {
            const response = await axiosInstance.get('/vendors/universities');
            console.log('Universities API response:', response.data); // Debug log
            if (response.data.success) {
                console.log('Universities data:', response.data.data); // Debug log
                setUniversities(response.data.data || []);
            } else {
                console.error('Failed to load universities:', response.data.message);
                setUniversities([]);
            }
        } catch (error) {
            console.error('Error loading universities:', error);
            setUniversities([]);
        }
    };

    const handleAddToCart = (product) => {
        if (!isAuthenticated) {
            alert('Please login to add items to cart');
            return;
        }
        // TODO: Implement cart functionality
        alert('Cart functionality coming soon!');
    };

    const loadProducts = async () => {
        try {
            setError(null);
            console.log('Loading all products...');
            const result = await getProducts();
            console.log('API Response:', result);
            if (result.success) {
                const productsData = result.data?.data || result.data || [];
                console.log('Products data:', productsData);
                console.log('First product structure:', productsData[0]);
                console.log('First product vendorId:', productsData[0]?.vendorId);
                console.log('First product vendorId universityNear:', productsData[0]?.vendorId?.universityNear);
                console.log('First product categories:', productsData[0]?.categories);
                console.log('First product category:', productsData[0]?.category);
                
                // Store all products for client-side filtering
                setAllProducts(Array.isArray(productsData) ? productsData : []);
                setProducts(Array.isArray(productsData) ? productsData : []);
            } else {
                console.error('Failed to load products:', result.message);
                setError(result.message || 'Failed to load products');
                setAllProducts([]);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
                if (error.response.status === 401) {
                    setError('Authentication required. The backend may require authentication for this endpoint.');
                } else if (error.response.status === 404) {
                    setError('Products endpoint not found. Is the backend running?');
                } else {
                    setError(error.response.data?.message || `Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Network error. Cannot connect to backend server. Is it running on http://localhost:5000?');
            } else {
                console.error('General error:', error.message);
                setError(error.message || 'Failed to load products');
            }
            setAllProducts([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedUniversity('');
        debouncedSearch('');
    };

    const applyClientSideFilters = () => {
        console.log('Applying client-side filters:', {
            searchTerm: searchTerm,
            selectedCategory,
            selectedUniversity,
            totalProducts: allProducts.length
        });
        
        let filteredProducts = [...allProducts];
        
        // If no filters, show all products
        if (!searchTerm.trim() && !selectedCategory && !selectedUniversity) {
            console.log('No filters applied, showing all products');
            setProducts(filteredProducts);
            return;
        }
        
        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            const beforeSearch = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                // Search in product name and description
                const nameMatch = product.name && product.name.toLowerCase().includes(searchLower);
                const descriptionMatch = product.description && product.description.toLowerCase().includes(searchLower);
                
                // Also search in vendor information if available
                let vendorMatch = false;
                if (product.vendorId) {
                    const vendorNameMatch = product.vendorId.storeName && product.vendorId.storeName.toLowerCase().includes(searchLower);
                    const vendorDescMatch = product.vendorId.description && product.vendorId.description.toLowerCase().includes(searchLower);
                    vendorMatch = vendorNameMatch || vendorDescMatch;
                }
                
                return nameMatch || descriptionMatch || vendorMatch;
            });
            console.log(`Search filter: "${searchTerm}" - ${beforeSearch} → ${filteredProducts.length} products`);
        }
        
        // Filter by category
        if (selectedCategory) {
            const beforeCategory = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                // Handle different category structures
                if (Array.isArray(product.categories)) {
                    return product.categories.some(cat => 
                        (typeof cat === 'string' ? cat : cat.name) === selectedCategory
                    );
                } else if (product.category) {
                    return product.category === selectedCategory;
                }
                return false;
            });
            console.log(`Category filter: "${selectedCategory}" - ${beforeCategory} → ${filteredProducts.length} products`);
        }
        
        // Filter by university
        if (selectedUniversity) {
            const beforeUniversity = filteredProducts.length;
            filteredProducts = filteredProducts.filter(product => {
                // Check if product has vendor with universityNear
                if (product.vendorId && product.vendorId.universityNear) {
                    console.log(`Checking university: ${product.vendorId.universityNear} === ${selectedUniversity}`);
                    return product.vendorId.universityNear === selectedUniversity;
                }
                // Also check if vendorId is just a string (not populated)
                else if (typeof product.vendorId === 'string') {
                    console.log('Product vendorId is not populated, skipping university filter for this product');
                    return false; // Can't filter if vendor not populated
                }
                console.log('Product has no vendorId or universityNear field');
                return false;
            });
            console.log(`University filter: "${selectedUniversity}" - ${beforeUniversity} → ${filteredProducts.length} products`);
        }
        
        console.log('Final filtered products:', filteredProducts.length);
        setProducts(filteredProducts);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">Error: {error}</div>
                    <button 
                        onClick={loadProducts}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
                    
                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Bar */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                                <input
                                    type="text"
                                    placeholder="Search by name or description..."
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            debouncedSearch(e.target.value);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            {/* Category Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        handleFilterChange();
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => {
                                        const categoryValue = typeof category === 'string' ? category : category.name || category;
                                        const categoryId = typeof category === 'string' ? category : category._id || category;
                                        return (
                                            <option key={categoryId} value={categoryValue}>
                                                {categoryValue}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            
                            {/* University Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                                <select
                                    value={selectedUniversity}
                                    onChange={(e) => {
                                        setSelectedUniversity(e.target.value);
                                        handleFilterChange();
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Universities</option>
                                    {universities.map((university) => {
                                        const universityValue = typeof university === 'string' ? university : university.name || university;
                                        const universityId = typeof university === 'string' ? university : university._id || university;
                                        return (
                                            <option key={universityId} value={universityValue}>
                                                {universityValue}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                        
                        {/* Clear Filters */}
                        <div className="flex justify-end items-center mt-4">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('');
                                    setSelectedUniversity('');
                                    debouncedSearch('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vendor Application Section for Logged-in Non-Vendor Users */}
                {isAuthenticated && user?.role !== 'vendor' && (
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg shadow-md p-6 mb-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-3">Want to Sell Your Products?</h3>
                            <p className="text-orange-100 mb-6">Join our marketplace and start selling to thousands of campus students</p>
                            <button
                                onClick={handleVendorApplication}
                                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Apply to Become a Vendor
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.isArray(products) && products.map((product, index) => {
                        console.log(`Product ${index} vendorId:`, product.vendorId);
                        return (
                        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                                <img
                                    src={product.images && product.images.length > 0 
                                        ? product.images[0].url 
                                        : 'https://via.placeholder.com/300x200?text=Product'}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                    }}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                                
                                {/* Vendor Information */}
                                {product.vendorId ? (
                                    <div className="mb-3 p-2 bg-gray-50 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Sold by</p>
                                                    {product.vendorId.storeName ? (
                                                        <Link 
                                                            to={`/vendor/${product.vendorId._id}`}
                                                            className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                                                        >
                                                            {product.vendorId.storeName}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm font-medium text-orange-600">
                                                            Vendor (ID: {product.vendorId._id})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {product.vendorId.deliveryAvailable && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Delivery
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 p-2 bg-gray-50 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Sold by</p>
                                                <span className="text-sm font-medium text-gray-600">
                                                    Vendor information loading...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-blue-600">${product.basePrice || product.price}</span>
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>

                {products.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
